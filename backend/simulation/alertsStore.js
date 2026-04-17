// Shared in-memory alerts store
const alerts = [];
const MAX_ALERTS = 100;

function addAlert(alert) {
  alerts.unshift(alert); // newest first
  if (alerts.length > MAX_ALERTS) alerts.pop();
}

function getAlerts() {
  return alerts;
}

function resolveAlert(id) {
  const alert = alerts.find((a) => a.id === id);
  if (alert) alert.resolved = true;
  return alert;
}

module.exports = { addAlert, getAlerts, resolveAlert };
