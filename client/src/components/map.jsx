import React from "react";

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

  const getLineColor = (lineId) => {
    const line = lines.find((l) => l.id === lineId);
    if (!line) return "#999";
    
    // Handle both string and hex color formats
    const color = line.color.toLowerCase();
    const colorMap = {
      red: "#ff0000",
      green: "#00aa00",
      blue: "#0000ff",
      yellow: "#ffaa00",
      black: "#000000",
      purple: "#aa00ff",
      orange: "#ff6600",
      pink: "#ff69b4",
      cyan: "#00ffff",
      brown: "#8b4513",
    };
    
    return colorMap[color] || color;
  };

  const routeHasEdge = (route, a, b) => {
    if (!Array.isArray(route) || route.length < 2) return false;
    
    for (let i = 0; i < route.length - 1; i += 1) {
      const x = route[i];
      const y = route[i + 1];
      
      // Handle both number and string IDs
      if (
        (x === a && y === b) ||
        (x === b && y === a) ||
        (x?.toString() === a?.toString() && y?.toString() === b?.toString()) ||
        (x?.toString() === b?.toString() && y?.toString() === a?.toString())
      ) {
        return true;
      }
    }
    return false;
  };

  const stationIsHighlighted = (id) => {
    if (!Array.isArray(highlightedRoute)) return false;
    return highlightedRoute.some(
      (item) => item === id || item?.toString() === id?.toString()
    );
  };

  const svgWidth = TILE_W * 12;
  const svgHeight = TILE_H * 10;

  return (
    <div
      style={{
        position: "relative",
        width: svgWidth,
        height: svgHeight,
        margin: "0 auto",
        background: "#fafafa",
        border: "1px solid #ddd",
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      {/* SVG Lines */}
      <svg
        width={svgWidth}
        height={svgHeight}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#999" />
          </marker>
        </defs>

        {segments.map((seg, i) => {
          const from = getPos(seg.station1);
          const to = getPos(seg.station2);

          if (!from || !to) return null;

          const active = routeHasEdge(highlightedRoute, seg.station1, seg.station2);
          const color = getLineColor(seg.line);

          return (
            <g key={i}>
              {/* Background line for visibility */}
              {active && (
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="white"
                  strokeWidth={active ? 10 : showLines ? 6 : 4}
                  opacity="0.3"
                  strokeLinecap="round"
                  pointerEvents="none"
                />
              )}

              {/* Main line */}
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={color}
                strokeWidth={active ? 8 : showLines ? 4 : 2}
                opacity={active || showLines ? 1 : 0}
                strokeLinecap="round"
                pointerEvents="none"
              />
            </g>
          );
        })}
      </svg>

      {/* Stations */}
      {stations.map((station) => {
        const pos = getPos(station.id);
        if (!pos) return null;

        const active = stationIsHighlighted(station.id);
        const stationId = station.id || station.id.toString();

        return (
          <div
            key={stationId}
            style={{
              position: "absolute",
              left: pos.x - 9,
              top: pos.y - 9,
              width: 18,
              height: 18,
              zIndex: active ? 10 : 2,
            }}
            title={station.name}
          >
            {/* Station circle */}
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: active ? "#ff6600" : "#fff",
                border: `3px solid ${active ? "#cc5200" : "#000"}`,
                boxSizing: "border-box",
                transition: "all 0.2s ease",
                cursor: "pointer",
                boxShadow: active ? "0 0 8px rgba(255, 102, 0, 0.5)" : "none",
              }}
            />

            {/* Station label */}
            <div
              style={{
                position: "absolute",
                top: 22,
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "10px",
                fontWeight: "500",
                whiteSpace: "nowrap",
                color: active ? "#ff6600" : "#111",
                pointerEvents: "none",
                textShadow: "0 1px 2px rgba(255,255,255,0.8)",
              }}
            >
              {station.name}
            </div>

            {/* Interchange indicator */}
            {station.interchange && (
              <div
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#ffaa00",
                  border: "1px solid #fff",
                  zIndex: 5,
                }}
                title="Stazione di interscambio"
              />
            )}
          </div>
        );
      })}

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: 10,
          right: 10,
          background: "rgba(255, 255, 255, 0.9)",
          padding: "8px 12px",
          borderRadius: "4px",
          fontSize: "9px",
          border: "1px solid #ddd",
          zIndex: 20,
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "4px" }}>Legenda</div>
        <div>●&#160; Stazione</div>
        <div>●&#160; Interchange</div>
        <div style={{ marginTop: "4px", color: "#ff6600", fontWeight: "bold" }}>Percorso selezionato</div>
      </div>
    </div>
  );
}

export default Map;