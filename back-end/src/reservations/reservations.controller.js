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
    let reservation
    if (!mobile_number && date && !req.params.reservation_id) reservation = await reservationsService.readReservations(req.query.date);
    else if (!date && mobile_number && !req.params.reservation_id) reservation = await reservationsService.search(req.query.mobile_number);
    else if (!date && !mobile_number && !req.params.reservation_id) return next();
    //else reservation = await reservationsService.list();
    if (reservation) {
      res.locals.reservation = reservation;
      return next();
    };
    if (!reservation ) {
      next({
      status: 404,
      message: "Reservation cannot be found.",
    });
  }
  };

  const reservationExists = async (req, res, next) => {
    const { reservation_id } = req.params;
    const reservation = await reservationsService.readReservation(reservation_id);
   if (reservation) {
     res.locals.reservation = reservation;
     return next();
   };
   next({
     status: 404,
     message: "Reservation cannot be found.",
   });
 };  

const reservationExistsByPhone = async (req, res, next) => {
    const { mobile_number, date } = req.query;
    let reservation;
   if (!date)  reservation = await reservationsService.search(mobile_number);
    if (reservation) {
      res.locals.reservation = reservation;
      return next();
     };
     next({
       status: 404,
       message: "Reservation cannot be found.",
     });
  } 

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
  //const { data = {} } = req.body;
  const { data: { reservation_time, reservation_date } = {} } = req.body;
  //const { reservation_date } = data;
  const newReservationDate = new Date(`${reservation_date} ${reservation_time}`);
  const currentDate = new Date();
  const currentTime = currentDate.toLocaleTimeString('en-US', { hour12: false });
  const newReservationTime = newReservationDate.toLocaleTimeString('en-US', { hour12: false });
  const reservationDateToCompare = parseInt(reservation_date.replace(/-/g, '\/').split('/').join(''));
  let todaysDate = new Date();
  todaysDate = parseInt(todaysDate.toLocaleDateString('pt-br').split( '/' ).reverse().join(''));
  if (reservationDateToCompare === todaysDate && currentTime.toLocaleTimeString('en-US', { hour12: false }) > newReservationDate.toLocaleTimeString('en-US', { hour12: false }) || reservationDateToCompare < todaysDate) {
    return next({
      status: 400,
      message: `Only future reservations are allowed.`,
    });
  }
  next();
}

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
}

const checkReservationTimeforAfterClosingHours = (req, res, next) => {
  const { data: { reservation_time, reservation_date } = {} } = req.body;
  const newReservationDate = new Date(`${reservation_date} ${reservation_time}`);
        const newReservationDateHour = newReservationDate.getHours();
        const newReservationDateMinutes = newReservationDate.getMinutes();
        if (newReservationDateHour > 21 || newReservationDateHour === 21 && newReservationDateMinutes > 30) {
          return next({
            status: 400,
            message: "It's too late today to book that reservation. Please try again.  ",
          });
        };
      next();
}

const checkReservationForPastTime = (req, res, next) => {
  const { data: { reservation_time, reservation_date } = {} } = req.body;
  const newReservationDate = new Date(`${reservation_date} ${reservation_time}`);
  const newReservationDateHour = newReservationDate.getHours();
  const newReservationDateMinutes = newReservationDate.getMinutes();
  const currentDate = new Date();
  const currentTime = currentDate.toLocaleTimeString('en-US', { hour12: false });
  const newReservationTime = newReservationDate.toLocaleTimeString('en-US', { hour12: false });
  let todaysDate = new Date();
  const todaysDateHour = todaysDate.getHours();
  const todaysDateMinutes = todaysDate.getMinutes();
  
  todaysDate = parseInt(todaysDate.toLocaleDateString('pt-br').split( '/' ).reverse().join(''));
  let reservationDateToCompare = parseInt(reservation_date.replace(/-/g, '\/').split('/').join(''));
  if (/*reservationDateToCompare >= todaysDate && newReservationDateHour > 21 && newReservationDateHour > 10 && currentTime > currentDate ||
    reservationDateToCompare >= todaysDate && newReservationDateHour < 20 && newReservationDateHour > 10 && todaysDateMinutes > newReservationDateMinutes || 
    reservationDateToCompare >= todaysDate && newReservationDateHour === 10 && newReservationDateMinutes < 30 && todaysDateMinutes > newReservationDateMinutes || 
    reservationDateToCompare >= todaysDate && newReservationDateHour === 21 && newReservationDateMinutes < 30 && currentTime > currentDate*/
    currentTime > newReservationTime
  ) {
    return next({
      status: 400,
      message: "Only future reservations are allowed.",
    });
  };
  next()
}


// Route handlers
const read = (req, res) => {
  const data = res.locals.reservation;
  const a = req.query.mobile_number
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
}


module.exports = {
  readReservations: [asyncErrorBoundary(reservationsExist), read],
  readReservation: [asyncErrorBoundary(reservationExists), read],
  search: [asyncErrorBoundary(reservationsExist), read],
  list: [ asyncErrorBoundary(list)],
  create: [hasRequiredProperties, checkReservationForClosedDay, checkReservationTimeforBeforeOpeningHours, checkReservationTimeforAfterClosingHours, checkReservationForPastDates, asyncErrorBoundary(create)],
  update: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(update)],
};
