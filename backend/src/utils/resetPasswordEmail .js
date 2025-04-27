import { transporter } from "./emailConfig.js";
import { forgotPasswordEmailTemplate } from "./forgotPasswordEmailTemplate.js";

export const sendResetPasswordEmail = async (name, email, message) => {
  try {
    const response = await transporter.sendMail({
      from: '"Library Management System" <roshanshah639@gmail.com>',
      to: email,
      subject: "Password Recovery | Library Management System",
      html: forgotPasswordEmailTemplate
        .replace("{message}", message)
        .replace("{name}", name),
    });

    console.log("Email sent successfully", response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Re-throw the error to be handled by the controller
  }
};
