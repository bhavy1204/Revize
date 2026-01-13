import { Router } from "express";
import {registerUser, loginUser, authMe, logout, refreshToken, changePassword, getCurrentUser, deleteAccount} from "../controllers/user.controller.js"
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router()

router.use(verifyJwt);

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/authMe").get(authMe)
router.route("/logout").post(logout)
router.route("/refresh-token").get(refreshToken)
router.route("/change-password").patch(changePassword)
router.route("/get-user").get(getCurrentUser)
router.route("/delete-account").delete(deleteAccount)

export default router;
