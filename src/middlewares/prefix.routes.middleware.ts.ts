import { Router } from "express";

export const prefixRoutes = (prefix: string, ...routes: Router[]) => {
  const router = Router();
  routes.forEach((r) => router.use(prefix, r));
  return router;
};
