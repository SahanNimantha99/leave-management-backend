import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { User } from "./userModel.js";

// Define Leave model
export const Leave = sequelize.define("Leave", {
  fromDate: { type: DataTypes.DATEONLY, allowNull: false },
  toDate: { type: DataTypes.DATEONLY, allowNull: false },
  reason: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: "Pending" },
});

// One to Many relationship between User and Leave
User.hasMany(Leave, { foreignKey: "userId" });
// Each leave belongs to a single user
Leave.belongsTo(User, { foreignKey: "userId" });
