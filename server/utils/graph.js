import db from "../db.js";

function buildGraph() {
  const segments = db.prepare("SELECT * FROM segments").all();

  const graph = {};

  for (const s of segments) {
    if (!graph[s.station1]) graph[s.station1] = [];
    if (!graph[s.station2]) graph[s.station2] = [];

    graph[s.station1].push(s.station2);
    graph[s.station2].push(s.station1);
  }

  return graph;
}

function bfsDistance(graph, start, target) {
  const queue = [[start, 0]];
  const visited = new Set();

  while (queue.length) {
    const [node, dist] = queue.shift();

    if (visited.has(node)) continue;
    visited.add(node);

    if (node === target) return dist;

    for (const n of graph[node] || []) {
      queue.push([n, dist + 1]);
    }
  }

  return Infinity;
}

const graph = buildGraph();

const stations = db.prepare("SELECT id FROM stations").all();

const distances = {};

for (const s1 of stations) {
  distances[s1.id] = {};

  for (const s2 of stations) {
    distances[s1.id][s2.id] = bfsDistance(graph, s1.id, s2.id);
  }
}

export { graph, distances };