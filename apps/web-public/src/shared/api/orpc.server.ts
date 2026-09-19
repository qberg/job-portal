import type { appContract } from "@jp/api-contract";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ContractRouterClient } from "@orpc/contract";
import { headers } from "next/headers";
import { env } from "../config/env";

// 15s: cold map/boundary reads (ST_Union behind 1h TTL) are unmeasured on the droplet;
// tighten only after measuring — an abort here has no error boundary on marketing routes.
const SSR_FETCH_TIMEOUT_MS = 15_000;

// Server-side-ONLY citizen oRPC client (ADR-0025): reads/writes run in an RSC,
// the inbound pm-citizen cookie forwarded to apps/api. No browser oRPC client.
const link = new RPCLink({
  // fetch override + signal compose: orpc.dev/llms-full.txt "Configure RPCLink
  // with expo/fetch" example (context7 /llmstxt/orpc_dev_llms-full_txt).
  async fetch(_request, init) {
    return fetch(_request.url, {
      body: await _request.blob(),
      headers: _request.headers,
      method: _request.method,
      signal: AbortSignal.any([
        _request.signal,
        AbortSignal.timeout(SSR_FETCH_TIMEOUT_MS),
      ]),
      ...init,
    });
  },
  // Forward ONLY the cookie, forwarding every inbound header leaks
  // content-length onto the outbound body → undici mismatch on writes.
  headers: async () => {
    const cookie = (await headers()).get("cookie");
    return cookie ? { cookie } : {};
  },
  url: `${env.API_INTERNAL_URL}/rpc`,
});

export const citizenApi =
  createORPCClient<ContractRouterClient<typeof appContract>>(link);
