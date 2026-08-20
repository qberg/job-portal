import { redirect } from "next/navigation";
import { Suspense } from "react";
import { citizenApi } from "../../../../shared/api/orpc.server";
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
  const [id] = await Promise.all([citizenApi.citizenMe()]);
  return <h1>Your Id is {id.id}</h1>;
}
