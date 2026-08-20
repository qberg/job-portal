import { os } from "../kernel/orpc/builder";
import { citizenMeHandler } from "../modules/citizen/me.handler";

export const appRouter = os.router({
  citizenMe: citizenMeHandler,
});

export type AppRouter = typeof appRouter;
