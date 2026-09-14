export const kpiMetrics = {
  totalIncidents: {
    value: 128,
    label: "Total Incidents",
    change: "+14 vs yesterday",
    changeType: "neutral-tag",
    subtext: "Satellite thermal anomaly detections"
  },
  highRiskSectors: {
    value: 12,
    label: "High-Risk Sectors",
    change: "↑ 8% this cycle",
    changeType: "error-tag",
    subtext: "Critical threshold (>80% probability)"
  },
  activeAlerts: {
    value: 7,
    label: "Active Action Alerts",
    change: "3 Dispatch Pending",
    changeType: "warning-tag",
    subtext: "First-responder notification armed"
  },
  monitoredSectors: {
    value: 64,
    label: "Monitored Sectors",
    change: "99.4% Coverage",
    changeType: "info-tag",
    subtext: "Continuous radiometer telemetry"
  }
};
