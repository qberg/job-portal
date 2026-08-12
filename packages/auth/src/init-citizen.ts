import { getDb } from "@jp/database/init";
import { createCitizenAuth } from "./citizen";
import type { CitizenAuthConfig, CitizenAuthOpts } from "./citizen-types";

type CitizenAuthInstance = ReturnType<typeof createCitizenAuth>;

let _citizenAuth: CitizenAuthInstance | null = null;

export function getCitizenAuth(): CitizenAuthInstance {
  if (!_citizenAuth) {
    throw new Error(
      "[CITIZEN-AUTH] ERR: getCitizenAuth() called before initCitizenAuth(). " +
        "Ensure initCitizenAuth() runs before importing route handlers."
    );
  }
  return _citizenAuth;
}

export function initCitizenAuth(
  config: CitizenAuthConfig,
  opts: CitizenAuthOpts
): CitizenAuthInstance {
  _citizenAuth = createCitizenAuth(config, getDb(), opts);
  return _citizenAuth;
}
