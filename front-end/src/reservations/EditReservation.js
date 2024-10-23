import React, { useEffect, useState } from "react";

import ErrorAlert from "../layout/ErrorAlert";
import { useHistory, useParams } from 'react-router-dom';
import { updateReservation, readReservationForEdit } from '../utils/api';
import { Button, Card } from "react-bootstrap";

function EditReservation() {
    //const [reservation, setReservation] = useState([]);
    const [error, setError] = useState(null);
    const [ firstName, setFirstName ] = useState("");
    const [ lastName, setLastName ] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [reservationDate, setReservationDate] = useState("");
    const [reservationTime, setReservationTime] = useState("");
    const [people, setPeople] = useState(1);
 
    const [status, setStatus] = useState("");
    const [reservationCanBeEdited, setReservationCanBeEdited] = useState(true);

    const history = useHistory();
    const reservationId = useParams();
    useEffect(loadReservation, [reservationId])
    function loadReservation() {
        const abortController = new AbortController();
        setError(null);
        readReservationForEdit(reservationId.reservation_id, abortController.signal)
        .then((tables) => {
            if (tables.length === 0) return [];
            else {
              return tables;
            }
          })
          .then((reservation) => {
            if (reservation.status !== "booked") setReservationCanBeEdited(false);
            else {
            console.log(reservation)
            setFirstName(reservation.first_name);
            setLastName(reservation.last_name);
            setMobileNumber(reservation.mobile_number);
            setReservationDate(reservation.reservation_date);
            setReservationTime(reservation.reservation_time);
            setPeople(reservation.people);
            setStatus(reservation.status);
        }
            return reservation;
          })
            //.then(setReservation)
            .catch(setError);
            return ()=> abortController.abort();
    }

    const handleChange = ({ target }) => {
        if (target.name === "status") setStatus( target.value );
        console.log(target.value)
    }

    const handleSubmit = event => {
        event.preventDefault();
        const abortController = new AbortController();
        const newReservationStatus = { status: status };
        updateReservation(reservationId.reservation_id, newReservationStatus, abortController.signal)
           .catch(setError);
        history.goBack();
           return () => abortController.abort(); 
    }

    return (
    <main>
        <h1>Edit Reservation</h1>
        <ErrorAlert error={error}/> 
            {reservationCanBeEdited ? <div>
                <Card>
                  <Card.Body>
                    <Card.Title>Reservation for:</Card.Title>
                    <Card.Subtitle>{firstName} {lastName}</Card.Subtitle>
                    <Card.Text>Mobile number: {mobileNumber}</Card.Text>
                    <Card.Text>Reservation date: {reservationDate}</Card.Text>
                    <Card.Text>Reservation time: {reservationTime}</Card.Text>
                    <Card.Text>Number of people: {people}</Card.Text>
                    <form onSubmit={handleSubmit}>
                    <label htmlFor="status">
                    <select name="status" id="status" placeholder="Edit the booking status" value={ status } onChange={ handleChange }  required>
                        <option value={"booked"}>Booked</option>
                        <option value={"seated"}>Seated</option>
                        <option value={"finished"}>Finished</option>
                    </select>
                </label>
                <div>
                  <Button type="button" className="btn btn-secondary"onClick={() => history.goBack()}>Cancel</Button> 
                  <Button type="submit" className="btn btn-primary" >Submit</Button>                   
                </div>               
                    </form>
                    </Card.Body>
                </Card>

            </div> : 
            <div>
                <h3>This reservation cannot be edited.</h3>
                <Button type="button" className="btn btn-secondary"onClick={() => history.goBack()}>Back</Button> 
            </div>
                }
    </main>)
}

export default EditReservation;