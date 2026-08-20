import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SignInForm } from "../../../../features/citizen-auth/sign-in/sign-in-form";
import { safeRedirectTarget } from "../../../../shared/auth/redirect";
import { resolveCitizenSession } from "../../../../shared/auth/session";

type SignInSearchParams = Promise<{ redirect?: string }>;

export default async function SignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: SignInSearchParams;
}) {
  const { locale } = await params;
  return (
    <Suspense fallback={null}>
      <AuthGate locale={locale} searchParams={searchParams} />
    </Suspense>
  );
}

// Returning sessions redirect straight through (honoring `?redirect=`, the same
// destination the sign-in form pushes to post-verify); unauthenticated renders the form.
async function AuthGate({
  locale,
  searchParams,
}: {
  locale: string;
  searchParams: SignInSearchParams;
}) {
  const { redirect: redirectParam } = await searchParams;
  const target = safeRedirectTarget(redirectParam, `/${locale}/portal/me`);
  if (await resolveCitizenSession()) {
    redirect(target);
  }
  return <SignInForm />;
}
