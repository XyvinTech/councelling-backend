const express = require("express");
const counsellorRoute = express.Router();
const counsellorController = require("../controllers/counsellorController");
const authVerify = require("../middlewares/authVerify");

counsellorRoute.post("/login", counsellorController.loginCounsellor);

counsellorRoute.use(authVerify);

counsellorRoute.route("/").get(counsellorController.getCounsellor);

counsellorRoute.put("/profile/:id", counsellorController.updateCounsellor);

counsellorRoute
  .route("/times")
  .post(counsellorController.addTimes)
  .get(counsellorController.getTimes);

counsellorRoute.get("/list", counsellorController.listController);
counsellorRoute.put("/accept-session/:id", counsellorController.acceptSession);
counsellorRoute.post("/add-entry/:id", counsellorController.addEntry);
counsellorRoute.get("/counsellors", counsellorController.getAllCounsellors);
counsellorRoute.get("/sessions/:caseId", counsellorController.getCaseSessions);
counsellorRoute.get("/session/:id", counsellorController.getSession);
counsellorRoute.put("/reschedule/:id", counsellorController.rescheduleSession);
counsellorRoute.get(
  "/counsellors/:id/times",
  counsellorController.getAvailableTimes
);
counsellorRoute.put("/cancel-session/:id", counsellorController.cancelSession);
counsellorRoute.post("/report", counsellorController.createReport);
counsellorRoute.get("/big-calendar", counsellorController.getBigCalender);
counsellorRoute.get("/notifications", counsellorController.getNotifications);
counsellorRoute.put("/notification/:id", counsellorController.markAsRead);
counsellorRoute.post("/student-report", counsellorController.createStudentReport);

module.exports = counsellorRoute;
