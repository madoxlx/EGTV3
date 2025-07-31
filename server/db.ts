import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

// اتصال مباشر بقاعدة البيانات
const connectionString =
  "postgresql://postgres:MyStrongPAssw0rds@31.97.114.175:5432/egt";

export const pool = new Pool({
  connectionString,
  ssl: false, // لو السيرفر مش بيحتاج SSL، خليه false
});

export const db = drizzle(pool, { schema });

// للتماشي مع الكود الموجود اللي بيعتمد على dbPromise
export const dbPromise = Promise.resolve(db);
