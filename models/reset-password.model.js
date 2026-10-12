import sequelize from "../database/db.config.js";
import { DataTypes } from "sequelize";

const Reset_Password = sequelize.define("reset-password", {
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Reset_Password;
