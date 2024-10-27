import React from "react";

import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import CreateNewReservation from "../reservations/CreateNewReservation";
import useQuery from '../utils/useQuery';
import CreateNewTable from '../tables/CreateNewTable';
import ReservationsSeat from "../reservations/ReservationsSeat";
import SearchForReservation from "../searchForReservation/SearchForReservation";
import EditReservation from "../reservations/EditReservation";
import EditCreateForm from "../reservations/EditCreateForm";
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
      <Route path="/reservations/:reservationId/seat">
            <ReservationsSeat />
        </Route>
      <Route path="/reservations/new">
        <EditCreateForm />
      </Route>
      <Route path="/reservations/:reservation_id/edit">
        <EditCreateForm />
      </Route>
      <Route path="/dashboard/:reservationDate">
      <Dashboard date={query.get("date")} />
      </Route>
      <Route path="/tables/new">
        <CreateNewTable />
      </Route>
      <Route path="/dashboard">
        <Dashboard date={query.get("date") || today()} />
      </Route>
      <Route path="/search">
        <SearchForReservation  />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
