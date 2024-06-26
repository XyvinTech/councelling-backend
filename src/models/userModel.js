const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    password: { type: String },
    mobile: { type: String },
    designation: { type: String },
    userType: { type: String },
    counsellorType: { type: String },
    experience: { type: Number },
    parentContact: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
