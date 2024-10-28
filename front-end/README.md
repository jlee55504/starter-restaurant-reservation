# Capstone: Restaurant Reservation System Frontend

## Overview:
This project handles reservations for a fine dining restaurant. This application is used by restaurant personnel when a customer calls to request a reservation. 

The front-end of this project displays the UX of the application. Users are allowed to create, edit and delete reservations for the restaurant and assign tables to the reservations.

## Buit with:
  * React.js
  * React Bootstrap
  * Html5
  * CSS
  * Jest and Puppeteer used for testing


## e2e
Contains all of the end-to-end tests.


## src

##### Dashboard screen with reservations
![Alt text](https://github.com/jlee55504/starter-restaurant-reservation/blob/main/images/dashboard-with-reservation-status-seated.png?raw=true "Home screen (dashboard) page (with reservations)")

### dashboard/Dashboard.js
Displays the appropriate tables and handles the deletion of table assignments to reservations along with the requested date or the current date (if no date is provided). The "Previous day" 'button' will display any reservations for the day prior, while the "Next day" 'button' will display the day after's reservations (if there are reservations). The "Today" 'button' will display any reservations for the current day. The desired reservations are retrieved and sent to the "ReservationsList" 'component' to be displayed. All the tables are displayed along with their information. If a table's "status" is "occupied", a "Finish" 'button' will is shown which will display a window prompt asking users if the table is done being occupied. If the user selects "OK", the table's status is updated to "Free", the "reservation_id" is set to 'null', and the reservation associated with the table's status is set to "finished" (which won't be shown to users). The page is then reloaded showing any active reservations for the specified date and the updated table reservation. Clicking "cancel" in the window prompt exits the window prompt. 


### layout

##### Displaying 1 error
![Alt text](https://github.com/jlee55504/starter-restaurant-reservation/blob/main/images/search-for-reservations-by-phone-number-page-error.png?raw=true "'Search for reservations by phone number' page error")

##### Displaying multiple errors
![Alt text](https://github.com/jlee55504/starter-restaurant-reservation/blob/main/images/new-reservation-page-with-multiple-errors.png?raw=true "'New reservation' page with multiple error")

#### ErrorAlert.js
Displays any errors to users

#### Layout.css
Handles the CSS styling for the "layout" folder.

#### Layout.js
Displays the "Menu"and "Routes" 'components'.

#### Menu.js
Displays links for the "Dashboard", "SearchForReservation", "CreateNewReservation", and "CreateNewTable" 'components'.

#### NotFound.Js
Displays "Not Found" for all routes not assigned to a 'component'.

#### Routes.js
Handles all the routes and their assigned 'components'.


### Reservations

##### New reservation page
![Alt text](https://github.com/jlee55504/starter-restaurant-reservation/blob/main/images/new-reservation-page.png?raw=true "New reservation page")

#### CreateNewReservation.js
Allows users to create a new reservation for the restaurant while displaying any errors caused during the creation of a new reservation. The restaurant is open from 10:30 A.M. to 9:30 P.M. and is closed on Tuesdays, the users aren't allowed to book reservations during those times. Reservations in the past also won't be allowed and an error message will be displayed while not processing the reservation. Multiple errors will be displayed if users more than one of these restrictions are broken.

##### Edit reservation page
![Alt text](https://github.com/jlee55504/starter-restaurant-reservation/blob/main/images/edit-reservation-page.png?raw=true "'Edit reservation' page")

#### EditReservation.js
Displays the selected reservation's information with the ability to change the status of the reservation to "booked", "seated", or "finished". Entering the "Submit" 'button' will update the selected reservation's status and take users back to the previous page. Clicking the "Cancel" 'button' also brings users back to the previous page. 

#### Reservations.css
Handles the CSS styling for the "reservations" folder.

#### ReservationsList.js
Displays the reservations passed in by the ""Dashboard" and "SearchForReservation" 'components'. Each reservation has a "Seat", "Edit", and "Cancel" 'button'. The 'buttons' are displayed according to the conditions of the reservation's "status". The "Cancel" 'button' will update a reservation's status to "cancelled" (which won't be shown to users). A window prompt will ask users if they wish to cancel the reservation. If the user clucks yes, the reservation's status is updated to "cancelled" and the list is reloaded to display the active reservations. Clicking "cancel" in the window prompt exits the window prompt. The "Edit" 'button' will take users to the "/reservations/:reservation_id/edit" page (which uses the "EditReservation" 'component'), which allows users to edit the reservation's "status". This button is only displayed when a reservation's "status" is "booked". The "Seat" 'button' is displayed only when a reservation's "status" is "booked". This 'button' will take users to the "/reservations/:reservation_id/seat" page (which uses the "ReservationSeat" 'component'), which assigns reservations to tables.

##### Assign reservation to table page
![Alt text](https://github.com/jlee55504/starter-restaurant-reservation/blob/main/images/assign-reservation-to-table-page.png?raw=true "'Assign reservation to table' page")

#### ReservationSeat.js
Displays a drop-list of all the table names and the number of people each table can seat, which allows reservations to be assigned to tables. Two 'buttons' are displayed; a "Cancel" 'button' and a "Submit" 'button'. Clicking the "Cancel" 'button' takes users back to the previous page. Clicking the "Submit" 'button' after selecting a table will update the selected table's "reservation_id" to the "reservation_id" 'key' of the selected reservation, and bring users back to the "Dashboard" page, displaying the updated table information. A table cannot be booked unless there table's "capacity" number is smaller than the reservation's "people" 'key' number (There's too many people to sit at that table). If this occurs, the table's "status" won't be updated and an error will be displayed to the user.

##### Search for reservations by phone number page
![Alt text](https://github.com/jlee55504/starter-restaurant-reservation/blob/main/images/search-for-reservations-by-phone-number-page.png?raw=true "'Search for reservations by phone number' page")


#### searchForReservation/SearchForReservation.js
Allows users to search for reservations using a mobile phone number. After entering a mobile phone number and clicking the "Find" 'button', the browser will display all reservations matching the phone number, regardless of status. If no reservations are found, "No reservations found" is displayed to users. Clicking the "Cancel" 'button' will take users back to the previous page.


### utils

#### api.js
Holds all the functions used to access the backend API.

#### date-time.js
Defines functions to format date and time strings.

#### format-reservation-date.js
Defines a function to format the date on a single reservation or an array of reservations.

#### format-reservation-time.js
Defines a function to format the time on a single reservation or an array of reservations.

#### useQuery.js
Defines a custom hook to parse the query parameters from the URL.


### App.js
Defines the root application component.


### App.test.js
Contains the tests for the root application component.


### index.js
The main entry point for the React application.


### jest-puppeteer.config.js
A configuration file used by the end-to-end tests.