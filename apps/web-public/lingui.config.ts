import { baseLinguiConfig } from "@jp/i18n/config";
import type { LinguiConfig } from "@lingui/conf";

// sourceLocale + locales come from the shared base (@pm/i18n). Catalogs + compile
// format are per-app: PO sources extracted from src, compiled to typed TS modules
// for synchronous static import by shared/i18n/catalogs.ts.
const config: LinguiConfig = {
  ...baseLinguiConfig,
  catalogs: [
    {
      include: ["src"],
      path: "src/shared/i18n/locales/{locale}",
    },
  ],
  compileNamespace: "ts",
};

export default config;
