import { Sequelize } from "sequelize";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./leave_management.sqlite",
  logging: false,
});

export default sequelize;
