import "dotenv/config";
import { transporter, sender } from "./email/email.config.js";
import { sendEmail } from "./email/email.service.js";

try {
  await transporter.verify();
  console.log("SMTP connection successful.");

  const info = await sendEmail({
    to: "sinaghaffari18@gmail.com",
    subject: "Nodemailer SMTP Test",
    text: "Your Express email service is working.",
    html: "<h1>SMTP Test</h1><p>Email service is working.</p>",
  });

  console.log("Message accepted:", info.messageId);
} catch (error) {
  console.error("Email test failed:", error);
}
