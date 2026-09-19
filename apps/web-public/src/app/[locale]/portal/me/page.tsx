import { Trans } from "@lingui/react/macro";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { resolveCitizenSession } from "../../../../shared/auth/session";

export default function CitizenProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <ProfileGate params={params} />
    </Suspense>
  );
}

async function ProfileGate({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const citizen = await resolveCitizenSession();
  if (!citizen) {
    redirect(`/${locale}/portal/sign-in`);
  }
  return (
    <h1 data-testid="citizen-id">
      <Trans>Your Id is {citizen.id}</Trans>
    </h1>
  );
}
