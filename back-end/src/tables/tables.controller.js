const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const seatsService = require("./tables.service");
const hasProperties = require("../errors/hasProperties");
const { Resolver } = require("webpack");
const hasRequiredProperties = hasProperties("table_name", "capacity", "reservation_id");
//import { readReservation } from "../reservations/reservations.controller";
//const updatedTableHasRequiredProperties = hasProperties("reservation_id")
// Middleware functions
const seatExists = async (req, res, next) => {
    const tableExists = await seatsService.read(req.params.table_id);
    if (tableExists) {
        res.locals.table = tableExists;
        res.locals.table_id = tableExists.table_id;
        return next();
    };
    next({
        status: 404,
        message: "Table cannot be found.",
    });
};

const tableCapacityIsLessThanPeople = async (req, res, next) => {    
    const reservation = await seatsService.readReservation(req.body.data.reservation_id)
   if (reservation) {
    if (reservation.people > res.locals.table.capacity) {
      return next({
        status: 400,
        message: "Table capacity is insufficient for the reservation."
      })   
   } else return next()
}
    next({
        status: 404,
        message: "Reservation cannot be found.",
    });
}

 const tableIsOccupied = async (req, res, next) => {
    const tableExists = await seatsService.read(req.params.table_id);
    if (tableExists) {
        if (tableExists.reservation_id) {
          return next({
            status:400,
            message: "This table is already occupied.",
          });
        } else return next();
    };
    next({
        status: 404,
        message: "Table cannot be found.",
    });
    }

    const tableIsNotOccupied = async (req, res, next) => {
        const tableExists = await seatsService.read(req.params.table_id);
        if (tableExists) {
            if (!tableExists.reservation_id) {
              return next({
                status:400,
                message: "This table is not occupied.",
              });
            } else return next();
        };
        next({
            status: 404,
            message: "Table cannot be found.",
        });       
    }

// Route handlers
const read = (req, res) => {
    const data = res.locals.table;
    res.json({ data });
}

const list = async (req, res) => {
    const data = await seatsService.list();
    res.json({ data })
}

const update = async (req, res) => {
    const {data = {} } = req.body;
    const { reservation_id } = data;
    const updatedTable = {
        ...res.locals.table,
        reservation_id: reservation_id,
        table_id: res.locals.table_id,
    }
    const table = await seatsService.update(updatedTable);
    res.json({ table });
}

const create = async (req, res) => {
    const data = await seatsService.create(req.body.data);
    res.status(201).json({ data });
}


const destroy = async (req, res) => {
    const { table } = res.locals;
    const { data  = {}} = req.body;
    const { reservationStatus } = data;
    const tableNowAvailable = {
        ...table,
        table_id: res.locals.table_id,
        reservation_id: null,
    }
    await seatsService.destroy(table, reservationStatus);
   const replaceSeat = await seatsService.create(tableNowAvailable);
    res.status(204).json({ replaceSeat });
}

module.exports = {
    read: [asyncErrorBoundary(seatExists), read],
    create: [hasRequiredProperties, asyncErrorBoundary(create)],
    list: [asyncErrorBoundary(list)],
    update: [asyncErrorBoundary(seatExists), asyncErrorBoundary(tableCapacityIsLessThanPeople), asyncErrorBoundary(tableIsOccupied), asyncErrorBoundary(update)],
    delete: [asyncErrorBoundary(seatExists), asyncErrorBoundary(tableIsNotOccupied), asyncErrorBoundary(destroy)]
}