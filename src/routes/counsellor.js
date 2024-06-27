const express = require("express");
const counsellorRoute = express.Router();
const counsellorController = require("../controllers/counsellorController");
const authVerify = require("../middlewares/authVerify");

//! Uncomment this if you don't have a admin table
// const { createTable } = require("../models/userModel");
// createTable().then(() => {
//   console.log('User table created or already exists.');
// }).catch((error) => {
//   console.error('Error creating User table:', error);
// });

counsellorRoute.post("/login", counsellorController.loginCounsellor);
counsellorRoute.route("/").get(authVerify, counsellorController.getCounsellor);

module.exports = counsellorRoute;
