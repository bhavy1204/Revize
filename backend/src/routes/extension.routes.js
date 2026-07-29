// routes/extension.routes.js
import { Router } from "express";
import { createExtensionToken, revokeExtensionToken } from "../controllers/extensionAuth.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { extensionAuth } from "../middleware/extensionAuth.middleware.js";
import { leetcodeCreateTask } from "../controllers/task.controller.js";

const router = Router();

// PWA calls these — cookie-authenticated via verifyJwt
router.post("/extension-token", verifyJwt, createExtensionToken);
router.post("/extension-token/revoke", verifyJwt, revokeExtensionToken);

// Extension calls this — Bearer opaque token via extensionAuth
router.post("/task/leetcode/create-task", extensionAuth, leetcodeCreateTask);

export default router;

