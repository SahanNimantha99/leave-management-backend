import { Op } from "sequelize";

import { Leave } from "../models/leaveModel.js";
import { User } from "../models/userModel.js";

export const getLeaves = async (req, res) => {
  try {
    const { role, email } = req.user;

    let leaves;
    if (role === "admin") {
      leaves = await Leave.findAll({
        include: [{ model: User, attributes: ["name", "email"] }],
        order: [["createdAt", "DESC"]],
      });
    } else {
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(404).json({ message: "User not found" });
      leaves = await Leave.findAll({
        where: { userId: user.id },
        order: [["createdAt", "DESC"]],
      });
    }

    res.json(leaves);
  } catch (err) {
    console.error("Error fetching leaves:", err);
    res.status(500).json({ message: "Server error fetching leaves" });
  }
};

export const applyLeave = async (req, res) => {
  try {
    const { email } = req.user;
    const { fromDate, toDate, reason } = req.body;

    if (!fromDate || !toDate || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (new Date(toDate) < new Date(fromDate)) {
      return res
        .status(400)
        .json({ message: "To date cannot be before from date" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const overlapping = await Leave.findOne({
      where: {
        userId: user.id,
        status: "Approved",
        fromDate: { [Op.lte]: toDate },
        toDate: { [Op.gte]: fromDate },
      },
    });

    if (overlapping) {
      return res.status(409).json({
        message: "Leave request conflicts with an existing approved leave",
      });
    }

    const leave = await Leave.create({
      fromDate,
      toDate,
      reason,
      status: "Pending",
      userId: user.id,
    });

    res.status(201).json(leave);
  } catch (err) {
    console.error("Error applying leave:", err);
    res.status(500).json({ message: "Server error while applying leave" });
  }
};


export const approveLeave = async (req, res) => {
  try {
    const { status } = req.body;

    const leave = await Leave.findByPk(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status update" });
    }

    leave.status = status;
    await leave.save();
    res.json(leave);
  } catch (err) {
    console.error("Error updating leave status:", err);
    res.status(500).json({ message: "Server error while updating leave" });
  }
};

export const cancelLeave = async (req, res) => {
  try {
    const { email, role } = req.user;
    const leaveId = req.params.id;

    const leave = await Leave.findByPk(leaveId);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    if (role !== "admin") {
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(404).json({ message: "User not found" });

      if (leave.userId !== user.id)
        return res
          .status(403)
          .json({ message: "Not authorized to cancel this leave" });
    }
    if (leave.status !== "Pending")
      return res
        .status(400)
        .json({ message: "Only pending leaves can be canceled" });

    await leave.destroy();
    res.json({ message: "Leave canceled", id: leaveId });
  } catch (err) {
    console.error("Error canceling leave:", err);
    res.status(500).json({ message: "Server error while canceling leave" });
  }
};

export const editLeave = async (req, res) => {
  try {
    const { email, role } = req.user;
    const leaveId = req.params.id;
    const { fromDate, toDate, reason } = req.body;

    if (!fromDate || !toDate || !reason)
      return res.status(400).json({ message: "All fields are required" });

    if (new Date(toDate) < new Date(fromDate))
      return res
        .status(400)
        .json({ message: "To date cannot be before from date" });

    const leave = await Leave.findByPk(leaveId);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    if (leave.status !== "Pending")
      return res
        .status(400)
        .json({ message: "Only pending leaves can be edited" });

    if (role !== "admin") {
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(404).json({ message: "User not found" });
      if (leave.userId !== user.id)
        return res
          .status(403)
          .json({ message: "Not authorized to edit this leave" });
    }

    const overlapping = await Leave.findOne({
      where: {
        userId: leave.userId,
        status: "Approved",
        fromDate: { [Op.lte]: toDate },
        toDate: { [Op.gte]: fromDate },
        id: { [Op.ne]: leaveId },
      },
    });

    if (overlapping)
      return res
        .status(409)
        .json({ message: "Leave overlaps with an already approved leave" });

    leave.fromDate = fromDate;
    leave.toDate = toDate;
    leave.reason = reason;

    await leave.save();
    res.json({ message: "Leave updated", leave });
  } catch (err) {
    console.error("Error editing leave:", err);
    res.status(500).json({ message: "Server error while editing leave" });
  }
};
