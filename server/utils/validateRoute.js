import db from "../db.js";

function validateRoute(route, start, end) {
  if (!Array.isArray(route) || route.length < 2)
    return false;

  if (route[0] !== start)
    return false;

  if (route[route.length - 1] !== end)
    return false;

  const usedSegments = new Set();

  let prevLine = null;

  for (let i = 0; i < route.length - 1; i++) {
    const a = route[i];
    const b = route[i + 1];

    const segment = db.prepare(`
      SELECT line
      FROM segments
      WHERE (station1 = ? AND station2 = ?)
         OR (station1 = ? AND station2 = ?)
    `).get(a, b, b, a);

    if (!segment)
      return false;

    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (usedSegments.has(key))
      return false;

    usedSegments.add(key);

    const currentLine = segment.line;

    if (i === 0) {
      prevLine = currentLine;
      continue;
    }

    if (currentLine !== prevLine) {
      const station = db.prepare(`
        SELECT interchange
        FROM stations
        WHERE id = ?
      `).get(a);

      if (!station || !station.interchange)
        return false;
    }

    prevLine = currentLine;
  }

  return true;
}

export default validateRoute;