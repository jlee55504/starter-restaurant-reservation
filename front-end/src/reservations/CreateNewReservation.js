/* Imports 'React', the 'useState' and 'useEffect' 'components' from 'react'. */
import React, { useState } from "react";
/* Imports the 'Routes', 'Route', 'useNavigate', and the 'useLocation' 
'components' from 'react-router-dom'. */
import {  useHistory } from "react-router-dom";
import { Button } from "react-bootstrap";
import {readReservation} from '../utils/api';
import ErrorAlert from "../layout/ErrorAlert";
import {makeNewReservation }from '../utils/api';
import { formatAsDate, formatAsTime } from "../utils/date-time";
  

function CreateNewReservation() {
    const history = useHistory();
    const [ firstName, setFirstName ] = useState("");
    const [ lastName, setLastName ] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [reservationDate, setReservationDate] = useState("");
    const [error, setError] = useState(null)
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
        let newReservationDate = new Date(newReservation.reservation_date.replace(/-/g, '\/'));
        let reservationDateToCompare = parseInt(newReservation.reservation_date.replace(/-/g, '\/').split('/').join(''));
        let todaysDate = new Date();
        console.log("reservation_time", newReservation.reservation_time)
        //console.log("todaysDate: ",todaysDate.toLocaleTimeString('eo', { hour12: false }))
        const todaysTime = `${todaysDate.getHours()}:${todaysDate.getMinutes()}`
        console.log(todaysTime)
        //console.log(todaysDate.getMinutes())
        todaysDate = parseInt(todaysDate.toISOString().slice(0,10).replace(/-/g,""));
        makeNewReservation(newReservation, abortController.signal)    
        .then((newReservation) => {
                history.push(
              `/dashboard?date=${formatAsDate(newReservation.reservation_date)}`
            );
        })
        .catch(apiErrors);

        if (reservationDateToCompare < todaysDate && newReservationDate.getDay() !== 2) {
            setError(new Error("Only future reservations are allowed. "));
        } if (newReservationDate.getDay() === 2 && reservationDateToCompare > todaysDate) {
            setError(new Error("This restaurant is closed on Tuesdays. Please try again. "));
          } //if ()
           else if (reservationDateToCompare < todaysDate && newReservationDate.getDay() === 2) {
                errorsArray.push(new Error("This restaurant is closed on Tuesdays. Please try again. "));
                errorsArray.push(new Error("Only future reservations are allowed."));
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
            <ErrorAlert error={error} />
            <h1>New Reservation</h1>
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="first_name">
                    <input type="text" name="first_name" id="first_name" placeholder="First Name" value={ firstName } onChange={ handleChange } maxLength={ 50 } required></input>
                </label>
                <label htmlFor="last_name">
                    <input type="text" name="last_name" id="last_name" placeholder="Last Name" value={ lastName } onChange={ handleChange } maxLength={ 50 } required></input>
                </label>
                <label htmlFor="mobile_number">
                    <input type="text" name="mobile_number" id="mobile_number" placeholder="Enter a mobile phone number" value={ mobileNumber } onChange={ handleChange }  required/>
                </label>
                <label htmlFor="reservation_date">
                    <input type="date" name="reservation_date" id="reservation_date" placeholder="YYYY-MM-DD" pattern="\d{4}-\d{2}-\d{2}" value={ reservationDate } onChange={ handleChange } required/>
                </label>
                <label htmlFor="reservation_time">
                    <input type="time" name="reservation_time" id="reservation_time" placeholder="HH:MM" pattern="[0-9]{2}:[0-9]{2}" value={ reservationTime } onChange={ handleChange } required/>
                </label>
                <label htmlFor="people">
                    <input type="number" name="people" id="people" placeholder="Number of people" pattern="[0-9]*" value={ people } onChange={ handleChange } min={ 1 }  required></input>
                </label>
              </div>
                <div>
                   <Button type="submit" className="btn btn-primary" >Submit</Button>
                   <Button type="button" className="btn btn-secondary"onClick={() => history.goBack()}>Cancel</Button> 
                </div>
            </form>
      </main>
    );
};

export default CreateNewReservation;