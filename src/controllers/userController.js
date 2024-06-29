const responseHandler = require("../helpers/responseHandler");
const Session = require("../models/sessionModel");
const User = require("../models/userModel");
const { comparePasswords } = require("../utils/bcrypt");
const { generateToken } = require("../utils/generateToken");
const validations = require("../validations");

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

    const checkSession = await Session.findByUserId(req.userId);

    if (checkSession.length > 0) {
      return responseHandler(res, 400, "Session already requested");
    }
    const sessionCount = await Session.count();
    req.body.case_id = `CASE_ID#${sessionCount.count + 1}`;
    req.body.user = req.userId;
    const session = await Session.create(req.body);
    if (!session) return responseHandler(res, 400, `Session creation failed`);
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
    const { type, page, searchQuery } = req.query;
    const { userId } = req;
    if (type === "sessions") {
      const sessions = await Session.findAllByUserId({
        userId,
        page,
        searchQuery,
      });
      if (sessions.length > 0) {
        const totalCount = await Session.count();
        return responseHandler(
          res,
          200,
          "Reports found",
          sessions,
          totalCount.count
        );
      }
      return responseHandler(res, 404, "No reports found");
    } else {
      return responseHandler(res, 404, "Invalid type..!");
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};
