import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useLocation, useHistory, Link } from 'react-router-dom';
import { readReservations, listTables, deleteTableAssignment, updateReservation, searchForReservation } from '../utils/api';
import { previous, today } from '../utils/date-time';
import { next } from '../utils/date-time';
import { Button, Card } from "react-bootstrap";
import ReservationsList from "../reservations/ReservationsList";
import { formatAsDate, formatAsTime } from "../utils/date-time";
function SearchForReservation() {
    const [mobileNumber, setMobileNumber] = useState("");
    const [reservations, setReservations] = useState([]);
    const [reservationsError, setReservationsError] = useState(null);
    const [numberHasBeenSubmitted, setNumberHasBeenSubmitted] = useState(false);
    const [displayReservations, setDisplayReservations] = useState(false);
    const [loadReservations, setLoadReservations] = useState(false);
    const history = useHistory();

   /* useEffect(() => {
        if (!numberHasBeenSubmitted) {
        return;
        } else {
            setLoadReservations(true);
         }
        }, [numberHasBeenSubmitted]);

        useEffect(() => {
            if (!loadReservations) {
                return;
                } else {
                    console.log(mobileNumber)
                    const abortController = new AbortController();
                    setReservationsError(null);
                    setDisplayReservations(true);
                    //setLoadReservations(false);
                    setNumberHasBeenSubmitted(false);
                    searchForReservation(mobileNumber, abortController.signal)
                        .then(setReservations)
                        //.then(console.log)
                        .catch(setReservationsError);
                        setMobileNumber("");
                    return () => abortController.abort();
                }
        }, [numberHasBeenSubmitted, loadReservations])*/
    useEffect(() => {
        if (reservations.length === 0) return; 
        else {
            setDisplayReservations(true);
        }
    }, [reservations])
    const handleChange = ({ target }) => {
        if (target.name === "mobile_number") {
            setMobileNumber(target.value);
        }
    }

    const handleSubmit = event => {
        event.preventDefault();
        const abortController = new AbortController();
        //console.log(mobileNumber)
        setDisplayReservations(false);
        setNumberHasBeenSubmitted(true);
        searchForReservation(mobileNumber, abortController.signal)
                        .then ((reservations) => {
                                for (const reservation of reservations) {
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
                            return reservations;
                        }).then(setReservations)
                        .catch(setReservationsError);
                        setMobileNumber("");
                        return () => abortController.abort();
    }
// {displayReservations ? <ReservationsList reservationsList={reservations} /> : <h6>No reservations found</h6>}
    return (
    <main>
        <h1>Search for a reservation by phone number</h1>
        <ErrorAlert error={reservationsError} />
        <div>
            <form onSubmit={ handleSubmit }>
                <label htmlFor="mobile_number">
                    <input type="text" name="mobile_number" id="mobile_number" placeholder="Enter a customer's phone number" value={ mobileNumber } onChange={ handleChange }  required></input>
                </label>
                {/* Container for the Cancel and Submit buttons */}
                <div className="d-flex justify-content-between mt-3">
                    {/* Cancel Button: Navigates back to the previous page */}
                    <Button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => history.goBack()}
                    >
                        Cancel
                    </Button>
                    {/* Submit Button: Triggers form submission */}
                    <Button type="submit" className="btn btn-primary">
                        Find
                    </Button>
                </div>
            </form>
            {displayReservations ? <ReservationsList reservationsList={reservations} /> : null}
        </div>
    </main>
    );
}

export default SearchForReservation;