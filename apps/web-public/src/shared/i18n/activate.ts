import { createI18nServer } from "@jp/i18n/server";
import { loadMessages } from "./catalogs";

// Per-request server i18n binding. activate(locale) calls setI18n every render
// scope (backed by a React-cached instance), so each route entry (layout + page)
// must call it to bind RSC translations under cacheComponents/PPR.
export const { activate } = createI18nServer(loadMessages);
