import env from "@/lib/env";
import { Redis } from "ioredis";
export const connection = new Redis({
  port: env.REDIS_PORT,
  host: env.REDIS_HOST,
  maxRetriesPerRequest: null,
});
