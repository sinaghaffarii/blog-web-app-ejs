import { transporter, sender } from "./email.config.js";

export async function sendEmail({ to, subject, text, html, category = "General" }) {
  if (!to || !subject || (!text && !html)) {
    throw new Error("Recipient, subject, and email content are required.");
  }

  const recipients = Array.isArray(to) ? to : [to];

  if (recipients.some((email) => typeof email !== "string" || !email.trim())) {
    throw new Error("Invalid recipient email address.");
  }

  try {
    return await transporter.sendMail({
      from: sender,
      to: recipients,
      subject,
      text,
      html,
      headers: {
        "X-Email-Category": category,
      },
    });
  } catch (error) {
    console.error("Failed to send email:", error.message);

    throw new Error("Email delivery failed.", {
      cause: error,
    });
  }
}
