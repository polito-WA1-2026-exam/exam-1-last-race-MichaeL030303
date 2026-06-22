import React from "react";

function RouteList({
  segments = [],
  stations = [],
  lines = [],
  route = [],
  setRoute,
  validNextStations = [],
  onStationClick,
  startStationId = null,
  endStationId = null,
  onSegmentWarning = null,
}) {
  const getStationName = (id) => {
    const s = stations.find((st) => st.id === id || st.id?.toString() === id?.toString());
    return s ? s.name : `Stazione ${id}`;
  };

  const getSegmentLine = (s1, s2) => {
    const seg = segments.find(
      (s) =>
        (s.station1 === s1 && s.station2 === s2) ||
        (s.station2 === s1 && s.station1 === s2)
    );
    if (!seg) return null;
    return lines.find((l) => l.id === seg.line);
  };

  const getLineColor = (line) => {
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

  const handleUndo = () => {
    if (route.length > 1) {
      setRoute(route.slice(0, -1));
    }
  };

  const handleReset = () => {
    if (startStationId !== null) {
      setRoute([Number(startStationId)]);
    }
  };

  const isSegmentInRoute = (s1, s2) => {
    if (route.length < 2) return -1;
    for (let i = 0; i < route.length - 1; i++) {
      const r1 = route[i];
      const r2 = route[i + 1];
      if ((r1 === s1 && r2 === s2) || (r1 === s2 && r2 === s1)) {
        return i;
      }
    }
    return -1;
  };

  const handleSegmentClick = (seg) => {
    if (route.length === 0) return;
    const last = route[route.length - 1];

    if (Number(seg.station1) === Number(last)) {
      onStationClick(Number(seg.station2));
    } else if (Number(seg.station2) === Number(last)) {
      onStationClick(Number(seg.station1));
    } else {
      // Check if it's already in the route to allow backtracking
      const idx = isSegmentInRoute(Number(seg.station1), Number(seg.station2));
      if (idx >= 0) {
        // Roll back to the station of this segment
        onStationClick(Number(route[idx + 1]));
      } else {
        if (onSegmentWarning) {
          onSegmentWarning("Questo segmento non si connette alla fine del tuo percorso!");
        }
      }
    }
  };

  // Build the array of steps to show the path sequence
  const routeSteps = [];
  for (let i = 0; i < route.length; i++) {
    const current = route[i];
    const next = route[i + 1];
    const connectingLine = next !== undefined ? getSegmentLine(current, next) : null;
    
    routeSteps.push({
      stationId: current,
      name: getStationName(current),
      nextLine: connectingLine,
    });
  }

  return (
    <div className="route-planner">
      {/* Active Route Display */}
      <div className="section-title">La tua rotta ({route.length} stazioni)</div>
      
      <div className="route-steps-container">
        {routeSteps.map((step, idx) => {
          const isStart = Number(step.stationId) === Number(startStationId);
          const isEnd = Number(step.stationId) === Number(endStationId);
          const isLast = idx === routeSteps.length - 1;

          return (
            <div key={idx} className="route-step-wrapper">
              <div 
                className={`route-step-node ${isStart ? "start" : isEnd ? "end" : isLast ? "current" : ""}`}
                onClick={() => onStationClick && onStationClick(step.stationId)}
                title="Clicca per tornare a questa stazione"
                style={{ cursor: "pointer" }}
              >
                <span className="node-dot"></span>
                <span className="node-name">{step.name}</span>
                {isStart && <span className="badge start">PARTENZA</span>}
                {isEnd && <span className="badge end">ARRIVO</span>}
                {!isStart && !isEnd && isLast && <span className="badge current">POSIZIONE</span>}
              </div>
              
              {step.nextLine && (
                <div className="route-step-connector">
                  <div className="connector-line" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Controls */}
      <div className="route-actions">
        <button 
          onClick={handleUndo} 
          disabled={route.length <= 1}
          className="btn btn-secondary btn-sm"
          title="Annulla l'ultima stazione aggiunta"
        >
          ↩ Annulla
        </button>
        <button 
          onClick={handleReset} 
          disabled={route.length <= 1}
          className="btn btn-danger btn-sm"
          title="Resetta il percorso alla stazione di partenza"
        >
          🗑 Resetta
        </button>
      </div>

      {/* All Segments Scrollable List (As requested in the PDF) */}
      <div className="next-connections-section">
        <div className="section-subtitle">Tutti i segmenti della rete</div>
        
        <div 
          className="next-connections-grid" 
          style={{ 
            maxHeight: "260px", 
            overflowY: "auto", 
            paddingRight: "5px",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            background: "#0d0e15",
            padding: "8px"
          }}
        >
          {segments.map((seg, idx) => {
            const inRouteIdx = isSegmentInRoute(Number(seg.station1), Number(seg.station2));
            const isActive = inRouteIdx >= 0;

            // Check if this segment connects to the last station of the current route
            const last = route[route.length - 1];
            const isConnectable = 
              !isActive && 
              (Number(seg.station1) === Number(last) || Number(seg.station2) === Number(last)) &&
              validNextStations.includes(Number(seg.station1) === Number(last) ? Number(seg.station2) : Number(seg.station1));

            let btnStyle = {
              borderLeftWidth: "4px",
              borderLeftStyle: "solid",
              borderLeftColor: "var(--border-color)",
            };

            if (isActive) {
              btnStyle.backgroundColor = "rgba(170, 59, 255, 0.15)";
              btnStyle.borderLeftColor = "var(--color-primary)";
            } else if (isConnectable) {
              btnStyle.boxShadow = "0 0 8px rgba(255, 214, 10, 0.4)";
              btnStyle.borderLeftColor = "#ffd60a";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSegmentClick(seg)}
                className={`next-station-btn ${isActive ? "active" : ""}`}
                style={btnStyle}
                title={isActive ? "Clicca per tornare a questo punto" : isConnectable ? "Clicca per aggiungere alla rotta" : ""}
              >
                <span className="btn-station-name" style={{ fontSize: "0.85rem" }}>
                  {getStationName(seg.station1)} — {getStationName(seg.station2)}
                </span>
                {isActive && <span className="btn-line-name" style={{ color: "var(--color-primary)", fontSize: "0.75rem" }}>ATTIVO</span>}
                {!isActive && isConnectable && <span className="btn-line-name" style={{ color: "#ffd60a", fontSize: "0.75rem" }}>AGGIUNGI</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RouteList;