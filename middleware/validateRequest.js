export const validateRequest =
  (requiredFields = []) =>
  (req, res, next) => {
    // Check required fields
    const missing = requiredFields.filter((field) => !req.body[field]);

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields`,
        missingFields: missing,
      });
    }

    next();
  };