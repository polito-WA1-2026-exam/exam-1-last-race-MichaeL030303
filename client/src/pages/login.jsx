import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext.jsx";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!auth?.login) {
        throw new Error("AuthContext not ready");
      }

      await auth.login({ username, password });
      navigate("/home");
    } catch (err) {
      console.error(err);
      setErrorMsg("Username o password errati");
    }
  };

  return (
    <div className="login-page-container">
      <div className="card login-card">
        <div className="login-header">
          <h1>Benvenuto Conduttore</h1>
          <p>Inserisci le tue credenziali per avviare il treno</p>
        </div>

        {errorMsg && (
          <div className="login-error">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username-input">Username</label>
            <input
              id="username-input"
              className="form-control"
              placeholder="Esempio: Mario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary btn-block" style={{ marginTop: "1.5rem" }}>
            Accedi al Deposito 🚇
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;