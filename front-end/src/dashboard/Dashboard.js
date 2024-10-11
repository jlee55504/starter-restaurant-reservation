import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useParams } from 'react-router-dom';
import readReservation from '../utils/api';
/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
 let { reservationDate } = useParams();
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  
  if (reservationDate) { date = reservationDate;
    //const abortController = new AbortController();
    //setReservationsError(null);
    //readReservation({reservationDate}, abortController.signal)
   }
  //console.log(date)
  //useEffect(loadDashboard [reservationDate])
  //else 
  useEffect(loadDashboard, [date]);

  /*const loadReservationDashboard = () => {
    const abortController = new AbortController();
    setReservationsError(null);
    readReservation()
  }*/

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
   /* if (reservationDate) {
      readReservation({date}, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    }*/
   // else// 
   if (date) {
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);}
    return () => abortController.abort();
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for date</h4>
      </div>
      <ErrorAlert error={reservationsError} />
      {JSON.stringify(reservations)}
    </main>
  );
}

export default Dashboard;
