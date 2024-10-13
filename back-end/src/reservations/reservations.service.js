const knex = require("../db/connection");

const create = reservation => {
    return knex("reservations")
        .insert(reservation)
        .returning("*")
        .then((createdReservation) => createdReservation[0]);
};

const read = (reservation_date)=> {
    return knex("reservations as r")          
            .select("r.*")
            .where({ reservation_date })
            .orderBy("r.reservation_time");                
}

const list = () => {
    return knex("reservations as r")
        .select("r.*")
        .orderBy("r.reservation_time");
}

module.exports = {
    create,
    read,
    list
};