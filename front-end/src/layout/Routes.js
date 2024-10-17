import React from "react";

import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import CreateNewReservation from "../reservations/CreateNewReservation";
import useQuery from '../utils/useQuery';
import CreateNewTable from '../tables/CreateNewTable';
import ReservationSeats from "../reservations/ReservationsSeat";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
  const query = useQuery();
  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/reservations">
      <Redirect to={"/dashboard"} />
      </Route>
      <Route path="/reservations/new">
        <CreateNewReservation />
      </Route>
      <Route path="/dashboard/:reservationDate">
      <Dashboard date={query.get("date")} />
      </Route>
      <Route path="/tables/new">
        <CreateNewTable />
        <Route path="/reservations/:reservation_id/seat">
            <ReservationSeats  />
        </Route>
      </Route>
      <Route path="/dashboard">
        <Dashboard date={query.get("date") || today()} />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
