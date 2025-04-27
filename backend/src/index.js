import dotenv from "dotenv";
import { app } from "./app.js";
import ConnectDB from "./db/connectDb.js";

// dotenv config - load env. variables
dotenv.config({ path: "./.env" });

// server config
const PORT = process.env.PORT || 8000;

// connect to db
ConnectDB()
  .then(() => {
    // listen for errors
    app.on("error", (error) => {
      console.log("Server is not able to talk to db", error);
    });

    // start the server
    app.listen(PORT, () => {
      console.log(`Server is running at: http://localhost:${PORT}...`);
    });
  })
  .catch((error) => {
    console.log("DB Connection Error", error);
  });
