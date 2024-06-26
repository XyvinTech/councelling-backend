const mongoose = require("mongoose");

const formSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    counsellor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
    },
    name: { type: String },
  },
  { timestamps: true }
);

const Form = mongoose.model("Form", formSchema);

module.exports = Form;
