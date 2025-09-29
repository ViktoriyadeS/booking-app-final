import * as Sentry from "@sentry/node";

const errorHandlerSentry = (err, req, res, next) => {
  //console.error(err);
  Sentry.captureException(err);
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Resource not found" });
  }
  if (err.code === "P2002") {
    return res
      .status(409)
      .json({ message: "Email or username already exists" });
  }

  res.status(500).json({
    error: "Something went wrong with this request!",
  });
};

export default errorHandlerSentry;
