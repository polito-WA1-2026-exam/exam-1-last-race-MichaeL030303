import { BrowserRouter, Routes, Route } from "react-router-dom";

import Instructions from "./pages/Instructions.jsx";
import Login from "./pages/Login.jsx";
import Game from "./pages/Game.jsx";
import Header from "./components/Header.jsx";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">

        <Header />

        <main>
          <Routes>
            <Route path="/" element={<Instructions />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Game />} />
            <Route path="/game" element={<Game />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;