import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware.js";
import expressFileUpload from "express-fileupload";
import { notifyUsers } from "./services/notifyUsers.js";
import { removeUnverifiedAccounts } from "./services/removeUnverifiedAccounts.js";

// app config
const app = express();

// cors config
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

// common middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// express file upload
app.use(
  expressFileUpload({ useTempFiles: true, tempFileDir: "./public/temp/" })
);

// static files
app.use(express.static("public"));

// cookie parser
app.use(cookieParser());

// routes import
import healthcheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import bookRouter from "./routes/book.routes.js";
import borrowRouter from "./routes/borrow.routes.js";
import userRouter from "./routes/user.routes.js";

// routes declarations
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/books", bookRouter);
app.use("/api/v1/borrow", borrowRouter);
app.use("/api/v1/users", userRouter);

// notify users
notifyUsers();

// delete unverified accounts after 30 minutes
removeUnverifiedAccounts();

// error handler
app.use(errorHandler);

export { app };
