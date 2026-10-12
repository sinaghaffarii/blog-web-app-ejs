import "dotenv/config";
import nodemailer from "nodemailer";

const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, EMAIL_FROM, EMAIL_FROM_NAME } =
  process.env;

const port = Number(SMTP_PORT);

if (!SMTP_HOST || !Number.isInteger(port) || port <= 0 || !SMTP_USER || !SMTP_PASS || !EMAIL_FROM) {
  throw new Error("SMTP configuration is incomplete.");
}

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port,
  secure: SMTP_SECURE === "true",
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export const sender = {
  name: EMAIL_FROM_NAME || "My Application",
  address: EMAIL_FROM,
};
