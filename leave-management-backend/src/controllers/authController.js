import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

export const login = async (req, res) => {
  try {
  // Extract email and password from request body
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  // Find user
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Compare hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Generate JWT token
  const token = jwt.sign(
    { email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
    // Respond with token and user info
    res.json({
      token,
      user: { email: user.email, role: user.role, name: user.name },
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};
