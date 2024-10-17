import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useLocation, useHistory, Link } from 'react-router-dom';
import { readReservations, listTables } from '../utils/api';
import { previous, today } from '../utils/date-time';
import { next } from '../utils/date-time';
import { Button, Card } from "react-bootstrap";
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
  const [tables, setTables] = useState([]);

  useEffect(loadDashboard, [date]);
  
  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then((reservations) => {   
        if (queryParams) {
          let reservationsWithDates;
          if (reservations.length > 0) {
            reservationsWithDates = reservations.filter(reservation => reservation.reservation_date === queryParams)
            .map(reservation => { 
              if (reservation.reservation_date === queryParams) { 
                return reservation.reservation_date;
              };
            });        
          }; if (reservationsWithDates.length <= 0) {  
              setReservationsWithDate([]);
              return [];
          } else {
              return readReservations(reservationsWithDates, abortController.signal);
            };        
        } else {
            return Promise.reject(reservations);
          };
      })
      .then(setReservationsWithDate)
      .catch((response) => {
        let todaysReservations;
        if (response.length > 0) { 
          todaysReservations = response.filter(reservation => reservation.reservation_date === date)
          .map(reservation => { 
            if (reservation.reservation_date === date) { 
              return reservation.reservation_date;
            };
          }) 
        }; if (todaysReservations.length <= 0) {
            setReservations([]);
            return [];
          } else {
              return setReservations(todaysReservations);
            };
      })
      .then(() => {
        return listTables(abortController.signal);
      })
      .then(setTables)
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
       reservationsWithDate.map(reservation => {
        return <Card>
          <Card.Body>
            <Card.Title>Reservation for:</Card.Title>
            <Card.Subtitle>{reservation.first_name} {reservation.last_name}</Card.Subtitle>
            <Card.Text>Mobile number: {reservation.mobile_number}</Card.Text>
            <Card.Text>Reservation date: {reservation.reservation_date}</Card.Text>
            <Card.Text>Reservation time: {reservation.reservation_time}</Card.Text>
            <Card.Text>Number of people: {reservation.people}</Card.Text>
            <a href={`/reservations/${reservation.reservation_id}/seat`}>
            <Button className="btn btn-primary" type="button" onClick={() => console.log("LLLL")} >Seat</Button>
            </a>
          </Card.Body>
        </Card>
      }) : null }
      { reservations.length > 0 && reservationsWithDate.length === 0 ? reservations.map(reservation => {
        return <Card>
          <Card.Body>
            <Card.Title>Reservation for:</Card.Title>
            <Card.Subtitle>{reservation.first_name} {reservation.last_name}</Card.Subtitle>
            <Card.Text>Mobile number: {reservation.mobile_number}</Card.Text>
            <Card.Text>Reservation date: {reservation.reservation_date}</Card.Text>
            <Card.Text>Reservation time: {reservation.reservation_time}</Card.Text>
            <Card.Text>Number of people: {reservation.people}</Card.Text>
            <Button href={`/reservations/${reservation.reservation_id}/seat>`}></Button>
          </Card.Body>
        </Card>
      }) : null }
      { reservations.length === 0 && reservationsWithDate.length === 0 ? <h6>No reservations for this day</h6> : null }
      {tables.length > 0 ? tables.map((table, index) => {
          return <Card>
            <Card.Body>
              <Card.Title>Table:</Card.Title>
              <Card.Subtitle>{table.table_name}</Card.Subtitle>
              <Card.Text>{table.capacity}</Card.Text>
              <Card.Text data-table-id-status={table.table_id}></Card.Text>
            </Card.Body>
          </Card>
      }) : null}
      <div>
          <Button className="btn btn-secondary" onClick={() => {
            history.push(`/dashboard?date=${previous(date)}`);
            }}>Previous day</Button>
          <Button className="btn btn-primary" onClick={() =>{ 
            history.push(`/dashboard?date=${today()}`);
            }}>Today</Button>
          <Button className="btn btn-secondary" onClick={() =>{ 
            history.push(`/dashboard?date=${next(date)}`);
            }}>Next day</Button>
      </div>
    </main>
  );
}

export default Dashboard;
