const knex = require("../db/connection");

const create = reservation => {
    return knex("reservations")
        .insert(reservation)
        .returning("*")
        .then((createdReservation) => createdReservation[0]);
};

const readReservations = (reservation_date)  => {
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

const readReservation = reservation_id => {
    return knex("reservations as r")          
            .select("r.*")
            .where({ "r.reservation_id": reservation_id }) 
            .first();          
}

const search = mobile_number => {
        return knex("reservations")
            .whereRaw(
               "translate(mobile_number, '() -', '') like ?",
                `%${mobile_number.replace(/\D/g, "")}%`)
            .orderBy("reservation_date");
    }

const update = updatedReservation => {
    if (updatedReservation.status === "finished"){
        return knex.transaction((trx) => {
            trx("seats")
                    .select("reservation_id")
                    .where({ "reservation_id": updatedReservation.reservation_id })
                    .update("reservation_id", null)
                    .then((updatedRecords) => updatedRecords[0])
                .then(() => {
                    return trx("reservations")
                    .where({ "reservation_id": updatedReservation.reservation_id })
                    .update(updatedReservation, "*")
                    .then((updatedRecords) => updatedRecords[0])
                })
                .then(trx.commit)
                .catch(trx.rollback);
        })
    }   else {
        return knex("reservations")
            .select("*")
            .where({ "reservation_id": updatedReservation.reservation_id })
            .update(updatedReservation, "*")
            .then((updatedRecords) => updatedRecords[0]);
        }
}


module.exports = {
    create,
    readReservations,
    readReservation,
    list,
    update,
    search,
};