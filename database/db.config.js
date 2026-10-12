import { Sequelize } from "sequelize";

const sequelize = new Sequelize("blog_db", "sina-hack", "9011490544", {
  host: "localhost",
  dialect: "mysql",
});

export default sequelize;
