import { Router } from "express";
import { registerUser, loginUser, authMe, logout, refreshToken, changePassword, getCurrentUser, deleteAccount, googleLogin, githubAuth } from "../controllers/user.controller.js"
import { verifyJwt } from "../middleware/auth.middleware.js";
import { verifyAuth0 } from "../middleware/auth0.middleware.js";
import { authLimiter, apiLimiter } from "../middleware/rateLimiting.middleware.js";
const router = Router()


router.route("/register").post(authLimiter, registerUser)
router.route("/auth/google").post(authLimiter, googleLogin)
router.route("/auth/github").post(authLimiter,verifyAuth0, githubAuth)
// router.get("/callback/github", )
router.route("/login").post(authLimiter, loginUser)
router.use(verifyJwt);
router.route("/authMe").get(authMe)
router.route("/logout").post(logout)
router.route("/refresh-token").get(apiLimiter, refreshToken)
router.route("/change-password").patch(apiLimiter, changePassword)
router.route("/get-user").get(apiLimiter, getCurrentUser)
router.route("/delete-account").delete(deleteAccount)

export default router;
