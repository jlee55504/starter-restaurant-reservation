const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const seatsService = require("./tables.service");
const hasProperties = require("../errors/hasProperties");
const { Resolver } = require("webpack");
const hasRequiredProperties = hasProperties("table_name", "capacity", "reservation_id");

// Middleware functions
const seatExists = async (req, res, next) => {
    const tableExists = await seatsService.read(req.params.table_id);
    if (tableExists) {
        res.locals.table = tableExists;
        return next();
    };
    next({
        status: 404,
        message: "Table cannot be found.",
    });
};



// Route handlers
const read = (req, res) => {
    const data = res.locals.table;
    res.json({ data });
}

const list = async (req, res) => {
    const data = await seatsService.list();
    res.json({ data })
}

const create = async (req, res) => {
    const data = await seatsService.create(req.body.data);
    res.status(201).json({ data });
}

module.exports = {
    read: [asyncErrorBoundary(seatExists), read],
    create: [hasRequiredProperties, asyncErrorBoundary(create)],
    list: [asyncErrorBoundary(list)],
}