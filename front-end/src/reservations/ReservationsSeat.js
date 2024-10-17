    /* Imports 'React', the 'useState' and 'useEffect' 'components' from 'react'. */
    import React, { useState, useEffect } from "react";
    /* Imports the 'Routes', 'Route', 'useNavigate', and the 'useLocation' 
    'components' from 'react-router-dom'. */
    import {  useHistory, useParams } from "react-router-dom";
    import { Button } from "react-bootstrap";
    import ErrorAlert from "../layout/ErrorAlert";
    import { readReservation, listTables, readTable } from "../utils/api";
function ReservationSeats() {
    const [error, setError] = useState(null);
    const [reservation, setReservation] = useState([]);
    const [tables, setTables] = useState([]);
    const history = useHistory();
    const { reservation_id } = useParams
    //const [tableId, setTableId] = useState(null);
    const [selectedTable, setSelectedTable] = useState({});
    useEffect(loadReservationSeats, [reservation_id]);

     const loadReservationSeats = () => {
        const abortController = new AbortController();
        setError(null);
        readReservation({ reservation_id }, abortController.signal)
          .then(setReservation)
          .then(() => {
            return listTables(abortController.signal);
          })
          .then(setTables)
          .catch(setError);
        return () => abortController.abort();            
        }; 

    const handleChange = ({ target }) => {

    };  

    const handleSubmit = event => {
        event.preventDefault();
        const abortController = new AbortController();
        //if 
        //const selectedTable = readTable(event.target.value, abortController.signal)
        readTable(event.target.value, abortController.signal)
            .then(setSelectedTable)
            .then(console.log)
            .catch(setError)
            console.log(selectedTable)
            return () => abortController.abort(); 
    };

    /*
    <label htmlFor="table_id">
                    <select name="table_id" id="">

                    </select>
                </label>
    */

    return (
        <main>
            <h1>Reservation seating</h1>
            <ErrorAlert error={ error } />
            <form onSubmit={ handleSubmit }>
                {tables.length > 0 ? tables.map(table => {
                    return <label htmlFor={table.table_id}>
                    <select name={table.table_id} id={table.table_id}>
                        <option value={table.table_id}>{table.table_name} - {table.capacity}</option>
                    </select>
                </label>
                }) : null}
                <div>
                    <Button type="button" className="btn btn-secondary"onClick={() => history.goBack()}>Cancel</Button> 
                    <Button type="submit" className="btn btn-primary">Submit</Button>  
                </div>
            </form>
        </main>
    )

}

export default ReservationSeats;
