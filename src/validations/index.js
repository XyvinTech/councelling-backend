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
  time: Joi.string()
    .regex(/^([0-9]{2}):([0-9]{2}):([0-9]{2})$/)
    .required(),
  event_image: Joi.string(),
});

exports.editEventSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string(),
  date: Joi.date(),
  time: Joi.string().regex(/^([0-9]{2}):([0-9]{2}):([0-9]{2})$/),
  event_image: Joi.string(),
  status: Joi.boolean(),
});

exports.createSessionSchema = Joi.object({
  name: Joi.string().required(),
  session_date: Joi.date().required(),
  session_time: Joi.object({
    start: Joi.string()
      .regex(/^([0-9]{2}):([0-9]{2})$/)
      .required(),
    end: Joi.string()
      .regex(/^([0-9]{2}):([0-9]{2})$/)
      .required(),
  }).required(),
  type: Joi.string().required(),
  counsellor: Joi.string().required(),
  description: Joi.string(),
  report: Joi.string(),
});

exports.addTimeSchema = Joi.object({
  day: Joi.string().required(),
  times: Joi.array(),
});

exports.createSessionEntrySchema = Joi.object({
  date: Joi.date(),
  time: Joi.string().regex(/^([0-9]{2}):([0-9]{2}):([0-9]{2})$/),
  user_id: Joi.string().required(),
  session_id: Joi.string().required(),
  close: Joi.boolean(),
  refer: Joi.string(),
  details: Joi.string(),
  grade: Joi.string(),
  remarks: Joi.string(),
});
