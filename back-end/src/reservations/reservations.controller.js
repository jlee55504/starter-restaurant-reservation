/**
 * List handler for reservation resources
 */
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const reservationsService = require("./reservations.service");

const VALID_PROPERTIES = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
];

// Middleware functions
const hasRequiredProperties = (...properties) => {
  return (req, res, next) => {
  const { data = {} } = req.body;
  try {
    properties.forEach((property) => {
      if (!data[property]) {
        const error = new Error(`A ${property} property is required.`);
        error.status = 400;
        throw error;
      };
    });
    next();
  } catch (error) {
      next(error);
  };
  };
};

const hasOnlyValidProperties = (req, res, next) => {
  const { data = {} } = req.body;
  const invalidFields = Object.keys(data).filter(field => !VALID_PROPERTIES.includes(field));
  if (invalidFields.length > 0) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  };
  next();
};

// Route handlers
async function list(req, res) {
  res.json({
    data: [],
  });
}

const create = async(req, res) => {
  const data = await reservationsService.create(req.body.data);
  res.status(201).json({ data});
}

module.exports = {
  list,
  create: [hasOnlyValidProperties, hasRequiredProperties, asyncErrorBoundary(create)],
};
