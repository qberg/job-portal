import { oc } from "@orpc/contract";
import { object, string } from "valibot";

export const citizenMeContract = oc
  .route({ method: "GET", path: "/citizen/me", tags: ["Citizen Auth"] })
  .output(
    object({
      id: string(),
    })
  );
