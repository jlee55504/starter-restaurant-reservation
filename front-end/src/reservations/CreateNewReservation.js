/* Imports 'React', the 'useState' and 'useEffect' 'components' from 'react'. */
import React, { useState, useEffect } from "react";
/* Imports the 'Routes', 'Route', 'useNavigate', and the 'useLocation' 
'components' from 'react-router-dom'. */
import {  useHistory,  useLocation } from "react-router-dom";
import { Button, Image } from "react-bootstrap";
import  dashboard  from "../dashboard/Dashboard";
import ErrorAlert from "../layout/ErrorAlert";

function CreateNewReservation() {
    const history = useHistory();
    const [ first_name, set_first_name ] = useState("");
    const [ last_name, set_last_name ] = useState("");
    const [error, setError] = useState(null);
    const [mobile_number, set_mobile_number] = useState("");
    const [reservation_date, set_reservation_date] = useState("");
    const [reservation_time, set_reservation_time] = useState("");
    const [people, set_people] = useState(1);
    const handleChange = ({ target }) => {
        if (target.name === "first_name") set_first_name( target.value );
        if (target.name === "last_name") set_last_name(target.value);
        if (target.name === "mobile_number") set_mobile_number(target.value);
        if (target.name === "reservation_date") set_reservation_date(target.value);
        if (target.name === "reservation_time") set_reservation_time(target.value);
        if (target.name === "people") set_people(target.value);
    }

    const handleSubmit = event => {
        event.preventDefault();
        const abortController = new AbortController();
        const newReservation = {
            first_name: first_name,
            lastName: last_name,
            mobile_number: mobile_number,
            reservation_date: reservation_date,
            reservation_time: reservation_time,
            people: Number(people),
        }
        async function makeNewReservation() {
            try {
                await CreateNewReservation(newReservation, abortController.signal);
                set_first_name("");
                set_last_name("");
                set_mobile_number("");
                set_reservation_date("");
                set_reservation_time("");
                set_people("");
                history.push("/dashboard");
                return;
            } catch (error) {
                setError(error);
            } 
        }
        makeNewReservation();
        return () => abortController.abort();
    }

    return (
      <main>
            
            <h1>New Reservation</h1>
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="first_name">
                    <input type="text" name="first_name" id="first_name" placeholder="First Name" value={ first_name } onChange={ handleChange } maxLength={ 50 } required></input>
                </label>
                <label htmlFor="last_name">
                    <input type="text" name="last_name" id="last_name" placeholder="Last Name" value={ last_name } onChange={ handleChange } maxLength={ 50 } required></input>
                </label>
                <label htmlFor="mobile_number">
                    <input type="text" name="mobile_number" id="mobile_number" placeholder="Enter a mobile phone number" value={ mobile_number } onChange={ handleChange }  required/>
                </label>
                <label htmlFor="reservation_date">
                    <input type="date" name="reservation_date" id="reservation_date" placeholder="YYYY-MM-DD" pattern="\d{4}-\d{2}-\d{2}" value={ reservation_date } onChange={ handleChange } required/>
                </label>
                <label htmlFor="reservation_time">
                    <input type="time" name="reservation_time" id="reservation_time" placeholder="HH:MM" pattern="[0-9]{2}:[0-9]{2}" value={ reservation_time } onChange={ handleChange } required/>
                </label>
                <label htmlFor="people">
                    <input type="text" name="people" id="people" placeholder="Number of people" pattern="[0-9]*" value={ people } onChange={ handleChange } min={ 1 } defaultValue={ 1 } required></input>
                </label>
              </div>
                <div>
                   <button type="submit" className="btn btn-primary" >Submit</button>
                   <button type="button" className="btn btn-secondary"onClick={() => history.goBack()}>Cancel</button> 
                </div>
            </form>
      </main>
    );
};

export default CreateNewReservation;