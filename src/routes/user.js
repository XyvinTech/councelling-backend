const express = require("express");
const authVerify = require("../middlewares/authVerify");
const userController = require("../controllers/userController");
const userRoute = express.Router();

userRoute.post("/login", userController.loginUser);

userRoute.use(authVerify);

userRoute.post("/session", userController.createSession);
userRoute.put("/reschedule/:id", userController.rescheduleSession);
userRoute.get("/list", userController.listController);
userRoute.get("/counseller/:id/times", userController.getAvailableTimes);
userRoute.get("/counsellors", userController.getAllCounsellors);
userRoute.get("/sessions/:caseId", userController.getCaseSessions);

module.exports = userRoute;
