import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useLocation, useHistory, Link } from 'react-router-dom';
import { readReservations, listTables, deleteTableAssignment, updateReservation } from '../utils/api';
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
function Dashboard({ date, reservationStatus= false }) {
  const history = useHistory();
  const search = useLocation().search;
  const queryParams = new URLSearchParams(search).get("date");
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [reservationsWithDate, setReservationsWithDate] = useState([]);
  const [tables, setTables] = useState([]);
  const [tableHasBeenDeleted, setTableHasBeenDeleted] = useState(false);
  const [updateTables, setUpdateTables] = useState(false);
  const [tableToDelete, setTableToDelete] = useState({});
  //const [reservationCancelled, setReservationCancelled] = useState(false);
  const [reservationCancelled, setReservationCancelled] = useState(reservationStatus);
  useEffect(() => {
    const abortController = new AbortController();
    if (!tableHasBeenDeleted) {
      return;
    } else {
      setUpdateTables(true);
    }
  }, [tableHasBeenDeleted]);
//console.log(reservationStatus)
  useEffect(() => {
    const abortController = new AbortController();
    if (!updateTables) return;
    else {
      const reservationStatus = { status: "finished" }
      deleteTableAssignment(tableToDelete, reservationStatus, abortController.signal)
        .then(() => setTableToDelete({}))
        .catch(setReservationsError);   
      return ()=> abortController.abort();
    }
    }, [tableHasBeenDeleted, updateTables]);

    useEffect(()=> {
      const abortController = new AbortController();
      if (!updateTables) return;
        listTables(abortController.signal)
          .then((tables) => {
            if (tables.length === 0) return [];
            else {
              return tables;
            }
          })
          .then(setTables)
          .then(() => setTableHasBeenDeleted(false))
          .then(() => setUpdateTables(false))
          .catch(setReservationsError);
          return ()=> abortController.abort();   
    }, [tableToDelete]);

  /*  useEffect(() => {
      if (!reservationCancelled) return;
      else {
        console.log(reservationCancelled)
        if(!queryParams) loadDashboard(today());
          else if (queryParams) loadDashboard(queryParams);
      }
    }, [reservationCancelled])*/

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();
   setReservationsError(null);
 //  setReservationCancelled(false);
    if (!queryParams) {
      listReservations({ date }, abortController.signal)
      .then((reservations) => {
       /* if (queryParams) {
          let reservationsWithDates;
          if (reservations.length > 0) {
            reservationsWithDates = reservations.filter(reservation => reservation.reservation_date === queryParams && reservation.status !== "finished")
            .map(reservation => { 
              if (reservation.reservation_date === queryParams) { 
                return reservation.reservation_date;
              };
            });      
          }; if (reservationsWithDates.length === 0) {  
              return [];
          } else {
              return readReservations(reservationsWithDates, abortController.signal);
            };        
        } else {
            return Promise.reject(reservations);
          };*/
          let todaysReservations;
          if (reservations.length > 0) { 
            todaysReservations = reservations.filter(reservation => reservation.reservation_date === date)
            .map(reservation => { 
              if (reservation.reservation_date === date) { 
                return reservation.reservation_date;
              };
            }) 
          }; if (reservations.length === 0 || todaysReservations.length === 0) {
           // setReservations([]);
              //return Promise.reject([]);
              console.log(reservations)
              return [];
            } else {
              //return Promise.reject(listReservations(todaysReservations, abortController.signal));
              //return listReservations(todaysReservations, abortController.signal)
              return todaysReservations;
              };
      })
      .then((reservations) => {
        console.log(reservations)
        if (reservations.length > 0) {
          reservations = reservations.filter(reservation => reservation.status !== "finished");
       /* for (const reservation of reservations) {
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
        } */
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
       /* if (queryParams) {
          let reservationsWithDates;
          if (reservations.length > 0) {
            reservationsWithDates = reservations.filter(reservation => reservation.reservation_date === queryParams && reservation.status !== "finished")
            .map(reservation => { 
              if (reservation.reservation_date === queryParams) { 
                return reservation.reservation_date;
              };
            });      
          }; if (reservationsWithDates.length === 0) {  
              return [];
          } else {
              return readReservations(reservationsWithDates, abortController.signal);
            };        
        } else {
            return Promise.reject(reservations);
          };*/
          let reservationsWithDates;
          if (reservations.length > 0) { 
            reservationsWithDates = reservations.filter(reservation => reservation.reservation_date === queryParams && reservation.status !== "finished" )
            .map(reservation => { 
              if (reservation.reservation_date === queryParams) { 
               // console.log(reservation)
                return reservation.reservation_date;
              };
            })/*.map(reservation => { 
              if (reservation.status !== "finished" ) { 
                return reservation.status;
              };
            })*/ //reservation.status !== "finished" 
          }; if (reservations.length === 0 || reservationsWithDates.length === 0) {
           // setReservations([]);
              //return Promise.reject([]);
              return [];
            } else {
  //            console.log(reservationsWithDates)
              //return Promise.reject(listReservations(todaysReservations, abortController.signal));
              return readReservations(reservationsWithDates, abortController.signal);
              //return todaysReservations
              };
      })
      //.then((reservations) =>)
      .then((reservations) => {
        if (reservations.length > 0) {
          reservations = reservations.filter(reservation => reservation.status !== "finished");
       /* for (const reservation of reservations) {
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
        } */
        return reservations;
      } else return [];
      })
      //.then(setReservations)
      .then(setReservationsWithDate)
      .then(() => {
        const currentTables = listTables(abortController.signal);
        if (currentTables.length === 0) return [];
        else return currentTables;
      })
      .then(setTables)
      .catch(setReservationsError);
      return () => abortController.abort();
      }
      //.then(setReservationsWithDate)
      /*.catch((response) => {
        let todaysReservations;
        if (response.length > 0) { 
          todaysReservations = response.filter(reservation => reservation.reservation_date === date  && reservation.status !== "finished")
          .map(reservation => { 
            if (reservation.reservation_date === date) { 
              return reservation.reservation_date;
            };
          }) 
        }; if (todaysReservations.length === 0) {
         // setReservations([]);
            //return Promise.reject([]);
            return [];
          } else {
            //return Promise.reject(listReservations(todaysReservations, abortController.signal));
            return listReservations(todaysReservations, abortController.signal)
            };
      })
      .catch((reservations) => {
        if (reservations.length > 0) {
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
        return Promise.reject(reservations);
      } else return Promise.reject([]);
      })
      .catch(setReservations)*/
      
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


function updateReservationStatus(reservation) {
  const abortController = new AbortController();
  const newReservationStatus = { status: "seated" };
  updateReservation(reservation.reservation_id, newReservationStatus, abortController.signal)
    .catch(setReservationsError);
  history.push(`/reservations/${reservation.reservation_id}/seat`);
  return () => abortController.abort();
}

function cancelReservation(reservation) {
  const abortController = new AbortController();
  const confirm = window.confirm("Do you want to cancel this reservation? This cannot be undone.");
  if (confirm === true) {
    const newReservationStatus = { status: "cancelled" };
    updateReservation(reservation.reservation_id, newReservationStatus, abortController.signal)
      .catch(setReservationsError);
      setReservationCancelled(true);
    return () => abortController.abort();
  } else return;
}
//console.log(reservationsWithDate)
  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for date</h4>
      </div>
      <ErrorAlert error={reservationsError} />
      { reservationsWithDate.length > 0 ?
      /* reservationsWithDate.map(reservation => {
          return <Card>
            <Card.Body>
              <Card.Title>Reservation for:</Card.Title>
              <Card.Subtitle>{reservation.first_name} {reservation.last_name}</Card.Subtitle>
              <Card.Text>Mobile number: {reservation.mobile_number}</Card.Text>
              <Card.Text>Reservation date: {reservation.reservation_date}</Card.Text>
              <Card.Text>Reservation time: {reservation.reservation_time}</Card.Text>
              <Card.Text>Number of people: {reservation.people}</Card.Text>
              <Card.Text data-reservation-id-status={reservation.reservation_id}>Status: {reservation.status}</Card.Text>
              {reservation.status === "booked" ? <Button className="btn btn-primary" type="button" onClick={() => history.push(`/reservations/${reservation.reservation_id}/edit`)}>Seat</Button> : null}
              <Button className="btn btn-secondary" type="button" onClick={() => history.push(`/reservations/${reservation.reservation_id}/edit`)}>Edit</Button>
              <Button data-reservation-id-cancel={reservation.reservation_id} className="btn btn-danger" type="button" onClick={() => cancelReservation(reservation)}>Cancel</Button>
            </Card.Body>
          </Card>
      })*/ <ReservationsList reservationsList={reservationsWithDate} date={date} /> : null }
      { reservations.length > 0 && reservationsWithDate.length === 0 ? /*reservations.map(reservation => {
        return <Card>
          <Card.Body>
            <Card.Title>Reservation for:</Card.Title>
            <Card.Subtitle>{reservation.first_name} {reservation.last_name}</Card.Subtitle>
            <Card.Text>Mobile number: {reservation.mobile_number}</Card.Text>
            <Card.Text>Reservation date: {reservation.reservation_date}</Card.Text>
            <Card.Text>Reservation time: {reservation.reservation_time}</Card.Text>
            <Card.Text>Number of people: {reservation.people}</Card.Text>
            <Card.Text data-reservation-id-status={reservation.reservation_id}>Status: {reservation.status}</Card.Text>
            {reservation.status === "booked" ? <Button className="btn btn-primary" type="button" onClick={() => history.push(`/reservations/${reservation.reservation_id}/edit`)}>Seat</Button> : null}
            <Button className="btn btn-secondary" type="button" onClick={() => history.push(`/reservations/${reservation.reservation_id}/edit`)}>Edit</Button>
              <Button data-reservation-id-cancel={reservation.reservation_id} className="btn btn-danger" type="button" onClick={() => cancelReservation(reservation)}>Cancel</Button>
          </Card.Body>
        </Card>
      })*/<ReservationsList reservationsList={reservations} date={date} /> : null }
      {reservations.length === 0 && reservationsWithDate.length === 0 ? <h6>No reservations for this day</h6> : null }
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
      <div>
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
    </main>
  );
}

export default Dashboard;
