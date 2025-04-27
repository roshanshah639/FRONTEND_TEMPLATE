import cron from "node-cron";
import BorrowModel from "../models/borrow.models.js";
import { sendNotificationEmail } from "../utils/sendNotificationEmail.js";

export const notifyUsers = async () => {
  cron.schedule("*/30 * * * *", async () => {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // find borrowers
      const borrowers = await BorrowModel.find({
        dueDate: {
          $lt: oneDayAgo,
        },
        returnDate: null,
        notified: false,
      });

      for (const element of borrowers) {
        if (element.user && element.user.email) {
          const message = `This is a reminder that the book you borrowed is due in 24 hours. Kindly request you to return the  book to Library Management System before due date. \n\n Thanks, \n Library Management System`;

          // send email
          await sendNotificationEmail(
            element.user.name,
            element.user.email,
            message
          );

          // update notified field
          element.notified = true;

          // save borrow record
          await element.save();

          console.log(
            "Notification email sent successfully to",
            element.user.email
          );
        }
      }
    } catch (error) {
      console.log("Error in notifying users", error);
    }
  });
};
