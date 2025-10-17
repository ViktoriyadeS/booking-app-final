import * as Sentry from "@sentry/node";
import { Prisma } from "@prisma/client";

const errorHandlerSentry = (err, req, res, next) => {
  Sentry.captureException(err);
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Resource not found" });
  }
  if (err.code === "P2002") {
    return res
      .status(409)
      .json({ message: "Email or username already exists" });
  }
  if (err instanceof Prisma.PrismaClientValidationError) {
      // Unknown argument / invalid field
      return res.status(400).json({
        status: 400,
        error: "Bad Request",
        message: err.message
      })}

  if (err.statusCode) {
    // Use the statusCode thrown from the services user&host
    return res.status(err.statusCode).json({ message: err.message });
  }

  res.status(500).json({
    error: "Something went wrong with this request!",
  });
};

export default errorHandlerSentry;
