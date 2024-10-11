/**
 * Defines the router for reservation resources.
 *
 * @type {Router}
 */

const router = require("express").Router();
const controller = require("./reservations.controller");
const methodNotAllowed =  require("../errors/methodNotAllowed");
const cors = require("cors")
const corsPost = cors({methods: "POST"})
router.route("/")
.all(cors())
    .get(controller.list)
    .post(controller.create)
    .all(methodNotAllowed);
router.route("/:date")
    .get(controller.read)
module.exports = router;
