import React from "react";

function Map({
  stations = [],
  segments = [],
  lines = [],
  showLines = true,
  highlightedRoute = [],
  validNextStations = [],
  onStationClick,
  startStationId = null,
  endStationId = null,
}) {
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
    if (!line) return "#8e8e93";
    
    const color = line.color.toLowerCase();
    const colorMap = {
      red: "#ff453a",
      green: "#30d158",
      blue: "#0a84ff",
      yellow: "#ffd60a",
      black: "#8e8e93",
      purple: "#bf5af2",
      orange: "#ff9f0a",
      pink: "#ff375f",
      cyan: "#64d2ff",
      brown: "#ac8e68",
    };
    
    return colorMap[color] || color;
  };

  const routeHasEdge = (route, a, b) => {
    if (!Array.isArray(route) || route.length < 2) return false;
    
    for (let i = 0; i < route.length - 1; i += 1) {
      const x = route[i];
      const y = route[i + 1];
      
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
        width: "100%",
        maxWidth: svgWidth,
        height: svgHeight,
        margin: "0 auto",
        background: "#0d0e15",
        border: "1px solid #1f202c",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "inset 0 0 40px rgba(0, 0, 0, 0.6)",
      }}
    >
      {/* Grid Pattern Background */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: "radial-gradient(#1f202c 1.5px, transparent 1.5px)",
          backgroundSize: "20px 20px",
          opacity: 0.4,
          pointerEvents: "none",
        }}
      />

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
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {segments.map((seg, i) => {
          const from = getPos(seg.station1);
          const to = getPos(seg.station2);

          if (!from || !to) return null;

          const active = routeHasEdge(highlightedRoute, seg.station1, seg.station2);
          const color = getLineColor(seg.line);

          return (
            <g key={i}>
              {/* Highlight Glow for active route */}
              {active && (
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={color}
                  strokeWidth="8"
                  opacity="0.4"
                  strokeLinecap="round"
                  filter="url(#glow)"
                  pointerEvents="none"
                />
              )}

              {/* Main Line */}
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={active || showLines ? color : "none"}
                strokeWidth={active ? 4 : 3}
                opacity={active ? 1 : showLines ? 0.7 : 0}
                strokeLinecap="round"
                pointerEvents="none"
                style={{
                  transition: "stroke-width 0.3s, opacity 0.3s, stroke 0.3s",
                }}
              />
            </g>
          );
        })}
      </svg>

      {/* Stations */}
      {stations.map((station) => {
        const pos = getPos(station.id);
        if (!pos) return null;

        const stationId = Number(station.id);
        const active = stationIsHighlighted(stationId);
        
        const isStart = startStationId !== null && Number(startStationId) === stationId;
        const isEnd = endStationId !== null && Number(endStationId) === stationId;
        const isCurrentEnd =
          highlightedRoute.length > 0 &&
          Number(highlightedRoute[highlightedRoute.length - 1]) === stationId;

        const isValidNext = validNextStations.includes(stationId);

        // Styling hierarchy based on station role
        let circleColor = "#131520";
        let borderColor = "#3a3f58";
        let shadowEffect = "none";
        let scale = "1";
        let cursor = "default";

        if (isCurrentEnd) {
          circleColor = "#bf5af2";
          borderColor = "#bf5af2";
          shadowEffect = "0 0 15px rgba(191, 90, 242, 0.8), 0 0 5px rgba(191, 90, 242, 0.5)";
          scale = "1.2";
          cursor = "pointer";
        } else if (isStart) {
          circleColor = active ? "#30d158" : "#131520";
          borderColor = "#30d158";
          shadowEffect = "0 0 10px rgba(48, 209, 88, 0.4)";
          scale = "1.1";
          cursor = "pointer";
        } else if (isEnd) {
          circleColor = active ? "#ff453a" : "#131520";
          borderColor = "#ff453a";
          shadowEffect = "0 0 10px rgba(255, 69, 58, 0.4)";
          scale = "1.1";
          cursor = "pointer";
        } else if (active) {
          circleColor = "#aa3bff";
          borderColor = "#aa3bff";
          shadowEffect = "0 0 10px rgba(170, 59, 255, 0.6)";
        } else if (isValidNext) {
          circleColor = "#131520";
          borderColor = "#ffd60a";
          shadowEffect = "0 0 12px rgba(255, 214, 10, 0.7)";
          scale = "1.15";
          cursor = "pointer";
        }

        const handleStationClick = (e) => {
          e.stopPropagation();
          if (onStationClick) {
            onStationClick(stationId);
          }
        };

        return (
          <div
            key={stationId}
            style={{
              position: "absolute",
              left: pos.x - 12,
              top: pos.y - 12,
              width: 24,
              height: 24,
              zIndex: isCurrentEnd || isValidNext ? 12 : active ? 10 : 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: cursor,
            }}
            onClick={handleStationClick}
            title={`${station.name} ${station.interchange ? "(Interscambio)" : ""}`}
          >
            {/* Station Circle */}
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: circleColor,
                border: `3px solid ${borderColor}`,
                boxSizing: "border-box",
                transform: `scale(${scale})`,
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: shadowEffect,
              }}
            />

            {/* Station Label */}
            <div
              style={{
                position: "absolute",
                top: 24,
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "10px",
                fontWeight: isStart || isEnd || active || isValidNext ? "700" : "500",
                whiteSpace: "nowrap",
                color: isStart
                  ? "#30d158"
                  : isEnd
                  ? "#ff453a"
                  : isCurrentEnd
                  ? "#bf5af2"
                  : isValidNext
                  ? "#ffd60a"
                  : active
                  ? "#aa3bff"
                  : "#8e8e93",
                pointerEvents: "none",
                textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                transition: "color 0.2s",
              }}
            >
              {station.name}
              {isStart && " (P)"}
              {isEnd && " (A)"}
            </div>

            {/* Interchange Marker */}
            {Number(station.interchange) === 1 && showLines && (
              <div
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#ffd60a",
                  border: "1px solid #0d0e15",
                  boxShadow: "0 0 4px rgba(255, 214, 10, 0.8)",
                  zIndex: 5,
                }}
                title="Stazione di interscambio"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Map;