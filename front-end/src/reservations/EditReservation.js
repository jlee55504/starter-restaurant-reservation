import React, { useEffect, useState } from "react";
import ErrorAlert from "../layout/ErrorAlert";
import { useHistory, useParams } from 'react-router-dom';
import { readReservationForEdit, updateEditedReservation } from '../utils/api';
import { Button } from "react-bootstrap";

function EditReservation() {
    const [error, setError] = useState(null);
    const [ firstName, setFirstName ] = useState("");
    const [ lastName, setLastName ] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [reservationDate, setReservationDate] = useState("");
    const [reservationTime, setReservationTime] = useState("");
    const [people, setPeople] = useState(1);
    const [status, setStatus] = useState("");
    const [reservationCanBeEdited, setReservationCanBeEdited] = useState(true);
    const [reservationId, setReserevationId] = useState(0);
    const history = useHistory();
    const editedReservationId = useParams();

    useEffect(loadReservation, [reservationId]);

    async function loadReservation() {
        const abortController = new AbortController();
        setError(null);
        try {
            const reservationForEditing = await readReservationForEdit(editedReservationId.reservation_id, abortController.signal);
            if (reservationForEditing.length === 0) {
                return ()=> abortController.abort();
            }
            else {
                if (reservationForEditing.status !== "booked")  setReservationCanBeEdited(false)
                else {
                    setReserevationId(reservationForEditing.reservation_id);
                    setFirstName(reservationForEditing.first_name);
                    setLastName(reservationForEditing.last_name);
                    setMobileNumber(reservationForEditing.mobile_number);
                    setReservationDate(reservationForEditing.reservation_date);
                    setReservationTime(reservationForEditing.reservation_time);
                    setPeople(reservationForEditing.people);
                    setStatus(reservationForEditing.status);
                    return reservationForEditing;
                }
                return ()=> abortController.abort();
            }
        } catch (error) {
            setError(error);
        }
    }

    const handleChange = ({ target }) => {
        if (target.name === "first_name") setFirstName( target.value );
        if (target.name === "last_name") setLastName(target.value);
        if (target.name === "mobile_number") setMobileNumber(target.value);
        if (target.name === "reservation_date") setReservationDate(target.value);
        if (target.name === "reservation_time") setReservationTime(target.value);
        if (target.name === "people") setPeople(target.value);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const abortController = new AbortController();
        try {
            const updatedReservation = {
                reservation_id: reservationId,
                first_name: firstName,
                last_name: lastName,
                mobile_number: mobileNumber,
                reservation_date: reservationDate,
                reservation_time: reservationTime,
                people: Number(people),
            }
            await updateEditedReservation(updatedReservation, abortController.signal);
            history.goBack();
            return () => abortController.abort(); 
        } catch (error) {
            setError(error);
        }

    }

    return (
    <main>
        <h1>Edit Reservation</h1>
        <ErrorAlert error={error}/> 
            {reservationCanBeEdited ? 
            <div>
                <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="first_name">
                    <input type="text" name="first_name" id="first_name" placeholder="First Name" value={ firstName } onChange={ handleChange } maxLength={ 50 } required></input>
                </label>
                <br />
                <label htmlFor="last_name">
                    <input type="text" name="last_name" id="last_name" placeholder="Last Name" value={ lastName } onChange={ handleChange } maxLength={ 50 } required></input>
                </label>
                <br />
                <label htmlFor="mobile_number">
                    <input type="text" name="mobile_number" id="mobile_number" placeholder="Enter a mobile phone number" value={ mobileNumber } onChange={ handleChange }  required/>
                </label>
                <br />
                <label htmlFor="reservation_date">
                    <input type="date" name="reservation_date" id="reservation_date" placeholder="YYYY-MM-DD" pattern="\d{4}-\d{2}-\d{2}" value={ reservationDate } onChange={ handleChange } required/>
                </label>
                <br />
                <label htmlFor="reservation_time">
                    <input type="time" name="reservation_time" id="reservation_time" placeholder="HH:MM" pattern="[0-9]{2}:[0-9]{2}" value={ reservationTime } onChange={ handleChange } required/>
                </label>
                <br />
                <label htmlFor="people">
                    <input type="number" name="people" id="people" placeholder="Number of people" pattern="[0-9]*" value={ people } onChange={ handleChange } min={ 1 }  required></input>
                </label>
                <br />
              </div>
                <div className="buttons-div">
                  <Button type="button" className="btn btn-secondary"onClick={() => history.goBack()}>Cancel</Button> 
                  <Button type="submit" className="btn btn-primary" >Submit</Button>                   
                </div>
            </form>

            </div> : 
            <div>
                <h3>This reservation cannot be edited.</h3>
                <Button type="button" className="btn btn-secondary"onClick={() => history.goBack()}>Back</Button> 
            </div>
                }
    </main>)
}

export default EditReservation;