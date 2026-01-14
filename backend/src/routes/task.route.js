import { Router } from "express";
import { createTask, getTodaysRevision, getAllPendingRevision, getAllUpcomingRevision, completeRevision, deleteTask } from "../controllers/task.controller.js"
import { verifyJwt } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

// All routes below this line will use the verifyJwt middleware
router.use(verifyJwt);

router.route("/create-task").post(upload.single("document"), createTask)
router.route("/get/today-revision").get(getTodaysRevision)
router.route("/get/all-pending-revision").get(getAllPendingRevision)
router.route("/get/all-upcoming-revision").get(getAllUpcomingRevision)
router.route("/complete-revision").patch(completeRevision)
router.route("/delete-task").delete(deleteTask)


export default router;