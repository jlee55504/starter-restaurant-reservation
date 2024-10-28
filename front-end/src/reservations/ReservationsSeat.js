import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Button } from "react-bootstrap";
import ErrorAlert from "../layout/ErrorAlert";
import { readReservation, listTables, assignTable, updateReservation } from "../utils/api";

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
    // Code in case the "Dashboard" 'component' needs to display a certain date
    // const [date, setDate] = useState(null)

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
    const loadReservationSeats = async () => {
        const abortController = new AbortController(); // Allows us to cancel the fetch if the component unmounts
        setError(null); // Resets any existing errors
        try {
            const selectedReservation =  await readReservation(reservationId, abortController.signal);
            setReservation(selectedReservation);
            const tablesList = await listTables(abortController.signal);
            setTables(tablesList);
            return () => abortController.abort();
        } catch (error) {
            setError(error);
        }
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
        /* Finds the selected table object from the tables array */
        const table = tables.find((t) => t.table_id === Number(selectedTable)); 
        if (!selectedTable) {
            setError({ message: "Please select a table." });
            return;
        }
        
            

        /* Prepares the data payload for the API request */
        const data = { reservation_id: reservation.reservation_id };

        try {
            /* Calls the assignTable API function to assign the reservation to the selected table */
            const newReservationStatus = { status: "seated" };
            await assignTable(selectedTable, data, abortController.signal);
            await updateReservation(reservation.reservation_id, newReservationStatus, abortController.signal);
            
            /* Navigates to the /dashboard page upon successful assignment */
             history.push("/dashboard");
             return () => abortController.abort();
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
            <h1>Assign reservation to table</h1>
            {/* Displays any error messages */}
            <ErrorAlert error={error} />
           {tables.length > 0 ? <form onSubmit={handleSubmit}>
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
                        onClick={async () => history.goBack()}
                    >
                        Cancel
                    </Button>
                    {/* Submit Button: Triggers form submission */}
                    <Button type="submit" className="btn btn-primary">
                        Submit
                    </Button>
                </div>
            </form>: <h6>No tables are available</h6>}
        </main>
    );
}

export default ReservationSeats;

