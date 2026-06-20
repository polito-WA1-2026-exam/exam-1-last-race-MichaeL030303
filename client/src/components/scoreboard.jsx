import { useEffect, useState } from "react";
import { getMyRanking } from "../utils/api";

function Home() {
  const [ranking, setRanking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyRanking();
        setRanking(data);
      } catch (err) {
        setRanking(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <h2>Loading...</h2>;

  return (
    <div>
      <h1>La tua classifica personale</h1>

      {!ranking ? (
        <p>Non loggato</p>
      ) : (
        <h2>Best score: {ranking.bestScore}</h2>
      )}
    </div>
  );
}

export default Home;