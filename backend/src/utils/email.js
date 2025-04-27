import { transporter } from "./emailConfig.js";
import { Verification_Email_Template } from "./emailTemplate.js";

export const sendVerificationEmail = async (name, email, verificationCode) => {
  try {
    const response = await transporter.sendMail({
      from: '"Library Management System" <roshanshah639@gmail.com>',
      to: email,
      subject: "Email Verification Code | Library Management System",
      html: Verification_Email_Template.replace(
        "{verificationCode}",
        verificationCode
      ).replace("{name}", name),
    });

    console.log("Email sent successfully", response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
