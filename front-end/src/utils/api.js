/**
 * Defines the base URL for the API.
 * The default values is overridden by the `API_BASE_URL` environment variable.
 */

import formatReservationDate from "./format-reservation-date";
import formatReservationTime from "./format-reservation-date";

const API_BASE_URL =
  //process.env.REACT_APP_API_BASE_URL || 
  "http://localhost:5000";

/**
 * Defines the default headers for these functions to work with `json-server`
 */
const headers = new Headers();
headers.append("Content-Type", "application/json");

/**
 * Fetch `json` from the specified URL and handle error status codes and ignore `AbortError`s
 *
 * This function is NOT exported because it is not needed outside of this file.
 *
 * @param url
 *  the url for the requst.
 * @param options
 *  any options for fetch
 * @param onCancel
 *  value to return if fetch call is aborted. Default value is undefined.
 * @returns {Promise<Error|any>}
 *  a promise that resolves to the `json` data or an error.
 *  If the response is not in the 200 - 399 range the promise is rejected.
 */
async function fetchJson(url, options, onCancel) {
 // console.log(url)
  //console.log(options)
  try {
    const response = await fetch(url, options);

    if (response.status === 204) {
      return null;
    }

    const payload = await response.json();
    console.log(payload)
    if (payload.error) {
      return Promise.reject({ message: payload.error });
    }
    return payload.data;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error.stack);
      throw error;
    }
    return Promise.resolve(onCancel);
  }
}

/**
 * Retrieves all existing reservation.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of reservation saved in the database.
 */

export async function listReservations(params, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value.toString())
  );

  return await fetchJson(url, { headers, signal }, [])
    .then(formatReservationDate)
    .then(formatReservationTime);
};

export const listTables = async (signal) => {
  const url = new URL(`${API_BASE_URL}/tables`);
  const options = {
    method: "GET",
    headers,
    signal,
  };
  return await fetchJson(url, options, []);
}

export const readReservations = async(reservation_dates, signal) => {
  const options = {
    method: "GET",
    headers,
    signal,
  };
  if (!Array.isArray(reservation_dates)) {
   const url = new URL(`${API_BASE_URL}/reservations?date=${(reservation_dates)}`);
    return await fetchJson(url, options)
     .then(formatReservationDate)
     .then(formatReservationTime);
  }
 else { 
  let reservations;
  let url;
  for (const reservation_date of reservation_dates) {
     url = new URL(`${API_BASE_URL}/reservations?date=${(reservation_date)}`);
     reservations = await fetchJson(url, options)
      .then(formatReservationDate)
      .then(formatReservationTime);
  };
  return Promise.all(reservations);
}
};

export const readReservation = async (reservation_id, signal) => {
  const url = new URL(`${API_BASE_URL}/reservations/${reservation_id}/seat`);
  const options = {
    method: "GET",
    headers,
    signal,
  };
  return await fetchJson(url, options)
    .then(formatReservationDate)
    .then(formatReservationTime);
}

export const findReservationsById = async (reservation_ids, signal) => {
  console.log(reservation_ids)
  const options = {
    method: "GET",
    headers,
    signal,
  };
  if (!Array.isArray(reservation_ids)) {
    const url = new URL(`${API_BASE_URL}/reservations/${(reservation_ids)}`);
     return await fetchJson(url, options)
      .then(formatReservationDate)
      .then(formatReservationTime);
   }
   else { 
    let reservations = reservation_ids.map(async(reservation) => {
      const  url = new URL(`${API_BASE_URL}/reservations/${reservation}`);
       return reservations = await fetchJson(url, options)
        .then(formatReservationDate)
        .then(formatReservationTime);
    });

    return Promise.all(reservations);
  }
}

export async function makeNewReservation (reservation, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({ data: reservation }),
    signal,
  };
  return await fetchJson(url, options)
    .then(formatReservationDate)
    .then(formatReservationTime);
};
export const makeNewTable = async (table, signal) => {
  const url = new URL(`${API_BASE_URL}/tables`);
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({ data: table }),
    signal,
  };
  return await fetchJson(url, options);
}

export const readTable = async (table_id, signal) => {
  const url = new URL(`/tables/:table_id/seat/`);
  const options = {
    method: "GET",
    headers,
    signal,
  };
  return await fetchJson(url, options);
}

export const assignTable = async (table, data, signal) => {
  const url = new URL(`${API_BASE_URL}/tables/${table}/seat`);
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: data }),
    signal,
  };
  
  return await fetchJson(url, options, []);
}

export const deleteTableAssignment = async (table, reservationStatus, signal) => {
  const url = new URL(`${API_BASE_URL}/tables/${table.table_id}/seat`);
  const options = {
    method: "DELETE",
    headers,
    body: JSON.stringify({ data: table, reservationStatus }),
    signal,
  };
  return await fetchJson(url, options, [])
  }
 
  export const updateReservation = async (reservation_id, reservationStatus, signal) => {
    const url = new URL(`${API_BASE_URL}/reservations/${reservation_id}/status`);
    const options = {
      method: "PUT",
      headers,
      body: JSON.stringify({ data: reservationStatus }),
      signal,
    };
    return await fetchJson(url, options, [])
      //.then(formatReservationDate)
      //.then(formatReservationTime);
  };

export const searchForReservation = async (mobile_number, signal) => {
    const url = new URL(`${API_BASE_URL}/reservations?mobile_number=${mobile_number}`);
    const options = {
    method: "GET",
    headers,
    signal,
    };
    return await fetchJson(url, options)
    .then(formatReservationDate)
    .then(formatReservationTime);
}


export const readReservationForEdit = async (reservation_id, signal) => {
   const url = new URL(`${API_BASE_URL}/reservations/${reservation_id}`);
  const options = {
    method: "GET",
    headers,
    signal,
  };
  return await fetchJson(url, options)
    .then(formatReservationDate)
    .then(formatReservationTime); 
  }   

/*export cancelReservation = async (reservation_id, reservationStatus, signal) => {

  } */
