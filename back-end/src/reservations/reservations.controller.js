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

const checkReservationForClosedDay = (req, res, next) => {
  const { data: { reservation_date } = {} } = req.body;
  let reservationDate = new Date(reservation_date.replace(/-/g, '\/'));
  if (reservationDate.getDay() === 2) { 
    return next({
      status: 400,
      message: "This restaurant is closed on Tuesdays. Please try again. "
    });
  };
  next();
};

const checkReservationForPastDates = (req, res, next) => {
  const { data = {} } = req.body;
  const { reservation_date } = data;
  let reservationDateToCompare = parseInt(reservation_date.replace(/-/g, '\/').split('/').join(''));
  let todaysDate = new Date();
  todaysDate = parseInt(todaysDate.toLocaleDateString('pt-br').split( '/' ).reverse().join(''))
  if (reservationDateToCompare < todaysDate) {
    return next({
      status: 400,
      message: `reservationDateToCompare: ${reservationDateToCompare}
      past date: ${reservationDateToCompare < todaysDate}`,
    });
  }
  return next();
}

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
  create: [hasRequiredProperties, checkReservationForClosedDay, checkReservationForPastDates, asyncErrorBoundary(create)],
};
