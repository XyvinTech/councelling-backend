const Joi = require("joi");

exports.createAdminSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
});

exports.editAdminSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string(),
  password: Joi.string(),
  status: Joi.boolean(),
});

exports.createCounsellorSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
  mobile: Joi.string().required(),
  counsellorType: Joi.string().required(),
  experience: Joi.number().required(),
  userType: Joi.string().required(),
  designation: Joi.string().required(),
});

exports.editCounsellorSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string(),
  password: Joi.string(),
  mobile: Joi.string(),
  counsellorType: Joi.string(),
  experience: Joi.number(),
  status: Joi.boolean(),
  designation: Joi.string(),
});

exports.createTeacherSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
  mobile: Joi.string().required(),
  designation: Joi.string().required(),
  experience: Joi.number().required(),
  userType: Joi.string().required(),
});

exports.createStudentSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
  mobile: Joi.string().required(),
  designation: Joi.string().required(),
  userType: Joi.string().required(),
  parentContact: Joi.string().required(),
});

exports.editStudentSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string(),
  password: Joi.string(),
  mobile: Joi.string(),
  designation: Joi.string(),
  parentContact: Joi.string(),
  status: Joi.boolean(),
});

exports.createEventSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  date: Joi.date().required(),
  time: Joi.date().required(),
  duration: Joi.string().required(),
  venue: Joi.string().required(),
  guest: Joi.string().required(),
  doc: Joi.string(),
});

exports.createSessionSchema = Joi.object({
  session_date: Joi.date().required(),
  session_time: Joi.string().regex(/^([0-9]{2}):([0-9]{2}):([0-9]{2})$/).required(),
  type: Joi.string().required(),
  counsellor: Joi.string().required(),
  description: Joi.string(),
  report: Joi.string(),
});
