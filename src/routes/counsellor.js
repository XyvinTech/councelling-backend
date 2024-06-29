const express = require("express");
const counsellorRoute = express.Router();
const counsellorController = require("../controllers/counsellorController");
const authVerify = require("../middlewares/authVerify");

counsellorRoute.post("/login", counsellorController.loginCounsellor);
counsellorRoute.route("/").get(authVerify, counsellorController.getCounsellor);
counsellorRoute
  .route("/times")
  .post(authVerify, counsellorController.addTimes)
  .get(authVerify, counsellorController.getTimes);

module.exports = counsellorRoute;
