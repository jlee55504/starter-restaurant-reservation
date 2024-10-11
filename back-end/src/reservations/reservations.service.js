const knex = require("../db/connection");

const create = reservation => {
    return knex("reservations")
        .insert(reservation)
        .returning("*")
        .then((createdReservation) => createdReservation[0]);
};

const read = reservation_date => {
    return knex("reservations as r")
            .select("*")
            .where({ reservation_date })
            .orderBy("r.reservation_date")
}

const list = () => {
    return knex("reservations").select("*");
}

module.exports = {
    create,
    read,
    list
};