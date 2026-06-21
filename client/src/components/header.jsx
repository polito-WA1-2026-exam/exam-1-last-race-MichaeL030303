import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext.jsx";
import "./Header.css";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate("/login");
  };

  return (
    <header className="header">

      <nav className="nav">

  <div className="nav-left">
    <Link to="/">Istruzioni</Link>
    {user && <Link to="/home">Home</Link>}
    {user && <Link to="/ranking">Ranking</Link>}
  </div>

  <div className="nav-right">
    {user ? (
      <button className="nav-btn" onClick={() => setOpen(true)}>
        Utente
      </button>
    ) : (
      <Link className="nav-btn" to="/login">
        Login
      </Link>
    )}
  </div>

</nav>

      {open && (
  <div className="modal-overlay" onClick={() => setOpen(false)}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>

      <h3>{user?.username}</h3>

      <button onClick={handleLogout}>
        Logout
      </button>

    </div>
  </div>
)}

    </header>
  );
}