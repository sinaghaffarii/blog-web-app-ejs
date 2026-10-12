import User from "../models/user.model.js";
import Reset_Password from "../models/reset-password.model.js";
import { createHash } from "node:crypto";
import bcrypt from "bcrypt";

export async function resetPasswordController(req, res, next) {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token) {
      return res.status(400).send("Invalid reset token.");
    }

    if (!password || password.length < 8) {
      return res.status(400).send("Password must be at least 8 characters.");
    }

    if (password !== confirmPassword) {
      return res.status(400).send("Passwords do not match.");
    }

    // Hash the raw token from the URL.
    const tokenHash = createHash("sha256").update(token).digest("hex");

    // Find the matching reset-token record.
    const resetToken = await Reset_Password.findOne({
      where: { token: tokenHash },
    });

    if (!resetToken) {
      return res.status(400).send("Invalid or expired reset token.");
    }

    // Check expiration using Sequelize's createdAt timestamp.
    // This assumes timestamps are enabled on Reset_Password.
    const expiresAt = new Date(resetToken.createdAt).getTime() + 15 * 60 * 1000;

    if (Date.now() > expiresAt) {
      await resetToken.destroy();
      return res.status(400).send("Invalid or expired reset token.");
    }

    const user = await User.findOne({
      where: { email: resetToken.email },
    });

    if (!user) {
      await resetToken.destroy();
      return res.status(400).send("Invalid or expired reset token.");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    user.password = hashedPassword;
    await user.save();

    // A reset token can only be used once.
    await resetToken.destroy();

    return res.redirect("/auth/login");
  } catch (error) {
    next(error);
  }
}
