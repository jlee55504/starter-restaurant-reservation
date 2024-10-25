import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useLocation, useHistory } from 'react-router-dom';
import { readReservations, updateReservation, findReservationsById } from '../utils/api';
import { Button, Card } from "react-bootstrap";
import { today } from "../utils/date-time";

import useQuery from '../utils/useQuery';
function ReservationsList({ reservationsList = [] }) {
    const query = useQuery();
    const [reservations, setReservations] = useState([]);
   // const [reservationsWithDate, setReservationsWithDate] = useState([]);
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
            filterReservationsForStatus();
            setReservationCancelled(false);
    }
  }, [reservationCancelled]);

// Updates the tables list when a reservation's status has been changed to "finished" using the "tables" query parameter
  useEffect(() => {
if (!updateTables) return;
else {
  setUpdateTables(false);
  const todaysDate = today();
  if (!date) {
    history.push(`/dashboard?date=${todaysDate}&tables=${true}`);
  }
  else history.push(`/dashboard?date=${date}&tables=${true}`)
}
  }, [updateTables])

  function filterReservationsForStatus() {
        const abortController = new AbortController();
        if (!date && searchByPhone !== "/search"){ 
          const date = reservationsList[0].reservation_date;
          listReservations({date}, abortController.signal)
          .then((reservations) => {
            if (reservations.length === 1) return readReservations(date, abortController.signal)
              if (reservations.length > 1) {   
              reservations = reservations.filter(reservation => reservation.reservation_date === date && reservation.status !== "finished" )
              .map(reservation => { 
                if (reservation.reservation_date === date) { 
                  return reservation.reservation_date;
                };
                return reservation;
              }); console.log(reservations)
            }; if (reservations.length === 0) {
                return [];
              } else {   
                return readReservations(reservations, abortController.signal);
                };
    })
          .then((reservations) => { 
            if (reservations.length > 0) {
            return reservations.filter(reservation => reservation.status !== "cancelled" && reservation.status !== "finished")
          } else return [];
          })
          .then((reservations) => {
            if (reservations.length > 0 ) return setReservationDateAndTime(reservations)
              else return []
          })
          .then((reservations) =>{console.log(reservations); return reservations})
          .then(setReservations)
          .catch(setReservationsError)
          return () => abortController.abort();
        }
      else  if (!date && searchByPhone === "/search"){ 
         const reservationIds = [];
          for (const reservation of reservationsList) {
            reservationIds.push(reservation.reservation_id)
          }
          console.log(reservationIds)
          findReservationsById(reservationIds, abortController.signal)
          .then((reservations) => { 
            if (reservations.length > 0) {
            return reservations;
          } else return [];
          })
          .then((reservations) => {
            if (reservations.length > 0 ) return setReservationDateAndTime(reservations);
              else return [];
          })
          .then((reservations) =>{console.log(reservations); return reservations})
          .then(setReservations)
          .catch(setReservationsError)
          return () => abortController.abort();
        }
       else if (date && searchByPhone !== "/search") {
        
          listReservations({date}, abortController.signal)
        .then((reservations) => {
          
          if (reservations.length === 1) return readReservations(date, abortController.signal)
            if (reservations.length > 1) {   
            reservations = reservations.filter(reservation => reservation.reservation_date === queryParams && reservation.status !== "finished" )
            .map(reservation => { 
              if (reservation.reservation_date === queryParams) { 
                return reservation.reservation_date;
              };
              return reservation;
            }); 
          }; if (reservations.length === 0) {
              return [];
            } else {
              return readReservations(reservations, abortController.signal);
              };
  })
        .then((reservations) => { 
          if (reservations.length > 0) {
          return reservations.filter(reservation => reservation.status !== "cancelled" && reservation.status !== "finished")
        } else return [];
        })
        .then((reservations) => {
          if (reservations.length > 0 ) return setReservationDateAndTime(reservations)
            else return []
        })
        //.then((reservations) =>{console.log(reservations); return reservations})
        .then(setReservations)
        .catch(setReservationsError)
        return () => abortController.abort();}
        }
      

  function setReservationDateAndTime(reservationsList) {
    for (const reservation of reservationsList) {
        const newReservationDate = new Date(`${reservation.reservation_date} ${reservation.reservation_time}`);
        const month = newReservationDate.getMonth() + 1;
        const day = newReservationDate.getDate();    
        reservation.reservation_date = `${month}-${day}-${newReservationDate.getFullYear()}`;
            let minutes = newReservationDate.getMinutes();
            let hours = newReservationDate.getHours();
            let aMPm = "A.M.";
            if (minutes < 10) {
              minutes = `0${minutes}`
            }
            if (hours > 12) {
              hours -= 12;
              aMPm = "P.M."
            }
            reservation.reservation_time = `${hours}:${minutes} ${aMPm}`;     
  }
  return reservationsList;
  }
  async function deleteReservation(reservation) {
    const abortController = new AbortController();
        const newReservationStatus = { status: "finished" };   
        await updateReservation(reservation.reservation_id, newReservationStatus, abortController.signal)
          .catch(setReservationsError);
          setUpdateTables(true);
          return () => abortController.abort();
  }

    async function updateReservationStatus(reservation) {
        const abortController = new AbortController();
        const newReservationStatus = { status: "seated" };
        await updateReservation(reservation.reservation_id, newReservationStatus, abortController.signal)
          .catch(setReservationsError);
        history.push(`/reservations/${reservation.reservation_id}/seat`);
        return () => abortController.abort();
      }
      
   async function cancelReservation(reservation) {
        const abortController = new AbortController();
        const confirm = window.confirm("Do you want to cancel this reservation? This cannot be undone.");
        if (confirm === true) {
          const newReservationStatus = { status: "cancelled" };
       await updateReservation(reservation.reservation_id, newReservationStatus, abortController.signal)
            .catch(setReservationsError);
            setReservationCancelled(true);
          return () => abortController.abort();
        } else return;
      }
     
      //{reservationCancelled ? <Dashboard date={query.get("date")} reservationCancelled={reservationCancelled} /> : null}
//console.log(reservations)
/*<Button className="btn btn-secondary" type="button" onClick={() => history.push(`/reservations/${reservation.reservation_id}/edit`)}>Edit</Button>
            <td data-reservation-id-cancel={reservation.reservation_id}>
                {reservation.status === "booked" ? 
                    (<button className="btn btn-primary"
                            onClick={() => handleClick(reservation.reservation_id)}>
                        Cancel
                    </button>)
                    :
                    null
                }
            </td> 
            
            {reservation.status === "seated" ? <Button className="btn btn-primary" type="button" onClick={() => deleteReservation(reservation)}>Finish</Button>: null}
            */
    return (
        <div>
            <ErrorAlert error={reservationsError} />
            
            {reservations.length > 0 ? reservations.map((reservation, index) => {
        return <Card key={index}>
          <Card.Body>
            <Card.Title>Reservation for:</Card.Title>
            <Card.Subtitle>{reservation.first_name} {reservation.last_name}</Card.Subtitle>
            <Card.Text>Mobile number: {reservation.mobile_number}</Card.Text>
            <Card.Text>Reservation date: {reservation.reservation_date}</Card.Text>
            <Card.Text>Reservation time: {reservation.reservation_time}</Card.Text>
            <Card.Text>Number of people: {reservation.people}</Card.Text>
            <Card.Text data-reservation-id-status={reservation.reservation_id}>Status: {reservation.status}</Card.Text>
            {reservation.status === "booked" ? <Button className="btn btn-primary" type="button" onClick={() => updateReservationStatus(reservation)}>Seat</Button>: null}
            {reservation.status === "booked" ? <Button className="btn btn-secondary" type="button" onClick={() => history.push(`/reservations/${reservation.reservation_id}/edit`)}>Edit</Button>: null}
            <Button data-reservation-id-cancel={reservation.reservation_id} className="btn btn-danger" type="button" onClick={() => cancelReservation(reservation)}>Cancel</Button>
          </Card.Body>
        </Card>
      }) : <h6>No reservations for this day</h6>}
        </div>
    )
}

export default ReservationsList;