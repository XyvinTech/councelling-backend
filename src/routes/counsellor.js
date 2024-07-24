const express = require("express");
const counsellorRoute = express.Router();
const counsellorController = require("../controllers/counsellorController");
const authVerify = require("../middlewares/authVerify");

counsellorRoute.post("/login", counsellorController.loginCounsellor);

counsellorRoute.use(authVerify);

counsellorRoute.route("/").get(counsellorController.getCounsellor);

counsellorRoute.route("/times")
  .post(counsellorController.addTimes)
  .get(counsellorController.getTimes);

counsellorRoute.get("/list", counsellorController.listController);
counsellorRoute.put("/accept-session/:id", counsellorController.acceptSession);
counsellorRoute.post("/add-entry/:id", counsellorController.addEntry);
userRoute.get("/counsellors", counsellorController.getAllCounsellors);

module.exports = counsellorRoute;
