import { Link } from "react-router-dom";

import "../styles.css";

function LoginPage(){
    return (
        <div id="login-container">
            <h1>Login</h1>

            <form id="login-form" action="#">
                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" required/>
                </div>

                        <br/>

                <div>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" required/>
                </div>

                        <br/>

                <button type="submit">Log in</button>

                <p id="message"></p>
            </form>
        </div>
)


}


// To make the file accessible to other files
export default LoginPage;