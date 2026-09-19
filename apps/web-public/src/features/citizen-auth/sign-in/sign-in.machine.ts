import { is, pipe, regex, string } from "valibot";
import type { SnapshotFrom } from "xstate";
import { assign, fromPromise, setup } from "xstate";

const PHONE_SCHEMA = pipe(string(), regex(/^\d{10}$/));
const OTP_SCHEMA = pipe(string(), regex(/^\d{6}$/));

// Stable codes; the UI owns the localized copy (i18n seam).
export type SignInError =
  | "invalid_phone"
  | "send_failed"
  | "send_cooldown"
  | "send_daily_cap"
  | "send_ip_cap"
  | "invalid_otp"
  | "verify_failed"
  | "otp_incorrect"
  | "otp_expired"
  | "otp_attempts"
  | "network";

// Code + wait travel as one value so a stale retryAfterSecs can never outlive its error.
export type SignInFailure = {
  code: SignInError;
  retryAfterSecs: number | null;
};

// Thrown by the sendOtp actor when the API throttled the send (429); the machine
// maps it to a SignInFailure. Kept here so machine + adapter share one vocabulary.
export class OtpSendDenied extends Error {
  readonly reason: "cooldown" | "daily_cap" | "ip_cap";
  readonly retryAfterSecs: number;

  constructor(
    reason: "cooldown" | "daily_cap" | "ip_cap",
    retryAfterSecs: number
  ) {
    super(`otp_send_${reason}`);
    this.reason = reason;
    this.retryAfterSecs = retryAfterSecs;
  }
}

// use-sign-in.ts throws this once a raw API/network failure resolves to a stable code.
export class AuthCallError extends Error {
  readonly code: SignInError;

  constructor(code: SignInError, options?: ErrorOptions) {
    super(`auth_call_${code}`, options);
    this.code = code;
  }
}

function fail(code: SignInError): SignInFailure {
  return { code, retryAfterSecs: null };
}

const SEND_DENY_CODE: Record<OtpSendDenied["reason"], SignInError> = {
  cooldown: "send_cooldown",
  daily_cap: "send_daily_cap",
  ip_cap: "send_ip_cap",
};

function sendFailure(error: unknown): SignInFailure {
  if (error instanceof OtpSendDenied) {
    return {
      code: SEND_DENY_CODE[error.reason],
      retryAfterSecs: error.retryAfterSecs,
    };
  }
  if (error instanceof AuthCallError) {
    return fail(error.code);
  }
  return fail("send_failed");
}

function verifyFailure(error: unknown): SignInFailure {
  if (error instanceof AuthCallError) {
    return fail(error.code);
  }
  return fail("verify_failed");
}

export type SignInContext = {
  phone: string;
  otp: string;
  error: SignInFailure | null;
  // Bumps on each successful OTP send (first + resend); drives the resend cooldown.
  otpSendCount: number;
};

// Pure machine, actors/actions are stubs; inject real impls via provide() in use-sign-in.ts.
export const signInMachine = setup({
  actions: {
    countSend: assign({
      error: () => null,
      otpSendCount: ({ context }) => context.otpSendCount + 1,
    }),
    navigateToMe: () => {
      throw new Error(
        "[signInMachine] navigateToMe action must be provided via provide()"
      );
    },
  },
  actors: {
    sendOtp: fromPromise<void, { phone: string }>(() => {
      throw new Error(
        "[signInMachine] sendOtp actor must be provided via provide()"
      );
    }),
    verifyOtp: fromPromise<void, { phone: string; otp: string }>(() => {
      throw new Error(
        "[signInMachine] verifyOtp actor must be provided via provide()"
      );
    }),
  },
  types: {
    context: {} as SignInContext,
    events: {} as
      | { type: "SUBMIT_PHONE"; phone: string }
      | { type: "SUBMIT_OTP"; otp: string }
      | { type: "RESEND" }
      | { type: "EDIT_PHONE" },
  },
}).createMachine({
  context: { error: null, otp: "", otpSendCount: 0, phone: "" },
  id: "citizen-sign-in",
  initial: "entering_phone",
  states: {
    entering_phone: {
      on: {
        SUBMIT_PHONE: [
          {
            actions: assign({
              error: () => fail("invalid_phone"),
              phone: ({ event }) => event.phone,
            }),
            // guard: invalid phone → stay, set error
            guard: ({ event }) => !is(PHONE_SCHEMA, event.phone),
          },
          {
            actions: assign({
              error: () => null,
              phone: ({ event }) => event.phone,
            }),
            // valid → store phone, transition to actor invocation
            target: "submitting_phone",
          },
        ],
      },
    },
    // OTP phase: stays mounted across a resend (resending is a child, not a
    // sibling round-trip through submitting_phone) — UI reads matches("otp_step").
    otp_step: {
      initial: "entering",
      states: {
        entering: {
          on: {
            EDIT_PHONE: {
              // Clear OTP + error; phone preserved in context, form resets locally.
              actions: assign({ error: () => null, otp: () => "" }),
              target: "#citizen-sign-in.entering_phone",
            },
            RESEND: { target: "resending" },
            SUBMIT_OTP: [
              {
                actions: assign({
                  error: () => fail("invalid_otp"),
                  otp: ({ event }) => event.otp,
                }),
                guard: ({ event }) => !is(OTP_SCHEMA, event.otp),
              },
              {
                actions: assign({
                  error: () => null,
                  otp: ({ event }) => event.otp,
                }),
                target: "verifying",
              },
            ],
          },
        },
        resending: {
          invoke: {
            input: ({ context }) => ({ phone: context.phone }),
            onDone: { actions: "countSend", target: "entering" },
            onError: {
              actions: assign({
                error: ({ event }) => sendFailure(event.error),
              }),
              target: "entering",
            },
            src: "sendOtp",
          },
        },
        verifying: {
          invoke: {
            input: ({ context }) => ({
              otp: context.otp,
              phone: context.phone,
            }),
            onDone: {
              actions: "navigateToMe",
              target: "#citizen-sign-in.success",
            },
            onError: {
              actions: assign({
                error: ({ event }) => verifyFailure(event.error),
              }),
              target: "entering",
            },
            src: "verifyOtp",
          },
        },
      },
    },
    // First-send phase: phone field still owns the screen ("Sending…").
    submitting_phone: {
      invoke: {
        input: ({ context }) => ({ phone: context.phone }),
        onDone: { actions: "countSend", target: "otp_step" },
        onError: {
          actions: assign({ error: ({ event }) => sendFailure(event.error) }),
          target: "entering_phone",
        },
        src: "sendOtp",
      },
    },
    success: { type: "final" },
  },
});

export type SignInPhase =
  | "phone"
  | "sending"
  | "otp"
  | "resending"
  | "verifying";

// Single discriminant the UI switches on — no scattered booleans (FSM is truth).
export function signInPhase(
  snapshot: SnapshotFrom<typeof signInMachine>
): SignInPhase {
  if (snapshot.matches("submitting_phone")) {
    return "sending";
  }
  if (snapshot.matches({ otp_step: "resending" })) {
    return "resending";
  }
  // success is terminal but transient (navigateToMe redirects); hold the
  // verifying view so the phone step never flashes between verify and redirect.
  if (
    snapshot.matches({ otp_step: "verifying" }) ||
    snapshot.matches("success")
  ) {
    return "verifying";
  }
  if (snapshot.matches("otp_step")) {
    return "otp";
  }
  return "phone";
}
