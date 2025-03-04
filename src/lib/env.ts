import { z } from "zod";

const envSchema = z.object({
  APP_ORIGIN: z.string().url(),
  API_URL: z.string().url(),
  PORT: z.coerce.number().min(3000).max(8000),
  NODE_ENV: z
    .union([z.literal("development"), z.literal("production"), z.literal("test")])
    .default("development"),
  JWT_SECRET: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
});

console.log("process.env", process.env.REDIS_PORT);
const env = envSchema.parse(process.env);
console.log("env", env);

export default env;
