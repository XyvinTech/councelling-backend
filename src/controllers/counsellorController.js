const responseHandler = require("../helpers/responseHandler");
const Case = require("../models/caseModel");
const Session = require("../models/sessionModel");
const Time = require("../models/timeModel");
const User = require("../models/userModel");
const { comparePasswords } = require("../utils/bcrypt");
const { generateToken } = require("../utils/generateToken");
const validations = require("../validations");

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
    }
    if (type === "cases") {
      const cases = await Case.findAll({
        userId,
        page,
        searchQuery,
      });
      if (cases.length > 0) {
        const totalCount = await Case.count();
        return responseHandler(
          res,
          200,
          "Cases found",
          cases,
          totalCount.count
        );
      }
      return responseHandler(res, 404, "No cases found");
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
    const { platform, link } = req.body;
    const data = {
      platform,
      link,
      status: "accepted",
    };
    const updatedSession = await Session.accept(id, data);
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
    const {
      grade,
      details,
      close,
      refer,
      date,
      time,
      remarks,
      session_id,
      user_id,
    } = req.body;

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
      const closeCase = await Case.close(id, { grade, details });
      if (!closeCase) return responseHandler(res, 400, "Case close failed");
      return responseHandler(res, 200, "Case closed successfully", closeCase);
    }

    //? Handle referral
    if (refer) {
      await Case.close(id, { grade, details });
      if (!checkSession) return responseHandler(res, 404, "Session not found");

      const data = {
        user: user_id,
        name: `Referred Session by ${checkSession.counsellor_name}`,
        session_date: date,
        session_time: time,
        description: remarks,
        counsellor: refer,
      };

      const session = await Session.create(data);
      if (!session) return responseHandler(res, 400, "Session creation failed");

      await Case.create({
        user: req.userId,
        sessions: [session.id],
      });

      return responseHandler(res, 201, "Session created successfully", session);
    }

    //? Default case: create a new session
    const count = await Session.countSessionsById(user_id, req.userId);
    const sessionData = {
      user: user_id,
      name: `${count} Session${count > 1 ? "s" : ""} for ${checkSession.name}`,
      session_date: date,
      session_time: time,
      description: remarks,
      counsellor: req.userId,
    };

    const newSession = await Session.create(sessionData);
    if (!newSession)
      return responseHandler(res, 400, "Session creation failed");

    const fetchCase = await Case.findById(id);
    if (!fetchCase) return responseHandler(res, 404, "Case not found");

    await Case.update(id, {
      session_ids: [...fetchCase.session_ids, newSession.id],
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
