import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { logIn } from "../utils/api.js";
import { AuthContext } from "../context/authContext.jsx";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const auth = useContext(AuthContext);
  const login = auth?.login; // 🔥 SAFE

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = await logIn({ username, password });

      if (!login) {
        throw new Error("AuthContext not ready");
      }

      login(user);
      navigate("/game");
    } catch (err) {
      console.error(err);
      setErrorMsg("Username o password errati");
    }
  };

  return (
    <div>
      <h1>Login</h1>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      <form onSubmit={handleSubmit}>
        <input
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button>Login</button>
      </form>
    </div>
  );
}

export default Login;