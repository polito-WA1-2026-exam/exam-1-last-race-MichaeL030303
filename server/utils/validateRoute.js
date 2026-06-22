import db from "../db.js";

function validateRoute(route, start, end) {
  if (!Array.isArray(route) || route.length < 2) {
    return { valid: false, reason: "Percorso troppo corto" };
  }

  if (route[0] !== start) {
    return { valid: false, reason: `Il percorso deve iniziare da ${start}` };
  }

  if (route[route.length - 1] !== end) {
    return { valid: false, reason: `Il percorso deve terminare a ${end}` };
  }

  const usedSegments = new Set();
  let previousLine = null;

for (let i = 0; i < route.length - 1; i++) {
  const a = route[i];
  const b = route[i + 1];

  const segment = db.prepare(`
    SELECT line
    FROM segments
    WHERE (station1 = ? AND station2 = ?)
       OR (station1 = ? AND station2 = ?)
  `).get(a, b, b, a);

  if (!segment) {
    return {
      valid: false,
      reason: `Non esiste un segmento tra ${a} e ${b}`,
    };
  }

  const key = a < b ? `${a}-${b}` : `${b}-${a}`;

  if (usedSegments.has(key)) {
    return {
      valid: false,
      reason: `Segmento ${key} usato due volte`,
    };
  }

  usedSegments.add(key);

  // 🚇 controllo linea
  if (previousLine !== null && previousLine !== segment.line) {
    const currentStation = a;

    const station = db.prepare(`
      SELECT interchange
      FROM stations
      WHERE id = ?
    `).get(currentStation);

    if (!station || station.interchange !== 1) {
      return {
        valid: false,
        reason: `Cambio linea non permesso alla stazione ${currentStation}`,
      };
    }
  }

  previousLine = segment.line;
}

  return { valid: true };
}

export default validateRoute;