const knex = require("../db/connection");

const read = table_id => {
    return knex("seats as s")
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

const update = updatedTable => {
        return knex.transaction((trx) => {
            trx("reservations")
                .where({ "reservation_id": updatedTable.reservation_id })
                .update("status", "seated")
                .then((updatedRecords) => updatedRecords[0])
                .then(() => {
                    return trx("seats")
                    .where({ "table_id": updatedTable.table_id })
                    .update( updatedTable, "*")
                    .then((updatedRecords) => updatedRecords[0]);
                })
                .then(trx.commit)
                .catch(trx.rollback);
        })
}

const destroy = (table) => {
        return knex.transaction((trx) => {
            trx("reservations")
                .where({ "reservation_id": table.reservation_id })
                .update("status", "finished")
                .then((updatedRecords) => updatedRecords[0])
                .then(() => {
                    return trx("seats")
                    .select("reservation_id")
                    .where({ "reservation_id": table.reservation_id })
                    .del();
                })
                .then(trx.commit)
                .catch(trx.rollback);
        });
}
const readReservation = reservation_id => {
    return knex("reservations as r")          
            .select("r.*")
            .where({ "r.reservation_id": reservation_id }) 
            .first();          
}
module.exports = { 
    read,
    list,
    create,
    update,
    destroy,
    readReservation,
}