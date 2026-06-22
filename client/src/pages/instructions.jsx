import { Link } from "react-router-dom";
import "./instructions.css";

export default function Instructions() {
  return (
    <div className="instructions-container">
      <h1>Last Race - Istruzioni di Gioco</h1>

      <section>
        <h2>Presentazione</h2>
        <p>
          <strong>“Last Race”</strong> è un gioco a giocatore singolo ambientato in una rete metropolitana.
          Il tuo scopo è pianificare un tragitto dalla stazione di partenza generata dal sistema alla stazione di arrivo,
          cercando di massimizzare il tuo punteggio finale in gettoni.
        </p>
      </section>

      <section>
        <h2>Le Fasi di Corsa</h2>

        <div className="instructions-grid">
          <div className="card">
            <h3>📍 1. Generazione Tratta</h3>
            <p>
              All'inizio di ogni partita, la centrale operativa assegna una stazione di partenza e una di arrivo distanti
              almeno 3 fermate l'una dall'altra.
            </p>
          </div>

          <div className="card">
            <h3>⏱ 2. Pianificazione Rotta</h3>
            <p>
              Avrai <strong>90 secondi</strong> di tempo per collegare le stazioni cliccando direttamente sulla mappa interattiva o
              selezionando i collegamenti adiacenti proposti.
            </p>
          </div>

          <div className="card">
            <h3>🚇 3. Regole di Percorso</h3>
            <p>
              Ciascun segmento della linea può essere percorso <strong>al massimo una volta</strong>. Il cambio di linea è autorizzato
              <strong> esclusivamente</strong> nelle stazioni di interscambio (evidenziate in giallo).
            </p>
          </div>

          <div className="card">
            <h3>🎲 4. Eventi e Replay</h3>
            <p>
              Durante il tragitto, ad ogni fermata corrisponderà un evento imprevisto (es. ritardo del treno, biglietto perso o coin trovata)
              che modificherà il tuo punteggio (partenza con 20 gettoni).
            </p>
          </div>
        </div>
      </section>

      <section className="card" style={{ marginTop: "2.5rem", textAlign: "center", borderStyle: "dashed", borderColor: "var(--color-primary)" }}>
        <h3 style={{ justifyContent: "center", marginBottom: "0.5rem" }}>Pronto a metterti alla guida?</h3>
        <p style={{ marginBottom: "1rem" }}>
          Per giocare e registrare il tuo record nella classifica globale, devi autenticarti con le tue credenziali.
        </p>
        <Link to="/login" className="btn btn-primary">
          Accedi alla Cabina di Guida 🔑
        </Link>
      </section>
    </div>
  );
}