const express = require("express");
const adminRoute = express.Router();
const adminController = require("../controllers/adminController");
const authVerify = require("../middlewares/authVerify");

adminRoute
  .route("/")
  .post(authVerify, adminController.createAdmin)
  .get(authVerify, adminController.getAdmin);

adminRoute
  .route("/:id")
  .put(authVerify, adminController.editAdmin)
  .delete(authVerify, adminController.deleteAdmin);

adminRoute.post("/login", adminController.loginAdmin);

module.exports = adminRoute;
