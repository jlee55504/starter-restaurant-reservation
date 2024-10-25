exports.up = function(knex) {
    return knex.schema.table("reservations", (table) => {
        table.string("status")
        .unsigned()
        .nullable()
        .defaultTo("booked");
    });
};

exports.down = function(knex) {
    return knex.schema.table("reservations", (table) => {
        table.dropColumn("status");
    });
};
