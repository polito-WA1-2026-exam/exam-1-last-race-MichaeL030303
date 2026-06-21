import { useEffect, useState } from "react";
import { getRanking } from "../utils/api.js";

function parseUTC(dateStr) {
  if (!dateStr) return null;
  try {
    const s = dateStr.replace(" ", "T");
    return new Date(s.endsWith("Z") ? s : `${s}Z`);
  } catch (error) {
    console.error("Error parsing date:", dateStr, error);
    return null;
  }
}

function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRanking = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRanking();
      setRanking(data || []);
    } catch (err) {
      console.error("Failed to load ranking:", err);
      setError("Impossibile caricare la classifica");
      setRanking([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRanking();
    // Optionally refresh ranking every 30 seconds
    const interval = setInterval(loadRanking, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ margin: 0 }}>Classifica generale</h1>
        <button onClick={loadRanking} disabled={loading}>
          {loading ? "Caricamento..." : "Aggiorna"}
        </button>
      </div>

      {error && (
        <div style={{ padding: "10px", marginBottom: "20px", background: "#fee", border: "1px solid #fcc", borderRadius: "4px", color: "#c00" }}>
          {error}
        </div>
      )}

      {loading && !ranking.length ? (
        <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
          Caricamento classifica...
        </div>
      ) : ranking.length === 0 ? (
        <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
          Nessun risultato disponibile
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <thead>
              <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
                <th style={{ padding: "12px", textAlign: "center", fontWeight: "bold" }}>#</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Giocatore</th>
                <th style={{ padding: "12px", textAlign: "right", fontWeight: "bold" }}>Punteggio</th>
                <th style={{ padding: "12px", textAlign: "right", fontWeight: "bold" }}>Data</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((item, index) => {
                const date = parseUTC(item.created_at);
                const isEvenRow = index % 2 === 0;
                return (
                  <tr
                    key={`${item.id}-${index}`}
                    style={{
                      background: isEvenRow ? "#fafafa" : "#fff",
                      borderBottom: "1px solid #eee",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0f0")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = isEvenRow ? "#fafafa" : "#fff")}
                  >
                    <td style={{ padding: "12px", textAlign: "center", fontWeight: "bold", color: "#666" }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: "12px", textAlign: "left" }}>
                      {item.username || "Anonimo"}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", fontWeight: "bold", color: "#0066cc" }}>
                      {item.score ?? 0}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", color: "#666", fontSize: "0.9em" }}>
                      {date ? date.toLocaleString("it-IT") : "Data sconosciuta"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Ranking;