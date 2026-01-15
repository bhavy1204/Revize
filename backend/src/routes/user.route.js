import { Router } from "express";
import { registerUser, loginUser, authMe, logout, refreshToken, changePassword, getCurrentUser, deleteAccount, googleLogin } from "../controllers/user.controller.js"
import { verifyJwt } from "../middleware/auth.middleware.js";
import { authLimiter, apiLimiter } from "../middleware/rateLimiting.middleware.js";
const router = Router()


router.route("/register").post(authLimiter, registerUser)
router.route("/auth/google").post(authLimiter, googleLogin)
router.route("/login").post(authLimiter, loginUser)
router.use(verifyJwt);
router.route("/authMe").get(authMe)
router.route("/logout").post(logout)
router.route("/refresh-token").get(apiLimiter, refreshToken)
router.route("/change-password").patch(apiLimiter, changePassword)
router.route("/get-user").get(apiLimiter, getCurrentUser)
router.route("/delete-account").delete(deleteAccount)

export default router;
