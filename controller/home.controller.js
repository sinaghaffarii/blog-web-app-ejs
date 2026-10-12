export async function homeController(req, res, next) {
  try {
    return res.render("home", {
      isAuthenticated: false,
    });
  } catch (error) {
    next(error);
  }
}
