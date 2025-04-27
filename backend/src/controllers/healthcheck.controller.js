import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const healthcheck = asyncHandler(async (req, res) => {
  // return the success response
  return res
    .status(200)
    .json(new ApiResponse(200, "Ok", "Server is up and running"));
});

export { healthcheck };
