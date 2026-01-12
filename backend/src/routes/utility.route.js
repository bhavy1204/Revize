import { Router } from "express";
import {exportPrintableRevisions} from "../controllers/utility.controller.js"

const router = Router()

router.route("/export-to-pdf").get(exportPrintableRevisions)

export default router;