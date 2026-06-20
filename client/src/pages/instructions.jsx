import "./Instructions.css";

export default function Instructions() {
  return (
    <div className="instructions-container">
      <h1>Last Race - Game Instructions</h1>

      <section>
        <h2>Overview</h2>
        <p>
          “Last Race” is a single-player game where you plan a route in an
          underground metro network and try to reach your destination with the
          highest score possible.
        </p>
      </section>

      <section>
        <h2>Game Phases</h2>

        <div className="card">
          <h3>1. Setup</h3>
          <p>
            The system generates a random starting station and a destination
            station.
          </p>
        </div>

        <div className="card">
          <h3>2. Planning</h3>
          <p>
            You see a list of station connections and must build a route within
            90 seconds.
          </p>
          <p>
            Each segment can be used only once. Line changes are allowed only at
            interchange stations.
          </p>
        </div>

        <div className="card">
          <h3>3. Execution</h3>
          <p>
            Each step of your route triggers a random event that can increase or
            decrease your coins.
          </p>
        </div>

        <div className="card">
          <h3>4. Result</h3>
          <p>
            Your final score is calculated. If the route is invalid, you lose
            the game.
          </p>
        </div>
      </section>

      <section>
        <h2>Access</h2>
        <p>
          To play the game you must register and log in.
        </p>
      </section>
    </div>
  );
}