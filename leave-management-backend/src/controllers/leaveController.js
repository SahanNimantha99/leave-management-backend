import { Leave } from "../models/leaveModel.js";
import { User } from "../models/userModel.js";

// Get leaves
export const getLeaves = async (req, res) => {
  try {
    // Extract user info from request
    const { role, email } = req.user;

    let leaves;
    if (role === "admin") {
      // Admin can see all leaves
      leaves = await Leave.findAll({
        include: [{ model: User, attributes: ["name", "email"] }],
        order: [["createdAt", "DESC"]],
      });
    } else {
      // Employee gets only their own leaves
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(404).json({ message: "User not found" });
      leaves = await Leave.findAll({
        where: { userId: user.id },
        order: [["createdAt", "DESC"]],
      });
    }

    // Respond with leaves
    res.json(leaves);
  } catch (err) {
    console.error("Error fetching leaves:", err);
    res.status(500).json({ message: "Server error fetching leaves" });
  }
};


// Apply leave
export const applyLeave = async (req, res) => {
  try {
    // Extract user info and leave details from request
    const { email } = req.user;
    const { fromDate, toDate, reason } = req.body;

    // Basic validation
    if (!fromDate || !toDate || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Model for leave application
    const leave = await Leave.create({
      fromDate,
      toDate,
      reason,
      status: "Pending",
      userId: user.id,
    });
    
    // Respond with created leave
    res.status(201).json(leave);
  } catch (err) {
    console.error("Error applying leave:", err);
    res.status(500).json({ message: "Server error while applying leave" });
  }
};


// Approve or reject leave (admin)
export const approveLeave = async (req, res) => {
  try {
    // Extract status from request body
    const { status } = req.body;

    // Find leave by ID
    const leave = await Leave.findByPk(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    // Validate status
    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status update" });
    }

    // Update leave status
    leave.status = status;
    await leave.save();
    res.json(leave);
  } catch (err) {
    console.error("Error updating leave status:", err);
    res.status(500).json({ message: "Server error while updating leave" });
  }
};


// Cancel leave (employee)
export const cancelLeave = async (req, res) => {
  try {
    // Extract user info and leave ID
    const { email, role } = req.user;
    const leaveId = req.params.id;

    // Find leave
    const leave = await Leave.findByPk(leaveId);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    // Only employee who owns the leave can cancel
    if (role !== "admin") {

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(404).json({ message: "User not found" });

      // Check ownership
      if (leave.userId !== user.id)
        return res
          .status(403)
          .json({ message: "Not authorized to cancel this leave" });
    }
    // Only pending leaves can be canceled
    if (leave.status !== "Pending")
      return res
        .status(400)
        .json({ message: "Only pending leaves can be canceled" });

    // Delete leave
    await leave.destroy();
    res.json({ message: "Leave canceled", id: leaveId });
  } catch (err) {
    console.error("Error canceling leave:", err);
    res.status(500).json({ message: "Server error while canceling leave" });
  }
};