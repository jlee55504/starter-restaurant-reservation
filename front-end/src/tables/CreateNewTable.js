    /* Imports 'React', the 'useState' and 'useEffect' 'components' from 'react'. */
    import React, { useState } from "react";
    /* Imports the 'Routes', 'Route', 'useNavigate', and the 'useLocation' 
    'components' from 'react-router-dom'. */
    import { useHistory } from "react-router-dom";
    import { Button } from "react-bootstrap";
    import ErrorAlert from "../layout/ErrorAlert";
    import { makeNewTable } from '../utils/api';

function CreateNewTable () {
    const [tableName, setTableName] = useState("");
    const [capacity, setCapacity] = useState("");
    const [error, setError] = useState(null);
    const history = useHistory();

    const handleChange = ({ target }) => {
        if (target.name === "table_name") setTableName(target.value);
        if (target.name === "capacity") setCapacity(target.value);
    }

    const handleSubmit = event => {
        event.preventDefault();
        const abortController = new AbortController();
        const newTable = {
            table_name: tableName,
            capacity: Number(capacity),
        };
        makeNewTable(newTable, abortController.signal)
        .then(() => {
            history.push("/dashboard");
        }).catch(setError)
    }
    return (
        <main>
            <ErrorAlert error={ error } />
            <h1>New Table</h1>
            <form onSubmit={ handleSubmit }>
                <div class="form-group">
                <label htmlFor="table_name">
                    <input type="text" name="table_name" id="table_name" placeholder="Table name" value={ tableName } onChange={ handleChange } minLength={ 2 } required>
                    </input>
                </label>
                </div>
                <div class="form-group">
                <label htmlFor="capacity">
                <input type="number" name="capacity" id="capacity" placeholder="Number of people" pattern="[0-9]*" value={ capacity } onChange={ handleChange } min={ 2 }  required></input>
                </label>
                </div>
                <div class="form-group">
                    <Button type="button" className="btn btn-secondary"onClick={() => history.goBack()}>Cancel</Button> 
                    <Button type="submit" className="btn btn-primary" >Submit</Button>  
                </div>
            </form>
        </main>
        );
}

export default CreateNewTable;