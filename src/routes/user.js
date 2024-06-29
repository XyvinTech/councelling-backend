const express = require("express");
const authVerify = require("../middlewares/authVerify");
const userController = require("../controllers/userController");
const userRoute = express.Router();

userRoute.post("/login", userController.loginUser);
userRoute.post("/session", authVerify, userController.createSession);
userRoute.put("/reschedule/:id", authVerify, userController.rescheduleSession);
userRoute.get("/list", authVerify, userController.listController);

module.exports = userRoute;
