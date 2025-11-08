function ChangeLog({ state }) {
  const log = state.world.MetaCons.changeLog.slice().reverse();
  const fmt = (ts) => new Date(ts).toLocaleString();

  return (
    <div className="card p-5">
      <h3>Change-Log</h3>
      <p className="text-sm text-gray-600 mb-3">Append-only audit trail of TRC entries and gate changes.</p>
      {log.length === 0 ? (
        <div className="text-sm text-gray-500">No entries yet.</div>
      ) : (
        <ul className="space-y-3">
          {log.map(e => (
            <li key={e.id} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className={`badge ${e.kind === "TRC" ? 'badge-ok' : 'badge-warn'}`}>{e.kind}</span>
                <span className="text-xs text-gray-500">{fmt(e.createdAt)}</span>
              </div>
              {e.kind === "TRC" ? (
                <div className="text-sm mt-2">
                  <div><span className="font-semibold">Truth:</span> {e.truth || "—"}</div>
                  <div><span className="font-semibold">Recognition:</span> {e.recognition || "—"}</div>
                  <div><span className="font-semibold">Remedy:</span> {e.remedy || "—"}</div>
                  <div><span className="font-semibold">Review:</span> {e.reviewDate || "—"}</div>
                </div>
              ) : (
                <div className="text-sm mt-2">
                  <div><span className="font-semibold">Memo:</span> {e.memo}</div>
                  <pre className="code text-xs bg-white p-2 rounded mt-1 overflow-x-auto">
{JSON.stringify({previous: e.previous, next: e.next}, null, 2)}
                  </pre>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
