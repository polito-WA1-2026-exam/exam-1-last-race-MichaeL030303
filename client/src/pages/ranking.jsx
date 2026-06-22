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
    <div style={{ width: "100%", maxWidth: "900px", margin: "0 auto", padding: "1rem 0" }}>
      <div className="ranking-title-area">
        <h1>Classifica Generale</h1>
        <button 
          onClick={loadRanking} 
          disabled={loading}
          className="btn btn-secondary"
        >
          {loading ? "Aggiornamento..." : "🔄 Aggiorna"}
        </button>
      </div>

      {error && (
        <div className="login-error" style={{ marginBottom: "1.5rem" }}>
          ⚠️ {error}
        </div>
      )}

      {loading && !ranking.length ? (
        <div className="spinner-center">
          <div className="spinner"></div>
        </div>
      ) : ranking.length === 0 ? (
        <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
          Nessuna corsa registrata al momento. Sii il primo a correre!
        </div>
      ) : (
        <div className="ranking-table-container">
          <table className="ranking-table">
            <thead>
              <tr>
                <th className="ranking-col-rank">#</th>
                <th>Macchinista</th>
                <th style={{ textAlign: "right" }}>Punti</th>
                <th style={{ textAlign: "right" }}>Data Corsa</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((item, index) => {
                const date = parseUTC(item.created_at);
                return (
                  <tr key={`${item.id}-${index}`}>
                    <td className="ranking-col-rank">
                      {index + 1}
                    </td>
                    <td className="ranking-col-player">
                      👤 {item.username || "Anonimo"}
                    </td>
                    <td className="ranking-col-score" style={{ textAlign: "right" }}>
                      {item.score ?? 0} pt
                    </td>
                    <td className="ranking-col-date" style={{ textAlign: "right" }}>
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