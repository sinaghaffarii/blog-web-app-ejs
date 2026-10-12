import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { Op } from "sequelize";

export async function getUserListController(req, res, next) {
  try {
    const search = (await req.query.search?.trim()) || "";
    const where = search
      ? {
          [Op.or]: [
            { firstName: { [Op.like]: `%${search}%` } },
            { lastName: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const users = await User.findAll({
      where,
      attribute: ["id", "firstName", "lastName", "email"],
      order: [["firstName", "ASC"]],
    });
    res.render("users", { users, search });
  } catch (error) {
    next(error);
  }
}

export async function profileController(req, res, next) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.redirect("/auth/login");
    }

    try {
      const JWT_SECRET = process.env.JWT_SECRET;
      const verified_token = jwt.verify(token, JWT_SECRET);
      const user = await User.findOne({
        where: {
          email: verified_token.email,
        },
      });
      if (user) {
        res.render("profile", {
          fullName: `${user.firstName} ${user.lastName}`,
          email: user.email,
        });
      } else {
        res.status(401).redirect("/auth/login");
      }
    } catch {
      return res.redirect("/auth/login");
    }
  } catch (error) {
    next(error);
  }
}
