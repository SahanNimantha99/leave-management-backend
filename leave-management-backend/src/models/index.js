import sequelize from "../config/db.js";
import User from "./userModel.js";
import Leave from "./leaveModel.js";

// Define relations
User.hasMany(Leave, { foreignKey: "employeeId", onDelete: "CASCADE" });
Leave.belongsTo(User, { foreignKey: "employeeId" });

await sequelize.sync({ alter: true }); // Auto-create tables if not exist
console.log("✅ Database synced");

export { sequelize, User, Leave };
