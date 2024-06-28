const express = require("express");
const adminRoute = express.Router();
const adminController = require("../controllers/adminController");
const authVerify = require("../middlewares/authVerify");

//! Uncomment this if you don't have a admin table
// const { createTable } = require("../models/adminModel");
// createTable().then(() => {
//   console.log('Admin table created or already exists.');
// }).catch((error) => {
//   console.error('Error creating Admin table:', error);
// });

//! Uncomment this if you don't have a event table
// const { createTable } = require("../models/eventModel");
// createTable().then(() => {
//   console.log('Event table created or already exists.');
// }).catch((error) => {
//   console.error('Error creating Event table:', error);
// });

adminRoute
  .route("/")
  .post(adminController.createAdmin)
  .get(authVerify, adminController.getAdmin);

adminRoute
  .route("/:id")
  .put(authVerify, adminController.editAdmin)
  .delete(authVerify, adminController.deleteAdmin);

adminRoute.post("/login", adminController.loginAdmin);
adminRoute.post("/counsellor", authVerify, adminController.createCounsellor);
adminRoute
  .route("/counsellor/:id")
  .put(authVerify, adminController.updateCounsellor)
  .delete(authVerify, adminController.deleteCounsellor);
adminRoute.post("/student", authVerify, adminController.createStudent);
adminRoute
  .route("/student/:id")
  .put(authVerify, adminController.updateStudent)
  .delete(authVerify, adminController.deleteStudent);

module.exports = adminRoute;
