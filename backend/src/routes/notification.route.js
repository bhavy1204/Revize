import { Router } from "express";
import { pushToAll , sendTestNotification} from "../controllers/notification.controller.js"

const router = Router();

router.route("/subscribe").post(pushToAll);
router.route("/notify").post(sendTestNotification);

export default router;