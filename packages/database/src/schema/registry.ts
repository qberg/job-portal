import * as authTables from "./kernel.schema/auth.schema";
import * as citizenAuthTables from "./kernel.schema/citizen-auth.schema";

export const schema = {
  ...authTables,
  ...citizenAuthTables,
};
