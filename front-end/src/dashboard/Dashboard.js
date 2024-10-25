import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useLocation, useHistory } from 'react-router-dom';
import { readReservations, listTables, deleteTableAssignment } from '../utils/api';
import { previous, today } from '../utils/date-time';
import { next } from '../utils/date-time';
import { Button, Card } from "react-bootstrap";
import ReservationsList from "../reservations/ReservationsList";
/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const history = useHistory();
  const search = useLocation().search;
  const queryParams = new URLSearchParams(search).get("date");
  const tableQuery = new URLSearchParams(search).get("tables");
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tableHasBeenDeleted, setTableHasBeenDeleted] = useState(false);
  const [updateTables, setUpdateTables] = useState(false);
  const [tableToDelete, setTableToDelete] = useState({});

  // Notifies the application that a table has been deleted
  useEffect(() => {
    if (!tableHasBeenDeleted) {
      return;
    } else {
      setUpdateTables(true);
    }
  }, [tableHasBeenDeleted]);
useEffect(()=> {
  if (tableQuery !== "true") return;
   else {
      loadDashboard();
   }
}, [tableQuery])

  // Deletes the assignment to the seleted table
  useEffect(async () => {
    const abortController = new AbortController();
    if (!updateTables) return;
    else {
      const reservationStatus = { status: "finished" }
      await deleteTableAssignment(tableToDelete, reservationStatus, abortController.signal)
        .then(() => setTableToDelete({}))
        .catch(setReservationsError);  
      return ()=> abortController.abort();
    }
    }, [updateTables]);

  // Reloads the tables
    useEffect(()=> {
      if (!updateTables) return;
          loadDashboard();
    }, [tableToDelete]);

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();
   setReservationsError(null);
    if (!queryParams) {
      listReservations({ date }, abortController.signal)
      .then((reservations) => {
          let todaysReservations;
          if (reservations.length > 0) { 
            todaysReservations = reservations.filter(reservation => reservation.reservation_date === date)
            .map(reservation => { 
              if (reservation.reservation_date === date) { 
                return reservation.reservation_date;
              };
              return reservation;
            }) 
          }; 
           if (reservations.length === 0 || todaysReservations.length === 0) {
              return [];
            } else {
              return readReservations(todaysReservations, abortController.signal)
              };
      })
      .then((reservations) => {
        if (reservations.length > 0) {
          reservations = reservations.filter(reservation => reservation.status !== "finished");
        return reservations;
      } else return [];
      })
      .then(setReservations)
      .then(() => {
        const currentTables = listTables(abortController.signal);
        if (currentTables.length === 0) return [];
        else return currentTables;
      })
      .then(setTables)
      .catch(setReservationsError);
      return () => abortController.abort(); 
    }
      else if (queryParams) {
        listReservations({ date }, abortController.signal)
      .then((reservations) => {
          let reservationsWithDates;
          if (reservations.length > 0) { 
            reservationsWithDates = reservations.filter(reservation => reservation.reservation_date === queryParams && reservation.status !== "finished")
            .map(reservation => { 
              if (reservation.reservation_date === queryParams) { 
                return reservation.reservation_date;
              };
              return reservation;
            });
          }; if (reservations.length === 0 || reservationsWithDates.length === 0) {
              return [];
            } else {
              return readReservations(reservationsWithDates, abortController.signal);
              };
      })
      .then((reservations) => {
        if (reservations.length > 0) {
          reservations = reservations.filter(reservation => reservation.status !== "finished");
        return reservations;
      } else return [];
      })
      .then(setReservations)
      .then(() => {
        const currentTables = listTables(abortController.signal);
        if (currentTables.length === 0) return [];
        else return currentTables;
      })
      .then((tables) => {
        return tables;
      })
      .then(setTables)
      .catch(setReservationsError);
      return () => abortController.abort();
      }
      
  };

  function handleDeleteTableAssignment(table) {
    const confirm = window.confirm( "Is this table ready to seat new guests? \n This cannot be undone." );
    if (confirm === true) {
      setTableToDelete(table);
      setTableHasBeenDeleted(true);
    } else {
        return;
    }
  }

  return (
    <main className="container-fluid m-0 p-0">
      
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        {date ? <h4 className="mb-0">Reservations for date: {date}</h4> : <h4 className="mb-0">Reservations for date: {queryParams}</h4>}
      </div>
      <ErrorAlert error={reservationsError} />
      <div className="buttons-div mb-3">
          <Button className="btn btn-secondary" onClick={() => {
            history.push(`/dashboard?date=${previous(date)}`);
            }}>Previous day</Button>
          <Button className="btn btn-primary" onClick={() =>{ 
            history.push(`/dashboard?date=${today()}`);
            }}>Today</Button>
          <Button className="btn btn-secondary" onClick={() =>{ 
            history.push(`/dashboard?date=${next(date)}`);
            }}>Next day</Button>
      </div>
      <div className="row d-md-flex">
      <div className="col-sm-8">
      <ReservationsList reservationsList={reservations} date={date} />
      </div>
      <div className="col-sm-4">
      {tables.length > 0 ? tables.map((table, index) => {
        let isTableFree = "";
        if (table.reservation_id) {
          isTableFree = "Occupied";
        } else {
          isTableFree = "Free";
        }
          return <Card key={index}>
            <Card.Body>
              <Card.Title>Table:</Card.Title>
              <Card.Subtitle>{table.table_name}</Card.Subtitle>
              <Card.Text>{table.capacity}</Card.Text>
              <Card.Text data-table-id-status={table.table_id}>{isTableFree}</Card.Text>
              {isTableFree === "Occupied" ? <Button data-table-id-finish={table.table_id} value={table} onClick={() => handleDeleteTableAssignment(table)}>Finish</Button>: <h6>Table available.</h6>}
            </Card.Body>
          </Card>
      }) : <h6>No tables available.</h6>}
      </div>
        <div/>
      </div>
      

    </main>
  );
}

export default Dashboard;
