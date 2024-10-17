const knex = require("../db/connection");

const read = table_id => {
    return knex("seats as r")
        .select("s.*")
        .where({ "s.table_id": table_id })
        .first();
}

const list = () => {
    return knex("seats as s")
        .select("s.*")
        .orderBy("s.table_name");
}

const create = reservation => {
    return knex("seats")
        .insert(reservation)
        .returning("*")
        .then((createdReservation) => createdReservation[0]);
};

module.exports = { 
    read,
    list,
    create,
}