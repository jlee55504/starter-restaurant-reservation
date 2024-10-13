import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useLocation, useHistory } from 'react-router-dom';
import {readReservation} from '../utils/api';
import { previous } from '../utils/date-time';
import { next } from '../utils/date-time';
import { Button } from "react-bootstrap";
/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const history = useHistory();
  const search = useLocation().search;
  const queryParams = new URLSearchParams(search).get("date");
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [reservationsWithDate, setReservationsWithDate] = useState([]);
  const [ previousDaysDate, setPreviousDaysDate ] = useState(false);
  const [nextDaysDate, setNextDaysDate] = useState(false);

  useEffect(loadDashboard, [date]);
  
  const loadPreviousDaysReservations = () => {

  }
  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then((reservations) => {
        if (date === queryParams) {
          if (reservations.length > 0){
          const reservationsWithDates = reservations.filter(reservation => reservation.reservation_date === date)
            .map(reservation => { 
              if (reservation.reservation_date === date){ 
                return reservation.reservation_date;
              }
            })
            return readReservation(reservationsWithDates, abortController.signal); 
          } else {
              setReservationsWithDate([]);
              return;
          }        
        } else {
            return Promise.reject(reservations);
          }
      })
      .then(setReservationsWithDate)
      .catch((reservations) => {
        if (reservations.length > 0){ 
        const todaysReservations = reservations.filter(reservation => reservation.reservation_date === date)
        .map(reservation => { 
          if (reservation.reservation_date === date) { 
            return reservation.reservation_date;
          }
        });
        return setReservations(todaysReservations);
      } else {
          setReservations([])
          return;
      }
    })
      .catch(setReservationsError);
      return () => abortController.abort();
    }

return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for date</h4>
      </div>
      <ErrorAlert error={reservationsError} />
      { reservationsWithDate.length > 0 ?
       JSON.stringify(reservationsWithDate) : null }
      { reservations.length > 0 && reservationsWithDate.length === 0 ? JSON.stringify(reservations) : null }
      { reservations.length === 0 && reservationsWithDate.length === 0 ? <h6>No reservations today</h6> : null }
      <div>
          <Button className="btn btn-secondary" >Previous day</Button>
          <Button className="btn btn-primary">Today</Button>
          <Button className="btn btn-secondary">Next day</Button>
      </div>
    </main>
  );
}

export default Dashboard;
