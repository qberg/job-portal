// import { ROUTE_REGISTRY } from "@jp/cms/route-registry";
// import { Container } from "@jp/tribune/components/container";
// import { Skeleton } from "@jp/tribune/components/skeleton";
// import { redirect } from "next/navigation";
// import { createLoader, type SearchParams } from "nuqs/server";
// import { Suspense } from "react";
// import { citizenApi } from "../../../shared/api/orpc.server";
// import { resolveCitizenSession } from "../../../shared/auth/session";
// import { CITIZEN_PAGE_SIZE } from "../../../views/dashboard/config/pagination";
// import { DashboardView } from "../../../views/dashboard/dashboard-view";
// import {
//   filterParsers,
//   toFilterParams,
// } from "../../../views/dashboard/model/dashboard-filter";

// const loadFilter = createLoader(filterParsers);

// export default async function PortalDashboardPage({
//   params,
//   searchParams,
// }: {
//   params: Promise<{ locale: string }>;
//   searchParams: Promise<SearchParams>;
// }) {
//   const { locale } = await params;
//   return (
//     <Suspense fallback={<DashboardSkeleton />}>
//       <DashboardData locale={locale} searchParams={searchParams} />
//     </Suspense>
//   );
// }

// async function DashboardData({
//   locale,
//   searchParams,
// }: {
//   locale: string;
//   searchParams: Promise<SearchParams>;
// }) {
//   const citizen = await resolveCitizenSession();
//   if (!citizen) {
//     redirect(ROUTE_REGISTRY.citizenSignIn.path(locale));
//   }

//   const { q, bucket } = await loadFilter(searchParams);
//   const [stats, page, categories, delta] = await Promise.all([
//     citizenApi.citizenPetitionStatsMine(),
//     citizenApi.citizenPetitionListMine({
//       limit: CITIZEN_PAGE_SIZE,
//       locale,
//       ...toFilterParams(q, bucket),
//     }),
//     citizenApi.citizenIssueCategoryList({ locale }),
//     citizenApi.citizenDashboardDelta(),
//   ]);

//   return (
//     <DashboardView
//       categories={categories}
//       changedPetitionIds={delta.changedPetitionIds}
//       citizenName={null}
//       date={new Date().toISOString()}
//       initialFilter={{ q, bucket }}
//       initialPage={page}
//       stats={stats}
//     />
//   );
// }

// function DashboardSkeleton() {
//   return (
//     <div className="flex min-h-0 flex-1 flex-col">
//       <div className="bg-tbn-bg-surface-tertiary">
//         <Container className="px-5 py-6 md:px-0" gutter={false} size="content">
//           <div className="flex flex-col gap-2">
//             <Skeleton variant="bar" width="55%" />
//             <Skeleton variant="bar" width="70%" />
//           </div>
//           <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
//             <Skeleton variant="block" />
//             <Skeleton variant="block" />
//             <Skeleton variant="block" />
//             <Skeleton variant="block" />
//           </div>
//         </Container>
//       </div>
//       <Container
//         className="flex flex-col gap-4 px-5 py-6 md:px-0"
//         gutter={false}
//         size="content"
//       >
//         <div className="flex flex-col gap-3">
//           <Skeleton.Card />
//           <Skeleton.Card />
//           <Skeleton.Card />
//         </div>
//       </Container>
//     </div>
//   );
// }
export default function Page() {
  return (
    <div>
      <h1>Welcome to Job Portal</h1>
    </div>
  );
}
