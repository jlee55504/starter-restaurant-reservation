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


  const reservationsExist = async (req, res, next) => {
    const { date, mobile_number } = req.query;
    let reservation;
  
    if (!mobile_number && date && !req.params.reservation_id) reservation = await reservationsService.readReservations(date);
    else if (!date && mobile_number && !req.params.reservation_id) reservation = await reservationsService.search(mobile_number);
    else if (!date && !mobile_number && !req.params.reservation_id) reservation = await reservationsService.list();
    if (reservation) {
      // This code may need to be deleted to pass the tests
      if (mobile_number && reservation.length === 0) {
          return next({
            status: 404,
            message: "No reservations found",
          });
      };
      res.locals.reservation = reservation;
      return next();
    };
    next({
      status: 404,
      message: "Reservation cannot be found.",
    });
  };

  const reservationExists = async (req, res, next) => {
    const { reservation_id } = req.params;  
    const reservationExists = await reservationsService.readReservation(reservation_id);
    if (reservationExists) {
     res.locals.reservation = reservationExists;
     return next();
   };
   next({
     status: 404,
     message: "Reservation cannot be found.",
   });
 };  

const updatedReservationHasValidProperties = async (req, res, next) => {
  const { reservation_id } = req.params;
  const reservation = await reservationsService.readReservation(reservation_id);
  if (reservation && hasProperties(res.locals.reservation.first_name, res.locals.reservation.last_name, res.locals.reservation.people, res.locals.reservation.mobile_number, res.locals.reservation.reservation_date, res.locals.reservation_time)) {
    res.locals.reservation = reservation;
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
  const { data: { reservation_time, reservation_date } = {} } = req.body;
  const newReservationDate = new Date(`${reservation_date} ${reservation_time}`);
  const currentDate = new Date();
  const currentTime = currentDate.toLocaleTimeString('en-US', { hour12: false });
  //const newReservationTime = newReservationDate.toLocaleTimeString('en-US', { hour12: false });
  const reservationDateToCompare = parseInt(reservation_date.replace(/-/g, '\/').split('/').join(''));
  let todaysDate = new Date();
  todaysDate = parseInt(todaysDate.toLocaleDateString('pt-br').split( '/' ).reverse().join(''));
  if (reservationDateToCompare === todaysDate && currentTime > newReservationDate.toLocaleTimeString('en-US', { hour12: false }) || reservationDateToCompare < todaysDate) {
    return next({
      status: 400,
      message: `Only future reservations are allowed.`,
    });
  };
  next();
};

const checkReservationTimeforBeforeOpeningHours = (req, res, next) => {
  const { data: { reservation_time, reservation_date } = {} } = req.body;
  const newReservationDate = new Date(`${reservation_date} ${reservation_time}`);
        const newReservationDateHour = newReservationDate.getHours();
        const newReservationDateMinutes = newReservationDate.getMinutes();
        if (newReservationDateHour < 10 || newReservationDateHour === 10 && newReservationDateMinutes < 30) {
          return next({
            status: 400,
            message: "This restaurant is closed before before 10:30 AM. Please try again. ",
          });
        };
      next();
};

const checkReservationTimeforAfterClosingHours = (req, res, next) => {
  const { data: { reservation_time, reservation_date } = {} } = req.body;
  const newReservationDate = new Date(`${reservation_date} ${reservation_time}`);
        const newReservationDateHour = newReservationDate.getHours();
        const newReservationDateMinutes = newReservationDate.getMinutes();
        if (newReservationDateHour > 21 || newReservationDateHour === 21 && newReservationDateMinutes > 30) {
          return next({
            status: 400,
            message: "It's too late today to book that reservation. Please try again. ",
          });
        };
      next();
};


// Route handlers
const read = (req, res) => {
  const data = res.locals.reservation;
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

const update = async (req, res) => {
  const updatedReservation = {
    ...res.locals.reservation,
    reservation_id: res.locals.reservation.reservation_id,
    status: req.body.data.status,
  };
  const data = await reservationsService.update(updatedReservation);
  res.json({ data });
};

const updateEditedreservation = async (req, res) => {
  const {data = {}} = req.body;
  const updatedReservation = {
    ...data,
    reservation_id: data.reservation_id,
  };
  const updatedData = await reservationsService.update(updatedReservation);
  res.json({ updatedData });
};

module.exports = {
  readReservations: [asyncErrorBoundary(reservationsExist), read],
  readReservation: [asyncErrorBoundary(reservationExists), read],
  search: [asyncErrorBoundary(reservationsExist), read],
  list: [asyncErrorBoundary(list)],
  create: [hasRequiredProperties, checkReservationForClosedDay, checkReservationTimeforBeforeOpeningHours, checkReservationTimeforAfterClosingHours, checkReservationForPastDates, asyncErrorBoundary(create)],
  update: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(updatedReservationHasValidProperties), asyncErrorBoundary(update)],
  updateEditedreservation: [asyncErrorBoundary(reservationExists), hasRequiredProperties, checkReservationForClosedDay, checkReservationTimeforBeforeOpeningHours, checkReservationTimeforAfterClosingHours, checkReservationForPastDates, asyncErrorBoundary(updateEditedreservation)],
};
