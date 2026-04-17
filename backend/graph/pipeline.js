const { v4: uuidv4 } = require('uuid');

// Pipeline network: nodes and edges
// Each node = a sensor location
const PIPELINE_NODES = {
  'S001': { id: 'S001', name: 'Reservoir North', lat: 28.6190, lng: 77.2100, neighbors: ['S002', 'S003'] },
  'S002': { id: 'S002', name: 'Treatment Plant A',lat: 28.6155, lng: 77.2060, neighbors: ['S001', 'S004', 'S005'] },
  'S003': { id: 'S003', name: 'Junction West',    lat: 28.6180, lng: 77.2150, neighbors: ['S001', 'S006'] },
  'S004': { id: 'S004', name: 'Distribution Hub', lat: 28.6120, lng: 77.2040, neighbors: ['S002', 'S007'] },
  'S005': { id: 'S005', name: 'Village A Tap',    lat: 28.6130, lng: 77.2080, neighbors: ['S002', 'S008'] },
  'S006': { id: 'S006', name: 'Village B Tap',    lat: 28.6165, lng: 77.2180, neighbors: ['S003'] },
  'S007': { id: 'S007', name: 'Village C Tap',    lat: 28.6090, lng: 77.2020, neighbors: ['S004'] },
  'S008': { id: 'S008', name: 'Village D Tap',    lat: 28.6100, lng: 77.2100, neighbors: ['S005'] },
};

const PIPELINE_EDGES = [
  ['S001', 'S002'], ['S001', 'S003'],
  ['S002', 'S004'], ['S002', 'S005'],
  ['S003', 'S006'],
  ['S004', 'S007'],
  ['S005', 'S008'],
];

/**
 * BFS from a contaminated/leaking node to find affected downstream nodes.
 * @param {string} sourceId - The node where the issue was detected
 * @param {string} direction - 'downstream' (default) or 'upstream'
 * @returns {string[]} - List of affected node IDs
 */
function bfsAffectedNodes(sourceId, direction = 'downstream') {
  const visited = new Set();
  const queue = [sourceId];
  const affected = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);
    affected.push(current);

    const node = PIPELINE_NODES[current];
    if (!node) continue;

    for (const neighbor of node.neighbors) {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
      }
    }
  }

  return affected;
}

/**
 * DFS to trace the path from source to a specific target node.
 */
function dfsPath(startId, targetId) {
  const visited = new Set();
  const path = [];

  function dfs(nodeId) {
    if (visited.has(nodeId)) return false;
    visited.add(nodeId);
    path.push(nodeId);

    if (nodeId === targetId) return true;

    const node = PIPELINE_NODES[nodeId];
    if (!node) return false;

    for (const neighbor of node.neighbors) {
      if (dfs(neighbor)) return true;
    }

    path.pop();
    return false;
  }

  dfs(startId);
  return path;
}

module.exports = { PIPELINE_NODES, PIPELINE_EDGES, bfsAffectedNodes, dfsPath };
