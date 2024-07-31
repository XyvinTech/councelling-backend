const moment = require("moment-timezone");
const responseHandler = require("../helpers/responseHandler");
const Admin = require("../models/adminModel");
const Event = require("../models/eventModel");
const Session = require("../models/sessionModel");
const User = require("../models/userModel");
const { comparePasswords, hashPassword } = require("../utils/bcrypt");
const { generateToken } = require("../utils/generateToken");
const validations = require("../validations");
const Case = require("../models/caseModel");

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return responseHandler(res, 400, "Email and password are required");
    }

    let user = await Admin.findOne({ email });
    let userType = "admin";

    if (!user) {
      user = await User.findOne({ email });
      userType = user ? user.usertype : null;
    }

    if (!user) {
      return responseHandler(res, 404, "User not found");
    }

    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      return responseHandler(res, 401, "Invalid password");
    }

    const token = generateToken(user.id);
    return responseHandler(res, 200, "Login successful", {
      token,
      userType,
    });
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const createAdminValidator = validations.createAdminSchema.validate(
      req.body,
      {
        abortEarly: true,
      }
    );
    if (createAdminValidator.error) {
      return responseHandler(
        res,
        400,
        `Invalid input: ${createAdminValidator.error}`
      );
    }

    const findAdmin = await Admin.findOne({ email: req.body.email });
    if (findAdmin)
      return responseHandler(res, 409, `Admin with this email already exists`);

    const hashedPassword = await hashPassword(req.body.password);
    req.body.password = hashedPassword;

    const newAdmin = await Admin.create(req.body);

    if (newAdmin) {
      return responseHandler(
        res,
        201,
        `New Admin created successfull..!`,
        newAdmin
      );
    } else {
      return responseHandler(res, 400, `Admin creation failed...!`);
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getAdmin = async (req, res) => {
  try {
    const id = req.userId;
    if (!id) {
      return responseHandler(res, 400, "Admin ID is required");
    }
    const findAdmin = await Admin.findById(id);
    if (!findAdmin) {
      return responseHandler(res, 404, "Admin not found");
    }
    return responseHandler(res, 200, "Admin found", findAdmin);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.editAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "Admin ID is required");
    }

    const findAdmin = await Admin.findById(id);
    if (!findAdmin) {
      return responseHandler(res, 404, "Admin not found");
    }

    const editAdminValidator = validations.editAdminSchema.validate(req.body, {
      abortEarly: true,
    });
    if (editAdminValidator.error) {
      return responseHandler(
        res,
        400,
        `Invalid input: ${editAdminValidator.error}`
      );
    }

    const updateAdmin = await Admin.update(id, req.body, {
      new: true,
    });
    if (updateAdmin) {
      return responseHandler(
        res,
        200,
        `Admin updated successfully..!`,
        updateAdmin
      );
    } else {
      return responseHandler(res, 400, `Admin update failed...!`);
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "Admin ID is required");
    }

    const findAdmin = await Admin.findById(id);
    if (!findAdmin) {
      return responseHandler(res, 404, "Admin not found");
    }

    const deleteAdmin = await Admin.delete(id);
    if (deleteAdmin) {
      return responseHandler(res, 200, `Admin deleted successfully..!`);
    } else {
      return responseHandler(res, 400, `Admin deletion failed...!`);
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.createCounsellor = async (req, res) => {
  try {
    const createCounsellorValidator =
      validations.createCounsellorSchema.validate(req.body, {
        abortEarly: true,
      });
    if (createCounsellorValidator.error) {
      return responseHandler(
        res,
        400,
        `Invalid input: ${createCounsellorValidator.error}`
      );
    }

    const findCounsellor = await User.findOne({ email: req.body.email });
    if (findCounsellor) {
      return responseHandler(res, 409, "Counsellor already exists");
    }

    const hashedPassword = await hashPassword(req.body.password);
    req.body.password = hashedPassword;
    const user = await User.create(req.body);
    return responseHandler(res, 201, "Counsellor created", user);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.createCounsellorBulk = async (req, res) => {
  try {
    const user = await User.createMany(req.body);
    return responseHandler(res, 201, "Counsellor created", user);
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

exports.deleteCounsellor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "Counsellor ID is required");
    }

    const findCounsellor = await User.findById(id);
    if (!findCounsellor) {
      return responseHandler(res, 404, "Counsellor not found");
    }

    const deleteCounsellor = await User.delete(id);
    if (deleteCounsellor) {
      return responseHandler(res, 200, `Counsellor deleted successfully..!`);
    } else {
      return responseHandler(res, 400, `Student deletion failed...!`);
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.createStudent = async (req, res) => {
  try {
    const createStudentValidator = validations.createStudentSchema.validate(
      req.body,
      {
        abortEarly: true,
      }
    );
    if (createStudentValidator.error) {
      return responseHandler(
        res,
        400,
        `Invalid input: ${createStudentValidator.error}`
      );
    }

    const findStudent = await User.findOne({ email: req.body.email });
    if (findStudent) {
      return responseHandler(res, 409, "Student already exists");
    }

    const hashedPassword = await hashPassword(req.body.password);
    req.body.password = hashedPassword;
    const user = await User.create(req.body);
    return responseHandler(res, 201, "Student created", user);
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

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "Student ID is required");
    }

    const findStudent = await User.findById(id);
    if (!findStudent) {
      return responseHandler(res, 404, "Student not found");
    }

    const deleteStudent = await User.delete(id);
    if (deleteStudent) {
      return responseHandler(res, 200, `Student deleted successfully..!`);
    } else {
      return responseHandler(res, 400, `Student deletion failed...!`);
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.listController = async (req, res) => {
  try {
    const { type, page, searchQuery, limit } = req.query;
    if (type === "students") {
      const student = await User.findAll({
        page,
        searchQuery,
        userType: "student",
      });
      if (student.length > 0) {
        const totalCount = await User.count({ userType: "student" });
        return responseHandler(res, 200, "Students found", student, totalCount);
      }
      return responseHandler(res, 404, "No Students found");
    } else if (type === "counsellers") {
      const student = await User.findAll({
        page,
        searchQuery,
        userType: "counsellor",
      });
      if (student.length > 0) {
        const totalCount = await User.count({ userType: "counsellor" });
        return responseHandler(
          res,
          200,
          "Counsellers found",
          student,
          totalCount
        );
      }
      return responseHandler(res, 404, "No counsellers found");
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
    } else if (type === "sessions") {
      const sessions = await Session.findAll({
        page,
        limit,
        searchQuery,
      });
      if (sessions.length > 0) {
        const totalCount = await Session.count({});
        return responseHandler(res, 200, "Reports found", sessions, totalCount);
      }
      return responseHandler(res, 404, "No reports found");
    } else if (type === "cases") {
      const sessions = await Case.find({
        page,
        limit,
        searchQuery,
      });
      if (sessions.length > 0) {
        const totalCount = await Session.count({});
        return responseHandler(res, 200, "Reports found", sessions, totalCount);
      }
      return responseHandler(res, 404, "No reports found");
    } else {
      return responseHandler(res, 404, "Invalid type..!");
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getUserSessions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page, searchQuery } = req.query;
    const sessions = await Session.findAllByUserId({
      userId,
      page,
      searchQuery,
    });
    const mappedData = sessions.map((session) => {
      return {
        id: session.id,
        session_date: moment(session.session_date).format("Do MMMM YYYY"),
        session_time: moment(session.session_time, "HH:mm:ss").format("h:mm A"),
        name: session.name,
        counsellor_name: session.counsellor_name,
        counsellor_type: session.type,
      };
    });
    if (sessions.length > 0) {
      const totalCount = await Session.count({ id: userId });
      return responseHandler(
        res,
        200,
        "Sessions found",
        mappedData,
        totalCount
      );
    }
    return responseHandler(res, 404, "No Sessions found", mappedData);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "User ID is required");
    }
    const user = await User.findById(id);
    if (!user) {
      return responseHandler(res, 404, "User not found");
    }
    return responseHandler(res, 200, "User found", user);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getCounsellorSessions = async (req, res) => {
  try {
    const userId = req.params.counsellorId;
    const { page, searchQuery } = req.query;
    const sessions = await Session.findAllByCounsellorId({
      userId,
      page,
      searchQuery,
    });
    const mappedData = sessions.map((session) => {
      return {
        id: session.id,
        session_date: moment(session.session_date).format("Do MMMM YYYY"),
        session_time: moment(session.session_time, "HH:mm:ss").format("h:mm A"),
        student_name: session.user_name,
        counsellor_type: session.type,
        grade: session.grade,
        status: session.status,
      };
    });
    if (sessions.length > 0) {
      const totalCount = await Session.counsellor_count({ id: userId });
      return responseHandler(
        res,
        200,
        "Sessions found",
        mappedData,
        totalCount
      );
    }
    return responseHandler(res, 404, "No Sessions found", mappedData);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getCounsellorCases = async (req, res) => {
  try {
    const userId = req.params.counsellorId;
    const { page, searchQuery } = req.query;
    const cases = await Case.findAllByCounsellorId({
      userId,
      page,
      searchQuery,
    });
    const mappedData = cases.map((case_) => {
      return {
        id: case_.id,
        case_date: moment(case_.createdAt).format("Do MMMM YYYY"),
        case_time: moment(case_.createdAt, "HH:mm:ss").format("h:mm A"),
        student_name: case_.user_name,
        status: case_.status,
      };
    });
    if (cases.length > 0) {
      const totalCount = await Case.counsellor_count({ id: userId });
      return responseHandler(res, 200, "Cases found", mappedData, totalCount);
    }
    return responseHandler(res, 404, "No Cases found", mappedData);
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

exports.getDashboard = async (req, res) => {
  try {
    const student_count = await User.count({ userType: "student" });
    const counsellor_count = await User.count({ userType: "counsellor" });
    const case_count = await Case.count();
    const session_count = await Session.count({});
    const dashboard = {
      student_count,
      counsellor_count,
      case_count,
      session_count,
    };
    return responseHandler(res, 200, "Dashboard found", dashboard);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.createEvent = async (req, res) => {
  try {
    const createEventValidator = validations.createEventSchema.validate(
      req.body,
      {
        abortEarly: true,
      }
    );
    if (createEventValidator.error) {
      return responseHandler(
        res,
        400,
        `Invalid input: ${createEventValidator.error}`
      );
    }
    const newEvent = await Event.create(req.body);

    if (newEvent) {
      return responseHandler(
        res,
        201,
        `New Event created successfull..!`,
        newEvent
      );
    } else {
      return responseHandler(res, 400, `Event creation failed...!`);
    }
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
