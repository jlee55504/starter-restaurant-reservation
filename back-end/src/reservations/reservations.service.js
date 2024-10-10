const knex = require("../db/connection");

const create = reservation => {
    return knex("reservations")
        .insert(reservation)
        .returning("*")
        .then((createdReservation) => createdReservation[0]);
};

const list = () => {
    return knex("reservations").select("*");
}

module.exports = {
    create,
    list
};