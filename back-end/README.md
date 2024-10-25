# Capstone: Restaurant Reservation System Backend

## Overview:
This project handles reservations for a fine dining restaurant. This application is used by restaurant personnel when a customer calls to request a reservation. 

The back-end of this project handles of of the API calls from the front-end. This folder creates, edits and deletes reservations for the restaurant and assigns/unassigns tables to the reservations.

## Buit with:
  * Express
  * Lodash
  * nodemon
  * CORS
  * Knex
  * Dotenv
  * PG
  * Pino
  * Nanoid
  * Jest and Supertest used for testing

## src

### db

#### migrations
The Knex migrations folder. Holds all of the created tables.

#### seeds
The Knex seeds folder. Holds all of the seeded table data.

#### connection.js
The Knex connection file.


### errors

#### asyncErrorBoundary.js
Ensures errors in async code are property handled.

#### errorHandler.js
An Express API error handler.

#### hasProperties.js
Ensures the submitted data contains the right 'properties'.

#### methodNotAllowed.js
Enusures the wrong HTTP request isn't used on specified routes.

#### notFound.js
An Express API "not found" handler.


### reservations

#### reservations.controller.js
A controller for the reservations resource. Contains all the middleware functions used to check the data being sent and the route handlers used to send the correct data back. The middleware functions checks whether a reservation(s) exist, the data being sent has the right 'properties',and determines if a newly created reservation's data matches the restaurant's date criteria. The route handlers allow a reservation(s) to be listed, updated, and created.

#### reservations.router.js
A router for the reservations resource. The proper route handlers are attached to the right routes.

#### reservations.service.js
A 'service' for the reservations resource. Retrieves the right data from the database.


### tables

#### tables.controller.js
A controller for the tables resource. Contains all the middleware functions used to check the data being sent and the route handlers used to send the correct data back. The middleware functions checks whether a table exists, whether the selected table capacity is big enough for a reservation, and whether a table is occupied or not occupied. The route handlers allow tables to be created, listed, and updated.

#### tables.router.js
A router for the tables resource. The proper route handlers are attached to the right routes.

#### tables.service.js
A 'service' for the tables resource. Retrieves the right data from the database.


### app.js
Defines the Express application and connects routers.


### server.js
Defines the node server.


### test
A folder that contains all of the integration tests.


### .env
connects the URL to my PostgreSQL database instance.


### knexfile.js
The Knex configuration file.


### vercel.json
A vercel deployment configuration file.