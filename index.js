import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import sequelize from "./database/db.config.js";

import loginRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import homeRoute from "./routes/home.route.js";

import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const PORT = 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// EJS configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Parse cookies
app.use(cookieParser());

app.use("/", homeRoute);
app.use("/auth", loginRoute);
app.use("/user", userRoute);

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || err.statusCode || 500).json({
    status: "ERROR",
    message: err.status && err.status < 500 ? err.message : "Internal Server Error",
  });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`App Listening On Port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start application:", error);
    process.exitCode = 1;
  }
}

startServer();
