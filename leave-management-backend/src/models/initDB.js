import bcrypt from "bcrypt";

import { sequelize } from "./../config/db.js";
import { User } from "./userModel.js";
import { Leave } from "./leaveModel.js";

export const initDB = async () => {
  try {
    await sequelize.sync();

    const defaultUsers = [
      {
        name: "Admin User",
        email: "admin@gmail.com",
        password: "admin123",
        role: "admin",
      },
      {
        name: "Employee User",
        email: "employee@gmail.com",
        password: "emp123",
        role: "employee",
      },
    ];

    for (const u of defaultUsers) {
      const existingUser = await User.findOne({ where: { email: u.email } });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        await User.create({
          name: u.name,
          email: u.email,
          password: hashedPassword,
          role: u.role,
        });
        console.log(`User ${u.email} seeded successfully!`);
      }
    }

    const employee = await User.findOne({
      where: { email: "employee@gmail.com" },
    });
    if (employee) {
      await Leave.update({ userId: employee.id }, { where: { userId: null } });
      console.log("Orphaned leaves fixed and assigned to Employee User.");
    }

    console.log("Database initialized successfully!");
  } catch (err) {
    console.error("Error initializing database:", err);
  }
};
