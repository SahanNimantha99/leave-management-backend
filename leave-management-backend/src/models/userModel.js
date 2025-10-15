import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";
import bcrypt from "bcryptjs";

class User extends Model {
  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
}

User.init(
  {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("employee", "admin"),
      defaultValue: "employee",
    },
  },
  {
    sequelize,
    modelName: "User",
    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 10);
      },
    },
  }
);

export default User;
