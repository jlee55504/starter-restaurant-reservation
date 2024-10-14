import React from "react";

/**
 * Defines the alert message to render if the specified error is truthy.
 * @param error
 *  an instance of an object with `.message` property as a string, typically an Error instance.
 * @returns {JSX.Element}
 *  a bootstrap danger alert that contains the message string.
 */
/*error.length > 1 ? error.map(error => error.message ) :
        error.message */
function ErrorAlert({ error }) {
  return (
    error && (
      <div className="alert alert-danger m-2">Error: {
        error.length > 1 ? error.map(error => error.message ) :
        error.message
        }</div>
    )
  );
}

export default ErrorAlert;
