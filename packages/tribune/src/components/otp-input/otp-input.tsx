"use client";

import { OTPField } from "@base-ui/react/otp-field";
import { cn } from "../../lib/utils";
import "./otp-input.css";

type OtpInputProps = {
  "aria-label"?: string;
  autoFocus?: boolean;
  className?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  disabled?: boolean;
  id?: string;
  /** Red error border (expired/wrong code). */
  invalid?: boolean;
  /** Number of slots. */
  length: number;
  name?: string;
  onChange?: (value: string) => void;
  /** Fires when all `length` slots are filled. */
  onComplete?: (value: string) => void;
  /** Controlled value. */
  value?: string;
};

export function OtpInput({
  length,
  value,
  defaultValue,
  onChange,
  onComplete,
  autoFocus = false,
  disabled,
  invalid,
  name,
  id,
  className,
  "aria-label": ariaLabel,
}: OtpInputProps) {
  return (
    <OTPField.Root
      className={cn("tbn-otp", className)}
      data-invalid={invalid || undefined}
      disabled={disabled}
      length={length}
      {...(value === undefined ? {} : { value })}
      {...(defaultValue === undefined ? {} : { defaultValue })}
      {...(onChange ? { onValueChange: (next: string) => onChange(next) } : {})}
      {...(onComplete
        ? { onValueComplete: (next: string) => onComplete(next) }
        : {})}
      {...(name === undefined ? {} : { name })}
      {...(id === undefined ? {} : { id })}
      {...(ariaLabel === undefined ? {} : { "aria-label": ariaLabel })}
    >
      {Array.from({ length }, (_, index) => (
        <OTPField.Input
          autoFocus={index === 0 && autoFocus}
          className="tbn-otp-input"
          data-invalid={invalid || undefined}
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length slot grid, index IS the identity
          key={index}
          placeholder="0"
        />
      ))}
    </OTPField.Root>
  );
}
