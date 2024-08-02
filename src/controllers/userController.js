const responseHandler = require("../helpers/responseHandler");
const Case = require("../models/caseModel");
const Session = require("../models/sessionModel");
const Time = require("../models/timeModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");
const { comparePasswords } = require("../utils/bcrypt");
const { generateToken } = require("../utils/generateToken");
const validations = require("../validations");
const sendMail = require("../utils/sendMail");
const Event = require("../models/eventModel");

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return responseHandler(res, 400, "Email and password are required");
    }

    const findUser = await User.findOne({ email: email });
    if (!findUser) {
      return responseHandler(res, 404, "User not found");
    }

    const comparePassword = await comparePasswords(password, findUser.password);
    if (!comparePassword) {
      return responseHandler(res, 401, "Invalid password");
    }

    const token = generateToken(findUser.id);

    return responseHandler(res, 200, "Login successfull", token);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getUser = async (req, res) => {
  try {
    const id = req.userId;
    if (!id) {
      return responseHandler(res, 400, "User ID is required");
    }
    const findStudent = await User.findById(id);
    if (!findStudent) {
      return responseHandler(res, 404, "User not found");
    }
    return responseHandler(res, 200, "User found", findStudent);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "Student ID is required");
    }

    const editStudentValidator = validations.editStudentSchema.validate(
      req.body,
      {
        abortEarly: true,
      }
    );
    if (editStudentValidator.error) {
      return responseHandler(
        res,
        400,
        `Invalid input: ${editStudentValidator.error}`
      );
    }

    const findStudent = await User.findById(id);
    if (!findStudent) {
      return responseHandler(res, 404, "Student not found");
    }

    const updateStudent = await User.update(id, req.body);
    if (updateStudent) {
      return responseHandler(
        res,
        200,
        `Student updated successfully..!`,
        updateStudent
      );
    } else {
      return responseHandler(res, 400, `Student update failed...!`);
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.createSession = async (req, res) => {
  try {
    const createSessionValidator = validations.createSessionSchema.validate(
      req.body,
      {
        abortEarly: true,
      }
    );
    if (createSessionValidator.error) {
      return responseHandler(
        res,
        400,
        `Invalid input: ${createSessionValidator.error}`
      );
    }

    req.body.user = req.userId;
    const session = await Session.create(req.body);

    const sessions = [session.id];
    const caseId = await Case.create({
      user: req.userId,
      sessions,
    });

    session.case_id = caseId.id;
    const emailData = {
      to: session.user_email,
      subject: "Session Requested",
      text: `Your session has been requested with Session ID: ${session.session_id} and Case ID: ${caseId.case_id}. Please wait for approval`,
    };
    await sendMail(emailData);
    const data = {
      user: req.userId,
      caseId: caseId.id,
      session: session.id,
      details: "Your session has been requested. Please wait for approval",
    };
    await Notification.create(data);
    const notif_data = {
      user: session.counsellor,
      caseId: caseId.id,
      session: session.id,
      details: "New session requested",
    };
    const counData = {
      to: session.counsellor_email,
      subject: "New Session Request",
      text: `You have a new session has been requested with Session ID: ${session.session_id} and Case ID: ${caseId.case_id}.`,
    };
    await sendMail(counData);
    await Notification.create(notif_data);

    if (!session) {
      return responseHandler(res, 400, `Session creation failed`);
    }
    return responseHandler(res, 201, "Session created successfully", session);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.rescheduleSession = async (req, res) => {
  try {
    const { session_date, session_time } = req.body;
    const { id } = req.params;
    if (!session_date && !session_time)
      return responseHandler(res, 400, `Session date & time is required`);
    const session = await Session.findById(id);
    if (!session) return responseHandler(res, 404, "Session not found");
    if (session.status !== "pending")
      return responseHandler(res, 400, "You can't reschedule this session");
    const updatedSession = {
      ...session,
      session_date,
      session_time,
    };
    const rescheduleSession = await Session.update(id, updatedSession);
    if (!rescheduleSession)
      return responseHandler(res, 400, "Session reschedule failed");
    const data = {
      user: req.userId,
      caseId: updatedSession.case_id,
      session: updatedSession.id,
      details:
        "Your session reschedule has been requested. Please wait for approval",
    };
    await Notification.create(data);
    const notif_data = {
      user: updatedSession.counsellor,
      caseId: updatedSession.case_id,
      session: updatedSession.id,
      details: "Session reschedule requested",
    };
    const emailData = {
      to: session.user_email,
      subject: "Session Reschedule has been Requested",
      text: `Your session reschedule has been requested with Session ID: ${session.id}. Please wait for approval`,
    };
    await sendMail(emailData);
    await Notification.create(notif_data);
    const counData = {
      to: session.counsellor_email,
      subject: "Session Reschedule Request",
      text: `Session reschedule has been requested with Session ID: ${session.id}.`,
    };
    await sendMail(counData);
    return responseHandler(
      res,
      200,
      "Session rescheduled successfully",
      rescheduleSession
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.listController = async (req, res) => {
  try {
    const { type, page, searchQuery, status } = req.query;
    const { userId } = req;
    if (type === "sessions") {
      const sessions = await Session.findAllByUserId({
        userId,
        page,
        searchQuery,
        status,
      });
      if (sessions.length > 0) {
        const totalCount = await Session.count({ id: userId, status });
        return responseHandler(res, 200, "Reports found", sessions, totalCount);
      }
      return responseHandler(res, 404, "No reports found");
    } else if (type === "cases") {
      const cases = await Case.findByUser({ userId, page, searchQuery });
      if (cases.length > 0) {
        const totalCount = await Case.user_count({ id: userId });
        return responseHandler(res, 200, "Cases found", cases, totalCount);
      }
      return responseHandler(res, 404, "No reports found");
    } else if (type === "events") {
      const event = await Event.findAll({
        page,
        searchQuery,
      });
      if (event.length > 0) {
        const totalCount = await Event.count();
        return responseHandler(res, 200, "Events found", event, totalCount);
      }
      return responseHandler(res, 404, "No Events found");
    } else {
      return responseHandler(res, 404, "Invalid type..!");
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getAvailableTimes = async (req, res) => {
  try {
    const { id } = req.params;
    const { day, date } = req.query;
    const session = await Session.findByCounseller(id, date);
    const times = await Time.findTimes({ userId: id, day });
    const availableTimes = times.times.filter(
      (time) => !session.some((sess) => sess.session_time == `${time}:00`)
    );
    if (!times) return responseHandler(res, 404, "No times found");
    return responseHandler(res, 200, "Times found", availableTimes);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getAllCounsellors = async (req, res) => {
  try {
    const { counsellorType } = req.query;
    const counsellors = await User.findAllCounsellors({ counsellorType });
    const mappedData = counsellors.map((counsellor) => {
      return {
        id: counsellor.id,
        name: counsellor.name,
        email: counsellor.email,
        type: counsellor.counsellortype,
      };
    });
    if (counsellors.length > 0) {
      return responseHandler(res, 200, "Counsellors found", mappedData);
    }
    return responseHandler(res, 404, "No counsellors found");
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getCaseSessions = async (req, res) => {
  try {
    const { caseId } = req.params;
    const sessions = await Session.findAllByCaseId(caseId);
    if (sessions.length > 0) {
      return responseHandler(res, 200, "Sessions found", sessions);
    }
    return responseHandler(res, 404, "No sessions found");
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findById(id);
    if (session) {
      return responseHandler(res, 200, "Session found", session);
    }
    return responseHandler(res, 404, "Session not found");
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.cancelSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.cancel(id);
    await Case.cancel(session.case_id);
    if (session) {
      return responseHandler(res, 200, "Session cancelled successfully");
    }
    return responseHandler(res, 404, "Session not found");
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getFullTimes = async (req, res) => {
  try {
    const { id } = req.params;
    const times = await Time.findByUserId(id);
    if (!times) return responseHandler(res, 404, "No times found");
    const days = times
      .filter((time) => Array.isArray(time.times) && time.times.length > 0)
      .map((time) => time.day);
    return responseHandler(res, 200, "Days found", days);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req;
    const notifications = await Notification.findByUserId(userId);
    if (!notifications)
      return responseHandler(res, 400, `No Notification found`);
    return responseHandler(res, 200, `Notification Found`, notifications);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.markAsRead(id);
    if (!notification)
      return responseHandler(res, 404, "Notification not found");
    return responseHandler(res, 200, "Notification marked as read");
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};
