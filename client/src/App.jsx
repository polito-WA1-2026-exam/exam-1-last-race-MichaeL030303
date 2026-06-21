import { Routes, Route } from "react-router-dom";

import Instructions from "./pages/Instructions.jsx";
import Login from "./pages/Login.jsx";
import Game from "./pages/Game.jsx";
import Header from "./components/Header.jsx";
import Ranking from "./pages/ranking.jsx";

function App() {
  return (
    <div className="app-layout">
      <Header />

      <main>
        <Routes>
          <Route path="/" element={<Instructions />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Game />} />
          <Route path="/game" element={<Game />} />
          <Route path="/ranking" element={<Ranking />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;