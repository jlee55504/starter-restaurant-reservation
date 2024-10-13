/**
 * List handler for reservation resources
 */
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const reservationsService = require("./reservations.service");
const hasProperties = require("../errors/hasProperties");
const { Resolver } = require("webpack");

// Middleware functions

const hasRequiredProperties = hasProperties(
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people");


const reservationExists = async (req, res, next) => {
  const reservation = await reservationsService.read(req.params.date);
  if (reservation) {
    res.locals.reservation_date = reservation;
    return next();
  };
  next({
    status: 404,
    message: "Reservation cannot be found.",
  });
};

// Route handlers
const read = (req, res) => {
 const data = res.locals.reservation_date;
  res.json({ data });
};

async function list(req, res) {
  const data = await reservationsService.list();
  res.json({ data });
};

const create = async(req, res) => {
  const data = await reservationsService.create(req.body.data);
  res.status(201).json({ data });
};

module.exports = {
  read: [asyncErrorBoundary(reservationExists), read],
  list: [asyncErrorBoundary(list)],
  create: [hasRequiredProperties, asyncErrorBoundary(create)],
};
