import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../api";

function LoginPage(props) {
  const { currentUser, onLogin } = props;
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(
    function () {
      if (currentUser) {
        navigate("/dashboard", { replace: true });
      }
    },
    [currentUser, navigate]
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setForm(function (currentForm) {
      return {
        ...currentForm,
        [name]: value,
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = await loginUser(form.email, form.password);
      onLogin(data.user);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div id="login-container">
        <p className="eyebrow">Smart Course Companion</p>
        <h1>Login</h1>
        <p className="login-copy">
          Use the sample student or teacher account to test both sides of the app.
        </p>

        <form id="login-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        {message ? <p id="message">{message}</p> : null}

        <div className="demo-box">
          <h3>Demo Accounts</h3>
          <p>
            Student 1: <strong>eric@email.com</strong> / <strong>1234</strong>
          </p>
          <p>
            Student 2: <strong>karolina@email.com</strong> / <strong>1234</strong>
          </p>
          <p>
            Student 3: <strong>oliver@email.com</strong> / <strong>1234</strong>
          </p>
          <p>
            Student 4: <strong>paul-louis@email.com</strong> / <strong>1234</strong>
          </p>
          <p>
            Teacher 1: <strong>abdelghani@concordia.ca</strong> / <strong>1234</strong>
          </p>
          <p>
            Teacher 2: <strong>mohammad@concordia.ca</strong> / <strong>1234</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
