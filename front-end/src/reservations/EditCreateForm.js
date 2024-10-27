import React, { useEffect, useState } from "react";
import ErrorAlert from "../layout/ErrorAlert";
import { useHistory, useParams } from 'react-router-dom';
import { updateEditedReservation, readReservationForEdit, makeNewReservation } from '../utils/api';
import { Button } from "react-bootstrap";
import { formatAsDate } from "../utils/date-time";
function EditCreateForm() {
    const history = useHistory();
    const [error, setError] = useState(null);
    const [ firstName, setFirstName ] = useState("");
    const [ lastName, setLastName ] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [reservationDate, setReservationDate] = useState("");
    const [reservationTime, setReservationTime] = useState("");
    const [people, setPeople] = useState(1);
    const [status, setStatus] = useState("");
    const [reservationCanBeEdited, setReservationCanBeEdited] = useState(true);
    const [apiErrors, setApiErrors] = useState(null);
    const [reservationId, setReserevationId] = useState(0);
    const [editReservationPath, setEditReservationPath] = useState(false)
    const editedReservationId = useParams();
    const editedReservationPath = window.location.pathname;
    const [editedReservation, setEditedReservation] = useState({});
    let errorsArray = [];
    let errorCount = 1;
    useEffect(() => {
        if (!editedReservationPath.includes("edit")) { 
            setEditedReservation({});
            setFirstName("");
            setLastName("");
            setMobileNumber("");
            setReservationDate("");
            setReservationTime("");
            setPeople(1);
            setEditReservationPath(false);
            setError(null);
            setApiErrors(null);
            return;
        }
        else {
            setEditReservationPath(true);
            loadReservation();
        }
    }, [editedReservationPath]);

    async function loadReservation() {
        const abortController = new AbortController();
        setError(null);
        setApiErrors(null);
        try {
            const reservationForEditing = await readReservationForEdit(editedReservationId.reservation_id, abortController.signal);
            if (reservationForEditing.length === 0) {
                return ()=> abortController.abort();
            }
            else {
                if (reservationForEditing.status !== "booked")  setReservationCanBeEdited(false);
                else {
                    setReserevationId(reservationForEditing.reservation_id)
                    setFirstName(reservationForEditing.first_name);
                    setLastName(reservationForEditing.last_name);
                    setMobileNumber(reservationForEditing.mobile_number);
                    setReservationDate(reservationForEditing.reservation_date);
                    setReservationTime(reservationForEditing.reservation_time);
                    setPeople(reservationForEditing.people);
                    setStatus(reservationForEditing.status);
                    setEditedReservation(reservationForEditing);
                    return reservationForEditing;
                }
                return ()=> abortController.abort();
            }
        } catch (error) {
            setError(error);
        }
    }
    const handleChange = ({ target }) => {
        if (target.name === "status") setStatus(target.value);
        if (target.name === "first_name") setFirstName( target.value );
        if (target.name === "last_name") setLastName(target.value);
        if (target.name === "mobile_number") setMobileNumber(target.value);
        if (target.name === "reservation_date") setReservationDate(target.value);
        if (target.name === "reservation_time") setReservationTime(target.value);
        if (target.name === "people") setPeople(target.value);
    }    

    const checkReservationForTimeAndDate = reservation => {
        const currentTime = new Date();
        const newReservationDate = new Date(`${reservation.reservation_date} ${reservation.reservation_time}`);
        const newReservationDateHour = newReservationDate.getHours();
        const newReservationDateMinutes = newReservationDate.getMinutes();
        let reservationDateToCompare = parseInt(reservation.reservation_date.replace(/-/g, '').split('/').join(''));
        let todaysDate = new Date();
        todaysDate = Number(todaysDate.toISOString().slice(0,10).replace(/-/g,""));
         todaysDate = todaysDate -1;
        if (newReservationDate.getDay() === 2) {
          errorsArray.push({
            id:errorCount,
            message: "This restaurant is closed on Tuesdays. ",
          });
          errorCount = errorCount + 1;
       }; if (newReservationDateHour < 10 || (newReservationDateHour === 10 && newReservationDateMinutes < 30)) {
            errorsArray.push({
              id:errorCount,
              message: "This restaurant is closed before before 10:30 AM. ",
            });
            errorCount = errorCount + 1;
          }; if (newReservationDateHour > 21 || (newReservationDateHour === 21 && newReservationDateMinutes > 30)) {
                errorsArray.push({
                  id:errorCount,
                  message: "It's too late today to book that reservation. ",});
                errorCount = errorCount + 1;
       }; if ((reservationDateToCompare === todaysDate && currentTime.toLocaleTimeString('en-US', { hour12: false }) > newReservationDate.toLocaleTimeString('en-US', { hour12: false })) || reservationDateToCompare < todaysDate) {
            errorsArray.push({
              id:errorCount,
              message: "Only future reservations are allowed. ",});
            errorCount = errorCount + 1;
          }; if (errorsArray.length > 0) {
               errorsArray.push({
                 id: errorCount, 
                 message: "Please try again."});
               errorCount = errorCount + 1;
               setError(errorsArray);
             }
   }

    const handleSubmit = async (event) => {
        event.preventDefault();
        errorCount = 1;
        setError(null);
        setApiErrors(null);
        errorsArray = []; 
        const abortController = new AbortController();
        
        if (editReservationPath) {
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
                checkReservationForTimeAndDate(updatedReservation)
                await updateEditedReservation(updatedReservation, abortController.signal);
                setEditedReservation({});
                history.goBack();
                return () => abortController.abort(); 
            } catch (error) {
                setReservationDate(editedReservation.reservation_date);
                setReservationTime(editedReservation.reservation_time);
                setApiErrors(error);
            }
        } else {
            try {
                const newReservation = {
                first_name: firstName,
                last_name: lastName,
                mobile_number: mobileNumber,
                reservation_date: reservationDate,
                reservation_time: reservationTime,
                people: Number(people),
            };      
        checkReservationForTimeAndDate(newReservation);
         makeNewReservation(newReservation, abortController.signal)    
        history.push(
            `/dashboard?date=${formatAsDate(newReservation.reservation_date)}`);
        setFirstName("");
        setLastName("");
        setMobileNumber("");
        setReservationDate("");
        setReservationTime("");
        setPeople(1);
        return ()=> abortController.abort();
        } catch (error) {
            //setFirstName("");
            //setLastName("");
            //setMobileNumber("");
            setReservationDate("");
            setReservationTime("");
            //setPeople(1);
            setApiErrors(error);
        }
    } 
    }

    return (
        <main>
            {editReservationPath ? <h1>Edit Reservation</h1> : <h1>New Reservation</h1>}
            <ErrorAlert error={error} />
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
            </div> 
        </main>
    )
}
export default EditCreateForm;