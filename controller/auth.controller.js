import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export async function registerUserController(req, res, next) {
  try {
    const { firstName, lastName, email, password } = req.body;

    const exist_user = await User.findOne({
      where: { email },
    });
    if (exist_user) {
      return res.status(400).render("register", {
        title: "Register",
        error: "This User is Existing in Database.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      firstName,
      lastName,
      password: hashedPassword,
      email,
    });

    res.status(201).json({
      data: user,
      status: "OK",
    });
  } catch (error) {
    next(error);
  }
}

export async function loginUserController(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(404).render("login", {
        title: "Login",
        error: "User is not found.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).render("login", {
        title: "Login",
        error: "Invalid email or password.",
      });
    }

    // generate jwt token
    const payload = { id: user._id, email: user.email };
    const JWT_SECRET = process.env.JWT_SECRET;
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    // store jwt in cookie
    res.cookie("token", token, {
      maxAge: 60 * 60 * 1000,
    });

    return res.redirect("/user/profile");
  } catch (error) {
    next(error);
  }
}
