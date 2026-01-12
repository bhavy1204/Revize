import { Router } from "express";
import { createTask, getTodaysRevision, getAllPendingRevision, completeRevision, deleteTask } from "../controllers/task.controller.js"

const router = Router();

router.route("/create-task").post(createTask)
router.route("/get/today-revision").get(getTodaysRevision)
router.route("/get/all-pending-revision").get(getAllPendingRevision)
router.route("/complete-revision").patch(completeRevision)
router.route("/delete-task").delete(deleteTask)


export default router;