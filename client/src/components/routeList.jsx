import { useState } from "react";

function RouteList({ segments = [], stations = [] }) {
  const [selected, setSelected] = useState({});

  const getStationName = (id) => {
    const s = stations.find(st => st.id === id);
    return s ? s.name : id;
  };

  const toggle = (index) => {
    setSelected(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div style={{ padding: "10px" }}>
      <h3>Routes</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {segments.map((seg, i) => {
          const isActive = selected[i];

          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                cursor: "pointer",
                background: isActive ? "#999" : "#fff",
                color: isActive ? "#fff" : "#000",
                transition: "0.2s",
                textAlign: "left",
              }}
            >
              {getStationName(seg.station1)} → {getStationName(seg.station2)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default RouteList;