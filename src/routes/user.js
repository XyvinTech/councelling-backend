const express = require("express");
const authVerify = require("../middlewares/authVerify");
const userController = require("../controllers/userController");
const userRoute = express.Router();

// //! Uncomment this if you don't have a event table
// const { createTable } = require("../models/sessionModel");
// createTable().then(() => {
//   console.log('Session table created or already exists.');
// }).catch((error) => {
//   console.error('Error creating Session table:', error);
// });

userRoute.post("/login", userController.loginUser);
userRoute.post("/session", authVerify, userController.createSession);
userRoute.get("/list", authVerify, userController.listController);

module.exports = userRoute;
