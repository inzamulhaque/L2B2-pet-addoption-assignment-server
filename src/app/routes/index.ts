import { Router } from "express";
import UserRoutes from "../modules/user/user.routes";
import AuthRoutes from "../modules/auth/auth.rotes";

const router: Router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
