import { Router } from "express";
import {exportPrintableRevisions} from "../controllers/utility.controller.js"
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router()

// All routes below this line will use the verifyJwt middleware
router.use(verifyJwt);

router.route("/export-to-pdf").get(exportPrintableRevisions)

export default router;