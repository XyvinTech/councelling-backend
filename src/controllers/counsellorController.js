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

    const createSessionValidator =
      validations.createSessionEntrySchema.validate(req.body, {
        abortEarly: true,
      });
    if (createSessionValidator.error) {
      return responseHandler(
        res,
        400,
        `Invalid input: ${createSessionValidator.error}`
      );
    }

    //? Attempt to close the session
    await Session.close(session_id);
    const checkSession = await Session.findById(session_id);

    //? Handle case closure
    if (close) {
      const closeCase = await Case.close(id, { details });
      if (!closeCase) return responseHandler(res, 400, "Case close failed");
      return responseHandler(res, 200, "Case closed successfully", closeCase);
    }

    //? Handle referral
    if (refer) {
      await Case.refer(id, { details });
      if (!checkSession) return responseHandler(res, 404, "Session not found");

      const data = {
        user: user_id,
        name: `Referred Session by ${checkSession.counsellor_name}`,
        session_date: date,
        session_time: time,
        type: checkSession.type,
        description: remarks,
        counsellor: refer,
      };

      const session = await Session.create(data);
      if (!session) return responseHandler(res, 400, "Session creation failed");

      const caseId = await Case.create({
        user: req.userId,
        sessions: [session.id],
      });

      const emailData = {
        to: session.user_email,
        subject: "New Session Requested",
        text: `Your session has been requested with Session ID: ${session.session_id} and Case ID: ${caseId.case_id}. Please wait for approval`,
      };
      await sendMail(emailData);
      const notifData = {
        user: req.userId,
        caseId: caseId.id,
        session: session.id,
        details: "Your session has been requested. Please wait for approval",
      };
      await Notification.create(notifData);
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

      return responseHandler(res, 201, "Session created successfully", session);
    }

    //? Default case: create a new session
    const count = await Session.countSessionsById(user_id, req.userId);
    const sessionData = {
      user: user_id,
      name: `${count} Session${count > 1 ? "s" : ""} for ${checkSession.name}`,
      session_date: date,
      type: checkSession.type,
      session_time: time,
      description: details,
      counsellor: req.userId,
    };

    const newSession = await Session.create(sessionData);
    if (!newSession)
      return responseHandler(res, 400, "Session creation failed");

    const fetchCase = await Case.findById(id);
    if (!fetchCase) return responseHandler(res, 404, "Case not found");

    await Case.update(id, {
      sessions: [
        ...fetchCase.sessions.map((session) => session),
        newSession.id,
      ],
    });

    return responseHandler(
      res,
      201,
      "Session created successfully",
      newSession
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
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
      status: "accepted",
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
      details: "Your session is rescheduled.",
    };
    await Notification.create(data);
    const notif_data = {
      user: updatedSession.user,
      caseId: updatedSession.case_id,
      session: updatedSession.id,
      details: "Session rescheduled.",
    };
    const emailData = {
      to: session.user_email,
      subject: "Your Session Rescheduled",
      text: `Your session is rescheduled with Session ID: ${session.id}.`,
    };
    await sendMail(emailData);
    await Notification.create(notif_data);
    const counData = {
      to: session.counsellor_email,
      subject: "Session Reschedule",
      text: `Session rescheduled for Session ID: ${session.id}.`,
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
    const { day } = req.query;
    const times = await Time.findTimes({ userId: id, day });
    if (!times) return responseHandler(res, 404, "No times found");
    return responseHandler(res, 200, "Times found", times);
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
