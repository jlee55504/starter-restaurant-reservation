import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useLocation, useHistory } from 'react-router-dom';
import { readReservations, updateReservation, findReservationsById, setReservationDateAndTime } from '../utils/api';
import { Button, Card } from "react-bootstrap";
import { today } from "../utils/date-time";

import useQuery from '../utils/useQuery';
function ReservationsList({ reservationsList = [] }) {
    const query = useQuery();
    const [reservations, setReservations] = useState([]);
    const [reservationsError, setReservationsError] = useState(null);
    const history = useHistory();
    const [reservationCancelled, setReservationCancelled] = useState(false);
    const [reservationFinished, setReservationFinished] = useState(false);
    const search = useLocation().search;
    const queryParams = new URLSearchParams(search).get("date");
    const [updateTables, setUpdateTables] = useState(false);
    let date = query.get("date");
    let searchByPhone = window.location.pathname;
   
  useEffect(() => {
      if (!reservationsList || reservationsList.length === 0) {
        setReservations([]);
        return;
      } 
       else {  
        setReservationsError(null);
      filterReservationsForStatus();
    }
}, [reservationsList]);

// Updates the reservations list when a reservation has been cancelled
useEffect(() => {
    if (!reservationCancelled) return;
    else {
        //filterReservationsForStatus();
        setReservationCancelled(false);
        const todaysDate = today();
        if (!date) {
          history.push(`/dashboard?date=${todaysDate}&reservationCancelled=${true}`);
        }
        else history.push(`/dashboard?date=${date}&reservationCancelled=${true}`);
    }
  }, [reservationCancelled]);

// Updates the tables list when a reservation's status has been changed to "finished" using the "tables" query parameter
  useEffect(() => {
if (!updateTables) return;
else {
  setUpdateTables(false);
  const todaysDate = today();
  if (!date) {
    console.log("ppp")
    history.push(`/dashboard?date=${todaysDate}&tables=${true}`);
  }
  else history.push(`/dashboard?date=${date}&tables=${true}`);
}
  }, [updateTables])

  async function filterReservationsForStatus() {
        const abortController = new AbortController();
        if (!date && searchByPhone !== "/search"){ 
          const date = reservationsList[0].reservation_date;
          try {
            const reservationList = await listReservations({date}, abortController.signal);
            if (reservationList.length === 0) {
              setReservations([]);
              return () => abortController.abort(); 
            } else if (reservationList.length === 1) {
              const singleReservation = await readReservations(date, abortController.signal);
              const reservationWithCorrectTimeAndDate = setReservationDateAndTime(singleReservation);
              setReservations(reservationWithCorrectTimeAndDate);
              return () => abortController.abort(); 
            } else {
              const filteredReservations = reservationList.filter(reservation => reservation.reservation_date === date && reservation.status !== "finished" && reservation.status !== "cancelled")
              .map(reservation => { 
                if (reservation.reservation_date === date) { 
                  return reservation.reservation_date;
                };
                return reservation;
              });
              if (filteredReservations.length === 0) {
                setReservations([]);
                return () => abortController.abort(); 
            }
              const currentReservations = await readReservations(filteredReservations);
              const refilteredReservationsList =  currentReservations.filter(reservation => reservation.status !== "cancelled" && reservation.status !== "finished");
              const reservationsListWithCorrectDateAndTime = setReservationDateAndTime(refilteredReservationsList);
              setReservations(reservationsListWithCorrectDateAndTime);
              return () => abortController.abort(); 
              }
          } catch (error) {
              setReservationsError(error)
          }} else if (!date && searchByPhone === "/search"){ 
               const reservationIds = [];
         try {
          for (const reservation of reservationsList) {
            reservationIds.push(reservation.reservation_id)
          }
          const reservationList = await findReservationsById(reservationIds, abortController.signal);
          if (reservationList.length > 0) {
            const reservationsListWithCorrectDateAndTime = setReservationDateAndTime(reservationList);
            setReservations(reservationsListWithCorrectDateAndTime);
            return () => abortController.abort(); 
          } else setReservations([]);
         } catch (error) {
              setReservationsError(error)
         }
        }
       else if (date && searchByPhone !== "/search") { 
        try {
         const reservationList = await listReservations({date}, abortController.signal);
          if (reservationList.length === 0) {
            setReservations([]);
            return () => abortController.abort(); 
          } else if (reservationList.length === 1) {
              const singleReservation = await readReservations(date, abortController.signal);
              const reservationWithCorrectTimeAndDate = setReservationDateAndTime(singleReservation);
              setReservations(reservationWithCorrectTimeAndDate);
              return () => abortController.abort(); 
            } else {
              const filteredReservations = reservationList.filter(reservation => reservation.reservation_date === queryParams && reservation.status !== "finished" && reservation.status !== "cancelled")
              .map(reservation => { 
                if (reservation.reservation_date === queryParams) { 
                  return reservation.reservation_date;
                };
                return reservation;
              });
              if (filteredReservations.length === 0) {
                  setReservations([]);
                  return () => abortController.abort(); 
              } 
              const currentReservations = await readReservations(filteredReservations, abortController.signal);
              const refilteredReservationsList =  currentReservations.filter(reservation => reservation.status !== "cancelled" && reservation.status !== "finished");
              const reservationsListWithCorrectDateAndTime = setReservationDateAndTime(refilteredReservationsList);
              setReservations(reservationsListWithCorrectDateAndTime);
              return () => abortController.abort(); 
              }
        } catch (error) {
             setReservationsError(error)
        }
      }     
      }
      
   async function cancelReservation(reservation) {
        const abortController = new AbortController();
        const confirm = window.confirm("Do you want to cancel this reservation? This cannot be undone.");
        if (confirm === true) {
          const newReservationStatus = { status: "cancelled" };
          try {
            await updateReservation(reservation.reservation_id, newReservationStatus, abortController.signal);
            setReservationCancelled(true);
          return () => abortController.abort();
          } catch (error) {
               setReservationsError(error)
          }
        } else return;
      }

    return (
        <div>
            <ErrorAlert error={reservationsError} />     
            {reservations.length > 0 ? reservations.map((reservation) => {
        return <Card key={reservation.reservation_id}>
          <Card.Body>
            <Card.Title>Reservation for:</Card.Title>
            <Card.Subtitle>{reservation.first_name} {reservation.last_name}</Card.Subtitle>
            <Card.Text>Mobile number: {reservation.mobile_number}</Card.Text>
            <Card.Text>Reservation date: {reservation.reservation_date}</Card.Text>
            <Card.Text>Reservation time: {reservation.reservation_time}</Card.Text>
            <Card.Text>Number of people: {reservation.people}</Card.Text>
            <Card.Text data-reservation-id-status={reservation.reservation_id}>Status: {reservation.status}</Card.Text>
            {reservation.status === "booked" ? <Button className="btn btn-primary" type="button" onClick={() => history.push(`/reservations/${reservation.reservation_id}/seat`)}>Seat</Button>: null}
            {reservation.status === "booked" ? <Button className="btn btn-secondary" type="button" onClick={() => history.push(`/reservations/${reservation.reservation_id}/edit`)}>Edit</Button>: null}
            {reservation.status === "cancelled" || reservation.status === "finished" ? null : <Button data-reservation-id-cancel={reservation.reservation_id} className="btn btn-danger" type="button" onClick={() => cancelReservation(reservation)}>Cancel</Button>}
          </Card.Body>
        </Card>
      }) : <h6>No reservations for this day</h6>}
        </div>
    )
}

export default ReservationsList;