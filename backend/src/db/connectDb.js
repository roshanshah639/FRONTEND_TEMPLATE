import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const ConnectDB = async () => {
  try {
    // create a connection instance
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );

    // log the connection success
    console.log(
      `DB Connected Successfully. At DB Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    // log the error
    console.error("DB COnnection Failed! Make sure MongoDb is running", error);

    // exit the process with failure
    process.exit(1);
  }
};

export default ConnectDB;
