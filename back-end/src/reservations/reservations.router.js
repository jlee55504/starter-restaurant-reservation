/**
 * Defines the router for reservation resources.
 *
 * @type {Router}
 */

const router = require("express").Router();
const controller = require("./reservations.controller");
const methodNotAllowed =  require("../errors/methodNotAllowed");

router.route("/")
   .get(controller.search)
   .get(controller.readReservations)
    .get(controller.list)
    .post(controller.create)
    .all(methodNotAllowed);

router.route("/:reservation_id")
    .get(controller.readReservation)
    .all(methodNotAllowed);
   
router.route("/:reservation_id/seat")
    .get(controller.readReservation)
    .all(methodNotAllowed);

router.route("/:reservation_id/status")    
    .put(controller.update)
    .all(methodNotAllowed);
module.exports = router;
