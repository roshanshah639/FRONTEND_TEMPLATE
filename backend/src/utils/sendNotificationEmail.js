import { transporter } from "./emailConfig.js";
import { sendNotificationEmailTemplate } from "./sendNotificationEmailTemplate.js";

export const sendNotificationEmail = async (name, email, message) => {
  try {
    // Send email using transporter
    const response = await transporter.sendMail({
      from: '"Library Management System" <roshanshah639@gmail.com>',
      to: email,
      subject: "Book Return Reminder | Library Management System",
      html: sendNotificationEmailTemplate
        .replace("{name}", name)
        .replace("{message}", message.replace(/\n/g, "<br>")), // Convert newlines to <br> for HTML
    });

    // Log success
    console.log("Notification email sent successfully:", response);

    return response;
  } catch (error) {
    // Log error without throwing to align with notifyUsers
    console.error("Error sending notification email:", error);
    return null; // Return null to indicate failure
  }
};
