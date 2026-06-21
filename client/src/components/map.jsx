function Map({ stations = [], segments = [], lines = [], showLines = true, highlightedRoute = [] }) {

  const stationPositions = {
    1: { x: 8, y: 4 },
    2: { x: 10, y: 4 },
    3: { x: 8, y: 6 },
    4: { x: 6, y: 8 },
    5: { x: 4, y: 7 },
    6: { x: 11, y: 0 },
    7: { x: 11, y: 2 },
    8: { x: 4, y: 4 },
    9: { x: 6, y: 4 },
    10: { x: 5, y: 2 },
    11: { x: 4, y: 0 },
    12: { x: 8, y: 1 },
    13: { x: 3, y: 2 },
    14: { x: 2, y: 4 },
    15: { x: 1, y: 6 },
    16: { x: 0, y: 4 },
  };

  const TILE_W = 60;
  const TILE_H = 40;

  const getPos = (id) => {
    const p = stationPositions[id];
    if (!p) return null;

    return {
      x: p.x * TILE_W + TILE_W / 2,
      y: p.y * TILE_H + TILE_H / 2,
    };
  };

  const getColor = (lineId) => {
    const line = lines.find(l => l.id === lineId);
    return line ? line.color.toLowerCase() : "#999";
  };

  const routeHasEdge = (route, a, b) => {
    if (!Array.isArray(route)) return false;
    for (let i = 0; i < route.length - 1; i += 1) {
      const x = route[i];
      const y = route[i + 1];
      if ((x === a && y === b) || (x === b && y === a)) return true;
    }
    return false;
  };

  const stationIsHighlighted = (id) =>
    highlightedRoute.some((item) => item === id || item?.toString() === id?.toString());  

  return (
    <div
      style={{
        position: "relative",
        width: TILE_W * 12,
        height: TILE_H * 10,
        margin: "0 auto",
        background: "#fafafa",
        border: "1px solid #ddd",
      }}
    >

      <svg
        width={TILE_W * 12}
        height={TILE_H * 10}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {segments.map((seg, i) => {
          const a = getPos(seg.station1);
          const b = getPos(seg.station2);

          if (!a || !b) return null;

          const active = routeHasEdge(highlightedRoute, seg.station1, seg.station2);

          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={getColor(seg.line)}
              strokeWidth={active ? 8 : 4}
              strokeLinecap="round"
              opacity={active ? 1 : 0}
            />
          );
        })}
      </svg>


      {/* STAZIONI */}
      {stations.map(station => {
        const pos = getPos(station.id);
        if (!pos) return null;

        const active = stationIsHighlighted(station.id);

        return (
          <div
            key={station.id}
            style={{
              position: "absolute",
              left: pos.x - 9,
              top: pos.y - 9,
              width: 18,
              height: 18,
              zIndex: 2,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: active ? "#ff6600" : "#fff",
                border: `3px solid ${active ? "#cc5200" : "#000"}`,
                boxSizing: "border-box",
              }}
              title={station.name}
            />

            {/* NOME */}
            <div
              style={{
                position: "absolute",
                top: 22,
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "9px",
                whiteSpace: "nowrap",
                color: "#111",
                pointerEvents: "none",
              }}
            >
              {station.name}
            </div>

          </div>
        );
      })}

    </div>
  );
}

export default Map;