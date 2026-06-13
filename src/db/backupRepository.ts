import { localDb } from "./localDb";

export const BACKUP_SCHEMA_VERSION = 1;

export async function clearAllData() {
  await localDb.transaction("rw", localDb.tables, async () => {
    await Promise.all(localDb.tables.map((table) => table.clear()));
  });
}
