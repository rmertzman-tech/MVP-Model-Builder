function MetricsDashboard({ state }) {
  const m = FAIM.metrics.computeMetrics(state);
  const flag = (ok) => ok ? "badge-ok" : "badge-warn";
  return (
    <div className="card p-5">
      <h3>Metrics Dashboard</h3>
      <div className="grid md:grid-cols-5 gap-3 text-sm mt-2">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-gray-500">Agents with Voice</div>
          <div className={`badge ${flag(m.percentVoice >= 80)}`}>{m.percentVoice}%</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-gray-500">Evidence Coverage</div>
          <div className={`badge ${flag(m.coverage >= 66)}`}>{m.coverage}%</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-gray-500">Lexicon Size</div>
          <div className="badge badge-ok">{m.lexiconSize}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-gray-500">Avg TRC Latency</div>
          <div className={`badge ${flag(m.avgLatencyDays <= 28)}`}>{m.avgLatencyDays} days</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-gray-500">Avg ATCF</div>
          <div className="badge badge-ok">{m.avgATCF ?? "—"}</div>
        </div>
      </div>
    </div>
  );
}
