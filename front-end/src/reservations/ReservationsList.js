import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useLocation, useHistory, Link } from 'react-router-dom';
import { readReservations, listTables, deleteTableAssignment, updateReservation, searchForReservation } from '../utils/api';
import { previous, today } from '../utils/date-time';
import { next } from '../utils/date-time';
import { Button, Card } from "react-bootstrap";
import { formatAsDate, formatAsTime } from "../utils/date-time";
import Dashboard from "../dashboard/Dashboard";
import useQuery from '../utils/useQuery';
function ReservationsList({ reservationsList = [], date }) {
    const query = useQuery();
    const [reservations, setReservations] = useState([]);
    const [reservationsWithDate, setReservationsWithDate] = useState([]);
    const [reservationsError, setReservationsError] = useState(null);
    const history = useHistory();
    const [reservationCancelled, setReservationCancelled] = useState(false);
    const search = useLocation().search;
    const queryParams = new URLSearchParams(search).get("date");
    const [updateReservations, setUpdateReservations] = useState(false);
    useEffect(() => {
      if (!reservationsList || reservationsList.length === 0) {
        setReservations([]);
      } //if (!reservationCancelled) return
       else {  
       console.log(reservationsList)
        //setReservationCancelled(false);
       // const currentReservations = filterReservationsForStatus(reservationsList);
        //console.log(currentReservations)
        setReservationsError(null);
       // setReservationDateAndTime(reservationsList)
        //setReservations(reservationsList.filter(reservation => reservation.status !== "cancelled" && reservation.status !== "finished"));
      //  setReservations(reservationsList)
      //if (reser)
      filterReservationsForStatus(reservationsList)
        //setReservationCancelled(true);
    }
}, [reservationsList]);

useEffect(() => {
    if (!reservationCancelled) return;
    else {
        let currentReservations;
        const abortController = new AbortController();
        let reservationDates = [];
        console.log(reservations)
        if (reservations.length > 0) {
            console.log(reservations) 
          /*  for (const reservation of reservations) {
                
                if (reservationDates.includes(reservation.reservation_date)) continue
                reservationDates.push(reservation.reservation_date);
            }
            console.log(reservationDates)
           readReservations(reservationDates, abortController.signal)
            .then((reservations) => {
                console.log(reservations)
                return reservations.filter(reservation => reservation.status !== "cancelled" && reservation.status !== "finished"); 
            })
            //.then(setReservationDateAndTime)
            .then((reservations) =>{console.log(reservations); return reservations})
            .then(setReservations)
            .then((reservations) =>{console.log(reservations); return reservations})
            .catch(setReservationsError)
            
            return () => abortController.abort();*/
            filterReservationsForStatus(reservations)
            setReservationCancelled(false);
          }
      
    }
  }, [reservationCancelled]);
 /* useEffect(() => {
    if (!reservationCancelled) return;
    else {
        let currentReservations;
        if (reservations.length > 0) { 
            currentReservations = reservationsList.filter(reservation => reservation.status !== "cancelled" && reservation.status !== "finished") 
          }
          console.log(currentReservations)
      setReservations(currentReservations);
        setReservationCancelled(false);
    }
  }, [updateReservations]);*/

  function filterReservationsForStatus(reservations) {
    let currentReservations;
        const abortController = new AbortController();
        let reservationDates = [];
        if (reservations.length === 0) return [];
        else {
        for (const reservation of reservations) {
          //  if (reservationDates.includes(reservation.reservation_date)) continue
            reservationDates.push(reservation.reservation_date);
        }
        console.log(reservationDates)
       readReservations(reservationDates, abortController.signal)
        .then((reservations) => {
           // console.log(reservations)
            return reservations.filter(reservation => reservation.status !== "cancelled" && reservation.status !== "finished"); 
        })
        .then((reservations) =>{console.log(reservations); return reservations})
        .then(setReservationDateAndTime)
        .then((reservations) =>{console.log(reservations); return reservations})
        .then(setReservations)
        .catch(setReservationsError)
        return () => abortController.abort();
        }}

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
   


    function updateReservationStatus(reservation) {
        const abortController = new AbortController();
        const newReservationStatus = { status: "seated" };
        updateReservation(reservation.reservation_id, newReservationStatus, abortController.signal)
          .catch(setReservationsError);
        history.push(`/reservations/${reservation.reservation_id}/seat`);
        return () => abortController.abort();
      }
      
      function cancelReservation (reservation) {
        const abortController = new AbortController();
        const confirm = window.confirm("Do you want to cancel this reservation? This cannot be undone.");
        if (confirm === true) {
          const newReservationStatus = { status: "cancelled" };
          updateReservation(reservation.reservation_id, newReservationStatus, abortController.signal)
            .catch(setReservationsError);
            setReservationCancelled(true);
          return () => abortController.abort();
        } else return;
      }
      //{reservationCancelled ? <Dashboard date={query.get("date")} reservationCancelled={reservationCancelled} /> : null}
//console.log(reservations)
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
            <Button className="btn btn-primary" type="button" onClick={() => updateReservationStatus(reservation)}>Seat</Button>
            <Button className="btn btn-secondary" type="button" onClick={() => history.push(`/reservations/${reservation.reservation_id}/edit`)}>Edit</Button>
            <Button data-reservation-id-cancel={reservation.reservation_id} className="btn btn-danger" type="button" onClick={() => cancelReservation(reservation)}>Cancel</Button>
          </Card.Body>
        </Card>
      }) : <h6>No reservations for this day</h6>}
        </div>
    )
}

export default ReservationsList;