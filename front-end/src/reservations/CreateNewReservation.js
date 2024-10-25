/* Imports 'React', the 'useState' and 'useEffect' 'components' from 'react'. */
import React, { useState } from "react";
/* Imports the 'Routes', 'Route', 'useNavigate', and the 'useLocation' 
'components' from 'react-router-dom'. */
import {  useHistory } from "react-router-dom";
import { Button } from "react-bootstrap";
import './Reservations.css';
import ErrorAlert from "../layout/ErrorAlert";
import { makeNewReservation }from '../utils/api';
import { formatAsDate } from "../utils/date-time";
  

function CreateNewReservation() {
    const history = useHistory();
    const [ firstName, setFirstName ] = useState("");
    const [ lastName, setLastName ] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [reservationDate, setReservationDate] = useState("");
    const [error, setError] = useState(null);
    const [reservationTime, setReservationTime] = useState("");
    const [people, setPeople] = useState(1);
    const [apiErrors, setApiErrors] = useState(null);
    let errorsArray = [];
    const handleChange = ({ target }) => {
        if (target.name === "first_name") setFirstName( target.value );
        if (target.name === "last_name") setLastName(target.value);
        if (target.name === "mobile_number") setMobileNumber(target.value);
        if (target.name === "reservation_date") setReservationDate(target.value);
        if (target.name === "reservation_time") setReservationTime(target.value);
        if (target.name === "people") setPeople(target.value);
    }

    const handleSubmit = event => {
        event.preventDefault();
        const abortController = new AbortController();
        const newReservation = {
            first_name: firstName,
            last_name: lastName,
            mobile_number: mobileNumber,
            reservation_date: reservationDate,
            reservation_time: reservationTime,
            people: Number(people),
        };
        const newReservationDate = new Date(`${newReservation.reservation_date} ${newReservation.reservation_time}`);
        const newReservationDateHour = newReservationDate.getHours();
        const newReservationDateMinutes = newReservationDate.getMinutes();
        let reservationDateToCompare = parseInt(newReservation.reservation_date.replace(/-/g, '').split('/').join(''));
        let todaysDate = new Date();
     //   const todaysDateHour = todaysDate.getHours();
      //  const todaysDateMinutes = todaysDate.getMinutes();
        //const todaysTime = `${todaysDate.getHours()}:${todaysDate.getMinutes()}`

        todaysDate = Number(todaysDate.toISOString().slice(0,10).replace(/-/g,""));
        todaysDate = todaysDate -1;
        makeNewReservation(newReservation, abortController.signal)    
        .then((newReservation) => {
                history.push(
              `/dashboard?date=${formatAsDate(newReservation.reservation_date)}`
            );
        })
        .catch(setApiErrors);
        const currentTime = new Date();

           
           if (newReservationDate.getDay() === 2) {
              errorsArray.push(new Error("This restaurant is closed on Tuesdays. "));
           };
            if (newReservationDateHour < 10 || (newReservationDateHour === 10 && newReservationDateMinutes < 30)) {
                errorsArray.push(new Error("This restaurant is closed before before 10:30 AM. "));
            };
            if (newReservationDateHour > 21 || (newReservationDateHour === 21 && newReservationDateMinutes > 30)) {
                errorsArray.push(new Error("It's too late today to book that reservation. "));
             };
            if (/*reservationDateToCompare >= todaysDate && newReservationDateHour > 10 && newReservationDateHour <= 21 && newReservationDateMinutes < 30 && currentTime.toLocaleTimeString('en-US', { hour12: false }) > newReservationDate.toLocaleTimeString('en-US', { hour12: false })*/
               (reservationDateToCompare === todaysDate && currentTime.toLocaleTimeString('en-US', { hour12: false }) > newReservationDate.toLocaleTimeString('en-US', { hour12: false })) || reservationDateToCompare < todaysDate) {
                console.log("reservationDateToCompare: ", reservationDateToCompare);
                console.log("todaysDate", todaysDate);
                console.log(reservationDateToCompare >= todaysDate)
                console.log(currentTime.toLocaleTimeString('en-US', { hour12: false }) > newReservationDate.toLocaleTimeString('en-US', { hour12: false }))
                errorsArray.push(new Error("Only future reservations are allowed. "));
            };
             
           if (errorsArray.length === 0) {
            setApiErrors(apiErrors)
            setError(null)
           } else {
            errorsArray.push(new Error("Please try again."));
            console.log(errorsArray)
            setError(errorsArray);
           }

        setFirstName("");
        setLastName("");
        setMobileNumber("");
        setReservationDate("");
        setReservationTime("");
        setPeople(1);
    }
    return (
      <main>
            <h1>New Reservation</h1>
            <ErrorAlert error={error} />

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
      </main>
    );
};

export default CreateNewReservation;