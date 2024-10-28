import React, { useEffect, useState } from "react";
import ErrorAlert from "../layout/ErrorAlert";
import { useHistory } from 'react-router-dom';
import { searchForReservation, setReservationDateAndTime } from '../utils/api';

import { Button } from "react-bootstrap";
import ReservationsList from "../reservations/ReservationsList";

function SearchForReservation() {
    const [mobileNumber, setMobileNumber] = useState("");
    const [reservations, setReservations] = useState([]);
    const [reservationsError, setReservationsError] = useState(null);
    const [displayReservations, setDisplayReservations] = useState(false);
    // Displays message if the no reservation's contain the inputted mobile number 
    const [cantFindReservation, setCantFindReservation] = useState("");
    const [displayCantFindReservationError, setDisplayCantFindReservationError] = useState(false);
    const history = useHistory();

    useEffect(() => {
        if (reservations.length === 0) return; 
        else {
            setDisplayReservations(true);
        }
    }, [reservations]);

    const handleChange = ({ target }) => {
        if (target.name === "mobile_number") {
            setMobileNumber(target.value);
        }
    }

    useEffect(() => {
        if (!displayCantFindReservationError) return;
        else setReservationsError({
            id: 1,
            message:"No reservations found"});
    }, [displayCantFindReservationError]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const abortController = new AbortController();
        setCantFindReservation("");
        setDisplayCantFindReservationError(false);
        setReservationsError(null);
        setDisplayReservations(false);
        try {
            const selectedReservations = await searchForReservation(mobileNumber, abortController.signal);
            const reservationsWithDateAndTime = setReservationDateAndTime(selectedReservations);
            
            if (selectedReservations.length === 0){ 
                setReservations([]);
                setDisplayCantFindReservationError(true);
            }
            setReservations(reservationsWithDateAndTime);
            setMobileNumber("");
            return () => abortController.abort();
        } catch (error) {
            setReservationsError(error);
        }   
    }

    return (
    <main>
        <h1>Search for a reservation by phone number</h1>
        <ErrorAlert error={reservationsError} />
        <div>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                <label htmlFor="mobile_number">
                    <input type="text" name="mobile_number" id="mobile_number" placeholder="Enter a customer's phone number" value={ mobileNumber } onChange={ handleChange }  required></input>
                </label>
                </div>
                {/* Container for the Cancel and Submit buttons */}
                <div className="form-group">
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
            {displayReservations && reservations.length > 0 ? <ReservationsList reservationsList={reservations} /> : null}
            {cantFindReservation !== ""  ? <h6>{cantFindReservation}</h6> : null}
        </div>
    </main>
    );
}

export default SearchForReservation;