import { getDb } from "@jp/database/init";
import { createAuth } from "./create";
import type { AuthConfig } from "./types";

type AuthInstance = ReturnType<typeof createAuth>;

let _auth: AuthInstance | null = null;

export function getAuth(): AuthInstance {
  if (!_auth) {
    throw new Error(
      "[AUTH] ERR: getAuth() called before initAuth(). " +
        "Ensure initAuth() runs before importing route handlers."
    );
  }
  return _auth;
}

export function initAuth(config: AuthConfig): AuthInstance {
  _auth = createAuth(config, getDb());
  return _auth;
}
