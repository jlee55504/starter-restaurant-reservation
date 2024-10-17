const tables = require("./03-seats_table.json");

exports.seed = function (knex) {
  return knex
    .raw("TRUNCATE TABLE seats RESTART IDENTITY CASCADE")
    .then(() => knex("seats").insert([
      {
        "table_name": "Bar #1",
        "capacity": 1
      },
      {
        "table_name": "Bar #2",
        "capacity": 1
      },
      {
        "table_name": "#1",
        "capacity": 6
      },
      {
        "table_name": "#2",
        "capacity": 6
      }
    ]));
};