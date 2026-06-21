import { useState } from "react";

function RouteList({ segments = [], stations = [], route = [], setRoute }) {
  const getStationName = (id) => {
    const s = stations.find((st) => st.id === id);
    return s ? s.name : id;
  };

  const routeHasEdge = (route, a, b) => {
    for (let i = 0; i < route.length - 1; i++) {
      const x = route[i];
      const y = route[i + 1];
      if ((x === a && y === b) || (x === b && y === a)) return true;
    }
    return false;
  };

  const handleSegmentClick = (seg) => {
    if (!route || route.length === 0) {
      return setRoute([seg.station1, seg.station2]);
    }

    const first = route[0];
    const last = route[route.length - 1];

    if (last === seg.station1) {
      return setRoute([...route, seg.station2]);
    }

    if (last === seg.station2) {
      return setRoute([...route, seg.station1]);
    }

    if (first === seg.station1) {
      return setRoute([seg.station2, ...route]);
    }

    if (first === seg.station2) {
      return setRoute([seg.station1, ...route]);
    }

    setRoute([seg.station1, seg.station2]);
  };

  return (
    <div style={{ padding: "10px" }}>
      <h3>Routes</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {segments.map((seg, i) => {
          const isActive = routeHasEdge(route, seg.station1, seg.station2);

          return (
            <button
              key={i}
              onClick={() => handleSegmentClick(seg)}
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