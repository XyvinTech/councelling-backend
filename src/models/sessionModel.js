const mongoose = require("mongoose");

const sessionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    caseID: { type: String },
    sessionDate: { type: Date },
    sessionTime: { type: Date },
    type: { type: String },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "accepted", "cancelled", "completed"],
    },
    counsellor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    description: { type: String },
    report: { type: String },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
