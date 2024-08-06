const responseHandler = require("../helpers/responseHandler");
const Case = require("../models/caseModel");
const Event = require("../models/eventModel");
const Session = require("../models/sessionModel");
const Time = require("../models/timeModel");
const User = require("../models/userModel");
const { comparePasswords } = require("../utils/bcrypt");
const { createCertificate } = require("../utils/generateCertificate");
const { generateToken } = require("../utils/generateToken");
const sendMail = require("../utils/sendMail");
const validations = require("../validations");
const Notification = require("../models/notificationModel");
const { createReport } = require("../utils/generateReport");
const moment = require("moment-timezone");

exports.loginCounsellor = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return responseHandler(res, 400, "Email and password are required");
    }

    const findUser = await User.findOne({ email: email });
    if (!findUser) {
      return responseHandler(res, 404, "Counsellor not found");
    }

    const comparePassword = await comparePasswords(password, findUser.password);
    if (!comparePassword) {
      return responseHandler(res, 401, "Invalid password");
    }

    const token = generateToken(findUser.id);

    return responseHandler(res, 200, "Login successfull", token);
  } catch (error) {
    return responseHandler(
      res,
      500,
      `Internal Server Error ${error.message}`,
      null
    );
  }
};

exports.getCounsellor = async (req, res) => {
  try {
    const id = req.userId;
    if (!id) {
      return responseHandler(res, 400, "Counsellor ID is required");
    }
    const findCounsellor = await User.findById(id);
    if (!findCounsellor) {
      return responseHandler(res, 404, "Counsellor not found");
    }
    return responseHandler(res, 200, "Counsellor found", findCounsellor);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.addTimes = async (req, res) => {
  try {
    const addTimeValidator = validations.addTimeSchema.validate(req.body, {
      abortEarly: true,
    });
    if (addTimeValidator.error) {
      return responseHandler(
        res,
        400,
        `Invalid input: ${addTimeValidator.error}`
      );
    }
    req.body.user = req.userId;
    const isAdded = await Time.findTimes({
      userId: req.userId,
      day: req.body.day,
    });
    if (isAdded && req.body.times == []) {
      await Time.delete(isAdded.id);
    }
    if (isAdded) {
      const id = isAdded.id;
      const updateTime = await Time.update(id, {
        day: req.body.day,
        times: req.body.times,
      });
      if (!updateTime) return responseHandler(res, 400, `Time creation failed`);
      return responseHandler(res, 201, "Time created successfully", updateTime);
    }
    const times = await Time.create(req.body);
    if (!times) return responseHandler(res, 400, `Time creation failed`);
    return responseHandler(res, 201, "Time created successfully", times);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getTimes = async (req, res) => {
  try {
    const times = await Time.findByUserId(req.userId);
    if (!times) return responseHandler(res, 404, "No times found");
    return responseHandler(res, 200, "Times found", times);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.listController = async (req, res) => {
  try {
    const { type, page, searchQuery, status } = req.query;
    const { userId } = req;
    if (type === "sessions") {
      const sessions = await Session.findAllByCounsellorId({
        userId,
        page,
        searchQuery,
        status,
      });
      if (sessions.length > 0) {
        const totalCount = await Session.counsellor_count({
          id: userId,
          status,
        });
        return responseHandler(res, 200, "Reports found", sessions, totalCount);
      }
      return responseHandler(res, 404, "No reports found");
    }
    if (type === "cases") {
      const cases = await Case.findAll({
        userId,
        page,
        searchQuery,
      });
      if (cases.length > 0) {
        const mappedData = cases.map((item) => {
          return {
            ...item,
            session_time: item.sessions.length
              ? item.sessions[item.sessions.length - 1].session_time
              : null,
            type: item.sessions.length
              ? item.sessions[item.sessions.length - 1].type
              : null,
            session_count: item.sessions.length,
          };
        });
        const totalCount = await Case.counsellor_count({ id: userId });
        return responseHandler(res, 200, "Cases found", mappedData, totalCount);
      }
      return responseHandler(res, 404, "No cases found");
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

exports.acceptSession = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSession = await Session.accept(id);
    await Case.accept(updatedSession.case_id);
    const data = {
      user: req.userId,
      caseId: updatedSession.case_id,
      session: updatedSession.id,
      details: `Session with ${updatedSession.session_id} is accepted`,
    };
    await Notification.create(data);
    const notif_data = {
      user: updatedSession.user,
      caseId: updatedSession.case_id,
      session: updatedSession.id,
      details: `Your session with ${updatedSession.session_id} is accepted`,
    };
    const emailData = {
      to: updatedSession.user_email,
      subject: "Your Session Accepted",
      text: `Your session with ${updatedSession.session_id} is accepted, Session date on ${updatedSession.session_date}`,
    };
    await sendMail(emailData);
    await Notification.create(notif_data);
    const counData = {
      to: updatedSession.counsellor_email,
      subject: "Session Accepted",
      text: `Session with ${updatedSession.session_id} is accepted, Session date on ${updatedSession.session_date}`,
    };
    await sendMail(counData);
    if (!updatedSession)
      return responseHandler(res, 400, "Session Accepted failed");
    return responseHandler(
      res,
      200,
      "Session Accepted successfully",
      updatedSession
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.addEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { details, close, refer, date, time, remarks, session_id, user_id } =
      req.body;

    // Validate input
    const { error } = validations.createSessionEntrySchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) return responseHandler(res, 400, `Invalid input: ${error}`);

    // Attempt to close the session
    await Session.close(session_id);
    const checkSession = await Session.findById(session_id);
    if (!checkSession) return responseHandler(res, 404, "Session not found");

    // Handle case closure
    if (close) {
      const closeCase = await Case.close(id, { details });
      return closeCase
        ? responseHandler(res, 200, "Case closed successfully", closeCase)
        : responseHandler(res, 400, "Case close failed");
    }

    // Handle referral or default session creation
    let sessionData = {
      user: user_id,
      session_date: date,
      session_time: time,
      type: checkSession.type,
      description: refer ? remarks : details,
      counsellor: refer || req.userId,
    };

    if (refer) {
      sessionData.name = `Referred Session by ${checkSession.counsellor_name}`;
    } else {
      const count = await Session.countSessionsById(user_id, req.userId);
      sessionData.name = `${count} Session${count > 1 ? "s" : ""} for ${
        checkSession.name
      }`;
    }

    const newSessionRes = await Session.create(sessionData);
    if (!newSessionRes)
      return responseHandler(res, 400, "Session creation failed");

    // Update or create case
    let upCase;
    if (refer) {
      const caseId = await Case.create({
        user: user_id,
        sessions: [newSessionRes.id],
      });
      upCase = await Case.findById(caseId.id);
    } else {
      const fetchCase = await Case.findById(id);
      if (!fetchCase) return responseHandler(res, 404, "Case not found");

      upCase = await Case.update(id, {
        sessions: [...fetchCase.sessions, newSessionRes.id],
      });
    }

    // Send notifications and emails
    const newSession = await Session.findById(newSessionRes.id);
    await sendNotifications(newSession, upCase);

    return responseHandler(
      res,
      201,
      "Session created successfully",
      newSessionRes
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

// Helper function to send notifications and emails
async function sendNotifications(session, caseData) {
  const emailData = {
    to: session.user_email,
    subject: "New Session Requested",
    text: `Your session has been requested with Session ID: ${session.session_id} and Case ID: ${caseData.case_id}. Please wait for approval`,
  };
  await sendMail(emailData);

  const notifData = {
    user: session.user_id,
    caseId: caseData.id,
    session: session.id,
    details: "Your session has been requested. Please wait for approval",
  };
  await Notification.create(notifData);

  const counData = {
    to: session.counsellor_email,
    subject: "New Session Request",
    text: `You have a new session requested with Session ID: ${session.session_id} and Case ID: ${caseData.case_id}.`,
  };
  await sendMail(counData);

  const notif_data = {
    user: session.counsellor,
    caseId: caseData.id,
    session: session.id,
    details: "New session requested",
  };
  await Notification.create(notif_data);
}

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

exports.rescheduleSession = async (req, res) => {
  try {
    const { session_date, session_time } = req.body;
    const { id } = req.params;
    if (!session_date && !session_time)
      return responseHandler(res, 400, `Session date & time is required`);
    const session = await Session.findById(id);
    if (!session) return responseHandler(res, 404, "Session not found");
    if (session.status !== "pending" && session.status !== "rescheduled")
      return responseHandler(res, 400, "You can't reschedule this session");
    const updatedSession = {
      ...session,
      status: "accepted",
      session_date,
      session_time,
    };
    const rescheduleSession = await Session.update(id, updatedSession);
    if (!rescheduleSession)
      return responseHandler(res, 400, "Session reschedule failed");
    const data = {
      user: req.userId,
      caseId: updatedSession.caseid,
      session: updatedSession.id,
      details: "Your session is rescheduled.",
    };
    await Notification.create(data);
    const notif_data = {
      user: updatedSession.user,
      caseId: updatedSession.caseid,
      session: updatedSession.id,
      details: "Session rescheduled.",
    };
    const emailData = {
      to: session.user_email,
      subject: "Your Session Rescheduled",
      text: `Your session is rescheduled with Session ID: ${session.session_id}.`,
    };
    await sendMail(emailData);
    await Notification.create(notif_data);
    const counData = {
      to: session.counsellor_email,
      subject: "Session Reschedule",
      text: `Session rescheduled for Session ID: ${session.session_id}.`,
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

exports.getAvailableTimes = async (req, res) => {
  try {
    const { id } = req.params;
    const { day, date } = req.query;
    const session = await Session.findByCounseller(id, date);
    const times = await Time.findTimes({ userId: id, day });
    const availableTimes = times.times.filter(
      (time) => !session.some((sess) => sess.session_time == time)
    );
    if (!times) return responseHandler(res, 404, "No times found");
    return responseHandler(res, 200, "Times found", availableTimes);
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

exports.createReport = async (req, res) => {
  try {
    const { name, date } = req.body;
    const report = await createCertificate(name, date);
    return responseHandler(res, 200, "Report created successfully", report);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.createStudentReport = async (req, res) => {
  try {
    const report = await createReport();
    return responseHandler(res, 200, "Report created successfully", report);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getSessionsExcel = async (req, res) => {
  try {
    const { student, status } = req.query;
    const { userId } = req;
    const sessions = await Session.findForExcel({ userId, status, student });
    const headers = [
      "Case ID",
      "Session ID",
      "Student Name",
      "Session Date",
      "Session Time",
      "Status",
    ];
    const data = sessions.map((session) => {
      return {
        case_id: session.caseid,
        session_id: session.session_id,
        student_name: session.user_name,
        session_date: moment(session.session_date).format("DD-MM-YYYY"),
        session_time: session.session_time,
        status: session.status,
      };
    });
    return responseHandler(res, 200, "Excel data created successfully", {
      headers,
      data,
    });
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getBigCalender = async (req, res) => {
  try {
    const { userId } = req;
    const sessions = await Session.findAllByCounsellerId(userId);
    if (sessions.length > 0) {
      const mappedData = sessions.map((session) => {
        return {
          title: session.name,
          start: session.session_date,
          end: session.session_date,
        };
      });
      return responseHandler(res, 200, "Sessions found", mappedData);
    }
    return responseHandler(res, 404, "No sessions found");
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.updateCounsellor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "Counsellor ID is required");
    }
    const findCounsellor = await User.findById(id);
    if (!findCounsellor) {
      return responseHandler(res, 404, "Counsellor not found");
    }

    const editCounsellorValidator = validations.editCounsellorSchema.validate(
      req.body,
      {
        abortEarly: true,
      }
    );
    if (editCounsellorValidator.error) {
      return responseHandler(
        res,
        400,
        `Invalid input: ${editCounsellorValidator.error}`
      );
    }

    const updateCounsellor = await User.update(id, req.body);
    if (updateCounsellor) {
      return responseHandler(
        res,
        200,
        `Counsellor updated successfully..!`,
        updateCounsellor
      );
    } else {
      return responseHandler(res, 400, `Counsellor update failed...!`);
    }
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
