const express = require("express");
const adminRoute = express.Router();
const adminController = require("../controllers/adminController");
const authVerify = require("../middlewares/authVerify");

adminRoute.post("/login", adminController.loginAdmin);

adminRoute.use(authVerify);

adminRoute
  .route("/")
  .post(adminController.createAdmin)
  .get(adminController.getAdmin);

adminRoute
  .route("/admin/:id")
  .put(adminController.editAdmin)
  .delete(adminController.deleteAdmin);

adminRoute.post("/counsellor", adminController.createCounsellor);
adminRoute.post("/counsellor/add-bulk", adminController.createCounsellorBulk);
adminRoute
  .route("/counsellor/:id")
  .put(adminController.updateCounsellor)
  .delete(adminController.deleteCounsellor);

adminRoute.post("/student", adminController.createStudent);
adminRoute
  .route("/student/:id")
  .put(adminController.updateStudent)
  .delete(adminController.deleteStudent);

adminRoute.get("/list", adminController.listController);
adminRoute.get("/sessions/:userId", adminController.getUserSessions);
adminRoute.get("/user/:id", adminController.getUser);
adminRoute.get("/counsellor/sessions/:counsellorId", adminController.getCounsellorSessions);
adminRoute.get("/counsellor/cases/:counsellorId", adminController.getCounsellorCases);
adminRoute.get("/counsellors", adminController.getAllCounsellors);
adminRoute.get("/dashboard", adminController.getDashboard);
adminRoute.post("/event", adminController.createEvent);

module.exports = adminRoute;
