import User from "../models/user.model.js";
import { randomBytes, createHash } from "node:crypto";
import { sendEmail } from "../email/email.service.js";
import Reset_Password from "../models/reset-password.model.js";

const GENERIC_MESSAGE = "If an account exists for that email, a reset link will be sent.";

export async function forgetPasswordController(req, res, next) {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";

    // Validate the email input.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      return res.status(400).render("reset-password", {
        error: "Please enter a valid email address.",
        message: null,
      });
    }

    // Ensure APP_URL is configured.
    const appUrl = process.env.APP_URL?.replace(/\/+$/, "");

    if (!appUrl) {
      throw new Error("APP_URL is not configured.");
    }

    const user = await User.findOne({
      where: { email },
    });

    // Do not reveal whether the account exists.
    if (!user) {
      return res.status(200).render("reset-password", {
        title: "Reset Password",
        error: null,
        message: GENERIC_MESSAGE,
      });
    }

    // Generate a cryptographically secure token.
    const token = randomBytes(32).toString("hex");

    // Store only the SHA-256 hash in the database.
    const tokenHash = createHash("sha256").update(token).digest("hex");

    // Token expires in 15 minutes.
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Invalidate previous reset links for this email.
    await Reset_Password.destroy({
      where: { email: user.email },
    });

    // Store the hashed token and user's email.
    await Reset_Password.create({
      token: tokenHash,
      email: user.email,
    });

    const resetUrl = `${appUrl}/auth/new-password/${encodeURIComponent(token)}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Reset Your Password",
        text: [
          "We received a request to reset your password.",
          `Open this link to reset it: ${resetUrl}`,
          "This link expires in 15 minutes.",
          "If you did not request this, ignore this email.",
        ].join("\n\n"),

        html: `

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f3f5f9;
  font-family: Arial, Helvetica, sans-serif;
  color: #1f2937;
">

  <table
    role="presentation"
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="background-color: #f3f5f9;"
  >
    <tr>
      <td align="center" style="padding: 48px 16px;">

        <!-- Main Card -->
        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            max-width: 520px;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #e5e7eb;
          "
        >

          <!-- Top Accent -->
          <tr>
            <td
              height="6"
              style="background-color: #4f46e5; font-size: 0; line-height: 0;"
            >
              &nbsp;
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td align="center" style="padding: 40px 32px 36px;">

              <!-- Lock Icon -->
              <table
                role="presentation"
                cellspacing="0"
                cellpadding="0"
                border="0"
              >
                <tr>
                  <td
                    align="center"
                    valign="middle"
                    width="72"
                    height="72"
                    style="
                      width: 72px;
                      height: 72px;
                      background-color: #eef2ff;
                      border-radius: 50%;
                      font-size: 32px;
                    "
                  >
                    🔐
                  </td>
                </tr>
              </table>

              <h1 style="
                margin: 28px 0 12px;
                font-size: 28px;
                line-height: 1.3;
                font-weight: 700;
                color: #111827;
                text-align: center;
              ">
                Reset Your Password
              </h1>

              <p style="
                margin: 0 0 28px;
                font-size: 15px;
                line-height: 1.8;
                color: #6b7280;
                text-align: center;
              ">
                We received a request to reset your password.
                Click the button below to create a new password
                and get back into your account.
              </p>

              <!-- CTA Button -->
              <table
                role="presentation"
                cellspacing="0"
                cellpadding="0"
                border="0"
              >
                <tr>
                  <td
                    align="center"
                    bgcolor="#4f46e5"
                    style="border-radius: 8px;"
                  >
                    <a
                      href="${resetUrl}"
                      target="_blank"
                      style="
                        display: inline-block;
                        padding: 15px 32px;
                        font-size: 15px;
                        line-height: 1.4;
                        font-weight: 700;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 8px;
                      "
                    >
                      Reset My Password &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiration Notice -->
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  margin-top: 30px;
                  background-color: #fffbeb;
                  border: 1px solid #fde68a;
                  border-radius: 8px;
                "
              >
                <tr>
                  <td style="
                    padding: 14px 16px;
                    font-size: 13px;
                    line-height: 1.7;
                    color: #92400e;
                    text-align: center;
                  ">
                    <strong>⏱ This link expires in 15 minutes.</strong>
                    <br />
                    For your security, please reset your password before it expires.
                  </td>
                </tr>
              </table>

              <p style="
                margin: 28px 0 0;
                font-size: 13px;
                line-height: 1.8;
                color: #6b7280;
                text-align: center;
              ">
                If you didn't request a password reset, you can safely
                ignore this email. Your password will remain unchanged.
              </p>

              <div style="
                width: 100%;
                height: 1px;
                margin: 30px 0 20px;
                background-color: #e5e7eb;
              "></div>

              <p style="
                margin: 0;
                font-size: 12px;
                line-height: 1.8;
                color: #9ca3af;
                text-align: center;
              ">
                For security reasons, never share this link with anyone.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              align="center"
              style="
                padding: 20px 24px;
                background-color: #f9fafb;
                border-top: 1px solid #e5e7eb;
              "
            >
              <p style="
                margin: 0;
                font-size: 12px;
                line-height: 1.8;
                color: #9ca3af;
                text-align: center;
              ">
                &copy; ${new Date().getFullYear()} My Application.
                All rights reserved.
              </p>
            </td>
          </tr>

        </table>

        <p style="
          max-width: 480px;
          margin: 20px 0 0;
          font-size: 11px;
          line-height: 1.7;
          color: #9ca3af;
          text-align: center;
        ">
          If the button doesn't work, copy and paste this URL into your browser:
          <br />
          <a
            href="${resetUrl}"
            style="color: #4f46e5; word-break: break-all;"
          >${resetUrl}</a>
        </p>

      </td>
    </tr>
  </table>

</body>
</html>

        `,

        category: "Password Reset",
      });
    } catch (emailError) {
      console.error("Password reset email failed:", emailError);

      // Invalidate the token if email delivery fails.
      try {
        await Reset_Password.destroy({
          where: {
            email: user.email,
            token: tokenHash,
          },
        });
      } catch (cleanupError) {
        console.error("Failed to invalidate reset token:", cleanupError);
      }

      // Keep the response generic to avoid account enumeration.
      return res.render("reset-password", {
        error: null,
        message: GENERIC_MESSAGE,
      });
    }

    return res.render("reset-password", {
      error: null,
      message: GENERIC_MESSAGE,
    });
  } catch (error) {
    next(error);
  }
}
