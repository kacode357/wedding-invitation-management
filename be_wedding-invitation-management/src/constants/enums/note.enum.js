/**
 * @swagger
 * components:
 *   schemas:
 *     NoteAttendanceStatus:
 *       type: string
 *       enum:
 *         - definitely
 *         - highly_likely
 *         - unlikely
 *         - custom_prediction
 *       description: |
 *         Attendance prediction status:
 *         - definitely: Confirmed - 100% attendance
 *         - highly_likely: Over 50% chance of attendance
 *         - unlikely: Under 50% chance of attendance
 *         - custom_prediction: Custom prediction (e.g., "invited 2 but predict 1 will go")
 *     Note:
 *       type: object
 *       properties:
 *         attendanceStatus: { type: string, enum: [definitely, highly_likely, unlikely, custom_prediction] }
 *         customPrediction: { type: string, description: "Custom prediction text (used when attendanceStatus is custom_prediction)" }
 *         invitedCount: { type: number, description: "Number of guests invited" }
 *         predictedCount: { type: number, description: "Predicted number of attendees" }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 */

module.exports = {
  // Attendance status options
  ATTENDANCE_STATUS: {
    DEFINITELY: "definitely", // Confirmed - 100%
    HIGHLY_LIKELY: "highly_likely", // Over 50%
    UNLIKELY: "unlikely", // Under 50%
    CUSTOM_PREDICTION: "custom_prediction" // Custom prediction
  },

  // Labels for display
  ATTENDANCE_LABELS: {
    definitely: "Definitely (Confirmed) - 100%",
    highly_likely: "Highly likely to go - over 50%",
    unlikely: "Highly likely not to go - under 50%",
    custom_prediction: "Custom prediction"
  },

  // Validation messages
  VALIDATION_MESSAGES: {
    INVALID_STATUS: "Invalid attendance status",
    PREDICTION_REQUIRED: "Custom prediction text is required when status is custom_prediction",
    PREDICTION_FORMAT: "Custom prediction should follow format: invited X but predict Y will go"
  }
};
