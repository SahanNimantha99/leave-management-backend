import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";

class Leave extends Model {}

Leave.init(
  {
    startDate: { type: DataTypes.DATEONLY, allowNull: false },
    endDate: { type: DataTypes.DATEONLY, allowNull: false },
    reason: { type: DataTypes.STRING },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    modelName: "Leave",
  }
);

export default Leave;
