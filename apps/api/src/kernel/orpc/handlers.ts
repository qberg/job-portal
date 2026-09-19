import { RPCHandler } from "@orpc/server/fetch";
import { appRouter } from "../../rpc/router";

export const rpcHandler = new RPCHandler(appRouter);
