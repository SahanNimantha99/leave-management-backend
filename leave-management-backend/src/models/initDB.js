import bcrypt from "bcrypt";
import { sequelize } from "./../config/db.js";
import { User } from "./userModel.js";

export const initDB = async () => {
  try {
    // Sync tables without dropping existing ones
    await sequelize.sync();

    // Define default users
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

    // Seed default users safely
    for (const u of defaultUsers) {
      const existingUser = await User.findOne({ where: { email: u.email } });
      if (!existingUser) {
        // Hash password before creating user
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

    console.log("Database initialized successfully!");
  } catch (err) {
    console.error("Error initializing database:", err);
  }
};
