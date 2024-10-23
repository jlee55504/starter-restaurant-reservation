import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Button } from "react-bootstrap";
import ErrorAlert from "../layout/ErrorAlert";
import { readReservation, listTables, assignTable } from "../utils/api";

/**
 * ReservationSeats Component
 * Allows a restaurant manager to assign a reservation to a specific table.
 */
function ReservationSeats() {
    /* State to manage error messages */
    const [error, setError] = useState(null);
    /* State to store reservation details */
    const [reservation, setReservation] = useState({});
    /* State to store the list of available tables */
    const [tables, setTables] = useState([]);
    /* React Router's history object for navigation */
    const history = useHistory();
    /* Extracts reservation_id from the URL parameters */
    const { reservationId } = useParams();
    /* State to store the selected table's ID */
    const [selectedTable, setSelectedTable] = useState("");

    /**
     * useEffect Hook
     * Fetches reservation and table data when the component mounts or when reservation_id changes.
     */
    useEffect(() => {
        loadReservationSeats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reservationId]);

    /**
     * loadReservationSeats Function
     * Fetches the reservation details and the list of tables from the backend.
     */
    const loadReservationSeats = () => {
        const abortController = new AbortController(); // Allows us to cancel the fetch if the component unmounts
        setError(null); // Resets any existing errors

        /* Fetches reservation details */
        readReservation(reservationId, abortController.signal)
            .then(setReservation) // Updates the reservation state with fetched data
            .then(() => listTables(abortController.signal)) // After fetching reservation, fetches tables
            .then(setTables) // Updates the tables state with fetched data
            .catch(setError); // Catches and sets any errors that occur during fetching

        /* Cleanup function to abort fetch requests if the component unmounts */
        return () => abortController.abort();
    };

    /**
     * handleChange Function
     * Updates the selectedTable state when a table is selected from the dropdown.
     *
     * @param {Object} event - The event object from the select input
     */
    const handleChange = ({ target }) => {
        setSelectedTable(target.value); // Updates the selected table ID
    };

    /**
     * handleSubmit Function
     * Handles the form submission to assign a table to a reservation.
     *
     * @param {Object} event - The event object from the form submission
     */
    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevents the default form submission behavior
        setError(null); // Resets any existing errors
        const abortController = new AbortController();
        /* Validation: Ensure a table is selected */
        if (!selectedTable) {
            setError({ message: "Please select a table." });
            return;
        }

        /* Finds the selected table object from the tables array */
        const table = tables.find((t) => t.table_id === Number(selectedTable));

        /* Validation: Check if the selected table exists */
        if (!table) {
            setError({ message: "Selected table does not exist." });
            return;
        }

        /* Validation: Check if the table is already occupied */
        if (table.reservation_id) {
            setError({ message: "This table is already occupied." });
            return;
        }

        /* Validation: Check if table capacity is sufficient for the reservation's party size */
        if (table.capacity < reservation.people) {
            setError({ message: "Table capacity is insufficient for the reservation." });
            return;
        }

        /* Prepares the data payload for the API request */
        const data = { reservation_id: reservation.reservation_id };

        try {
            /* Calls the assignTable API function to assign the reservation to the selected table */
            await assignTable(selectedTable, data, abortController.signal).then(() => history.push("/dashboard"))
            /* Navigates to the /dashboard page upon successful assignment */
             history.push("/dashboard");
             return;
        } catch (apiError) {
            /* Catches and sets any errors returned from the API */
            setError(apiError);
        }
    };

    /**
     * Render Function
     * Renders the seating form with a dropdown of available tables and Submit/Cancel buttons.
     */
    return (
        <main>
            <h1>Seat Reservation</h1>
            {/* Displays any error messages */}
            <ErrorAlert error={error} />
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    {/* Label and select dropdown for choosing a table */}
                    <label htmlFor="table_id">
                        Table Number:
                        <select
                            name="table_id"
                            id="table_id"
                            className="form-control"
                            onChange={handleChange}
                            value={selectedTable}
                            required
                        >
                            {/* Default option prompting user to select a table */}
                            <option value="">Select a table</option>
                            {/* Maps through the tables array to create an option for each table */}
                            {tables.map((table) => (
                                <option key={table.table_id} value={table.table_id}>
                                    {table.table_name} - {table.capacity} 
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
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
                        Submit
                    </Button>
                </div>
            </form>
        </main>
    );
}

export default ReservationSeats;

