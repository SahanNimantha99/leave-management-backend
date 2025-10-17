import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import {
  getLeaves,
  applyLeave,
  approveLeave,
  cancelLeave,
} from "../controllers/leaveController.js";

const router = express.Router();

// Employee: apply leave & view own leaves
router.get("/", authenticate, getLeaves);
router.post("/", authenticate, applyLeave);

// Employee: cancel leave
router.delete("/:id", authenticate, cancelLeave);

// Admin: approve/reject leave
router.put("/:id/approve", authenticate, authorize("admin"), approveLeave);

export default router;
