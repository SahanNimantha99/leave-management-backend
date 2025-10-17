import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { User } from "./userModel.js";

export const Leave = sequelize.define("Leave", {
  fromDate: { type: DataTypes.DATEONLY, allowNull: false },
  toDate: { type: DataTypes.DATEONLY, allowNull: false },
  reason: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: "Pending" },
});

User.hasMany(Leave, { foreignKey: "userId" });
Leave.belongsTo(User, { foreignKey: "userId" });
