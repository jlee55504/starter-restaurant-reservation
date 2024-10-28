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
  const reservationCancelled = new URLSearchParams(search).get("reservationCancelled");
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tableHasBeenDeleted, setTableHasBeenDeleted] = useState(false);
  const [updateTables, setUpdateTables] = useState(false);
  const [tableToDelete, setTableToDelete] = useState({});
  const [updateReservations, setUpdateReservations] = useState(false);

  // Notifies the application that a table has been deleted
  useEffect(() => {
    if (!tableHasBeenDeleted) {
      return;
    } else {
      setUpdateTables(true);
    }
  }, [tableHasBeenDeleted]);

// Tells browser to reload the reservations and tables when a reservation has been cancelled 
useEffect(()=> { 
  if (reservationCancelled !== "true") return;
   else {
    setUpdateReservations(true);
    if (!queryParams) history.push(`/dashboard?date=${date}`)
      else history.push(`/dashboard?date=${queryParams}`)
   }
}, [reservationCancelled]);

// Reloads the reservations and tables
useEffect(() => {
  if (!updateReservations) return;
  else loadDashboard();
}, [updateReservations]);

  // Deletes the assignment to the seleted table
  useEffect(async () => {
    const abortController = new AbortController();
    if (!updateTables) return;
    else {
      try {
        const reservationStatus = { status: "finished" }
        await deleteTableAssignment(tableToDelete, reservationStatus, abortController.signal);
        setTableToDelete({});
        return ()=> abortController.abort();
      } catch (error) {
        setReservationsError(error);
      };
    }
    }, [updateTables]);

  // Reloads the tables and reservations
    useEffect(()=> {
      if (!updateTables) return;
          loadDashboard();
    }, [tableToDelete]);

  useEffect(loadDashboard, [date]);

  async function loadDashboard() {
    setUpdateReservations(false);
    const abortController = new AbortController();
   setReservationsError(null);
    if (!queryParams) {
      try {
        const reservationList = await listReservations({ date }, abortController.signal);
        if (reservationList.length === 0) {
          setReservations([]);
          const currentTables = await listTables(abortController.signal);
                if (currentTables.length === 0) {
                  setTables([]);
                  return ()=> abortController.abort();
                }
                 setTables(currentTables);
          return ()=> abortController.abort();
        };
        if (reservationList.length === 1) {
          const singleReservation = await readReservations(date, abortController.signal);
          const filteredReservation = singleReservation.filter(reservation => reservation.status !== "cancelled" && reservation.status !== "finished");
            if (filteredReservation.length === 0)  {
              setReservations([]);
              const currentTables = await listTables(abortController.signal);
                if (currentTables.length === 0) {
                  setTables([]);
                  return ()=> abortController.abort();
                }
                setTables(currentTables);
                return ()=> abortController.abort();
            }
            else {
              setReservations(filteredReservation);
              const currentTables = await listTables(abortController.signal);
                if (currentTables.length === 0) {
                  setTables([]);
                  return ()=> abortController.abort();
                }
                setTables(currentTables);
              return ()=> abortController.abort();
            }
          }
        const filteredReservations = reservationList.filter(reservation => reservation.reservation_date === date && reservation.status !== "finished" && reservation.status !== "cancelled")
            .map(reservation => { 
              if (reservation.reservation_date === date) { 
                return reservation.reservation_date;
              };
              return reservation;
            });
            if (filteredReservations.length === 0) {
              setReservations([]);
              const currentTables = await listTables(abortController.signal);
                if (currentTables.length === 0) {
                  setTables([]);
                  return ()=> abortController.abort();
                }
                setTables(currentTables);
              return ()=> abortController.abort();
            } else {
                const currentReservations = await readReservations(filteredReservations, abortController.signal);
                const refilteredReservationsList = currentReservations.filter(reservation => reservation.status !== "cancelled" && reservation.status !== "finished");
                if (refilteredReservationsList.length === 0) {
                  setReservations([]);
                  const currentTables = await listTables(abortController.signal);
                if (currentTables.length === 0) {
                  setTables([]);
                  return ()=> abortController.abort();
                }
                setTables(currentTables);
                return ()=> abortController.abort();
                }
                else {
                  setReservations(refilteredReservationsList);
                  const currentTables = await listTables(abortController.signal);
                  if (currentTables.length === 0) {
                    setTables([]);
                    return ()=> abortController.abort();
                  }
                  setTables(currentTables);
                  return ()=> abortController.abort();
              }
            }
      } catch (error) {
        setReservationsError(error)
      }
    }
      else {
        try {
          const reservationList = await listReservations({ queryParams }, abortController.signal);
          if (reservationList.length === 0) {
            setReservations([]);
            const currentTables = await listTables(abortController.signal);
                  if (currentTables.length === 0) {
                    setTables([]);
                    return ()=> abortController.abort();
                  }
                   setTables(currentTables);
            return ()=> abortController.abort();
          };
           if (reservationList.length === 1) {
            const singleReservation = await readReservations(queryParams, abortController.signal);
            const filteredReservation = singleReservation.filter(reservation => reservation.status !== "cancelled" && reservation.status !== "finished")
            if (filteredReservation.length === 0)  {
              setReservations([]);
              const currentTables = await listTables(abortController.signal);
                if (currentTables.length === 0) {
                  setTables([]);
                  return ()=> abortController.abort();
                }
                setTables(currentTables);
              return ()=> abortController.abort();
            }
            else {
              setReservations(singleReservation);
              const currentTables = await listTables(abortController.signal);
                if (currentTables.length === 0) {
                  setTables([]);
                  return ()=> abortController.abort();
                }
                setTables(currentTables);
              return ()=> abortController.abort();}
          }
        else {
          const filteredReservations = reservationList.filter(reservation => reservation.reservation_date === queryParams && reservation.status !== "finished")
          .map(reservation => { 
              if (reservation.reservation_date === queryParams) { 
                return reservation.reservation_date;
              };
              return reservation;
            });
            if (filteredReservations.length === 0) {
              setReservations([]);
              const currentTables = await listTables(abortController.signal);
                if (currentTables.length === 0) {
                  setTables([]);
                  return ()=> abortController.abort();
                }
                setTables(currentTables);
              return ()=> abortController.abort();
            } else {
                const currentReservations = await readReservations(filteredReservations, abortController.signal);
                const refilteredReservationsList =  currentReservations.filter(reservation => reservation.status !== "cancelled" && reservation.status !== "finished");
                if (refilteredReservationsList.length === 0) {
                  setReservations([]);
                  const currentTables = await listTables(abortController.signal);
                if (currentTables.length === 0) {
                  setTables([]);
                  return ()=> abortController.abort();
                }
                setTables(currentTables);
                return ()=> abortController.abort();
                }
                else {
                  setReservations(refilteredReservationsList);
                const currentTables = await listTables(abortController.signal);
                if (currentTables.length === 0) {
                  setTables([]);
                  return ()=> abortController.abort();
                }
                setTables(currentTables);
                return ()=> abortController.abort();
              }
            }
          }
        } catch (error) {
          setReservationsError(error);
        }
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
      {tables.length > 0 ? tables.map((table) => {
        let isTableFree = "";
        if (table.reservation_id) {
          isTableFree = "Occupied";
        } else {
          isTableFree = "Free";
        }
          return <Card key={table.table_id}>
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
