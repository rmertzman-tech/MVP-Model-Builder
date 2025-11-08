const { useState } = React;

function GateEditor({ state, setState }) {
  const cfg = state.world.GateConfig;
  const [memo, setMemo] = useState("");

  const toggle = (key) => {
    const allowed = new Set(cfg.evidenceAllowed);
    allowed.has(key) ? allowed.delete(key) : allowed.add(key);
    setState(prev => ({
      ...prev,
      world: { ...prev.world, GateConfig: { ...cfg, evidenceAllowed: Array.from(allowed) } }
    }));
  };

  const sptsStr = cfg.requireSPTS.join(", ");

  const saveSPTS = (val) => {
    const previous = { ...cfg };
    const next = { ...cfg, requireSPTS: val.split(",").map(s => s.trim()).filter(Boolean) };
    const logWithChange = FAIM.ops.GateChange(
      state.world.MetaCons.changeLog,
      memo || "(no memo)",
      previous,
      next
    );
    setState(prev => ({
      ...prev,
      world: {
        ...prev.world,
        GateConfig: next,
        MetaCons: { ...prev.world.MetaCons, changeLog: logWithChange }
      }
    }));
    setMemo("");
  };

  return (
    <div className="card p-5">
      <h3>Gate Editor</h3>
      <p className="text-sm text-gray-600 mb-3">
        Toggle which evidence counts and (optionally) require certain SPTS tags for voice (simulating historical gates).
      </p>

      <div className="mb-3">
        <div className="font-semibold mb-1">Evidence Allowed</div>
        {["text", "empirical", "lived"].map(k => (
          <label key={k} className="mr-4 text-sm">
            <input type="checkbox" className="mr-1"
              checked={cfg.evidenceAllowed.includes(k)}
              onChange={() => toggle(k)} />
            {k}
          </label>
        ))}
      </div>

      <div className="mb-3">
        <div className="font-semibold mb-1">Standing Rule</div>
        <select
          className="border rounded-lg px-3 py-2"
          value={cfg.standingRule}
          onChange={(e) =>
            setState(prev => ({
              ...prev,
              world: { ...prev.world, GateConfig: { ...cfg, standingRule: e.target.value } }
            }))
          }>
          <option value="any">Any agent has voice</option>
          <option value="requiresSPTS">Require SPTS tags for voice</option>
        </select>
      </div>

      {cfg.standingRule === "requiresSPTS" && (
        <div className="mb-3">
          <div className="font-semibold mb-1">Required SPTS (comma separated)</div>
          <input className="border rounded-lg px-3 py-2 w-full" defaultValue={sptsStr}
                 onBlur={(e) => saveSPTS(e.target.value)} placeholder="e.g., free_male_greek" />
          <p className="text-xs text-gray-500 mt-1">
            A memo is recorded in the change-log for transparency.
          </p>
        </div>
      )}

      <div className="mb-2">
        <div className="font-semibold mb-1">“What changed?” memo (required for SPTS changes)</div>
        <textarea className="border rounded-lg px-3 py-2 w-full" rows="2"
          value={memo} onChange={e => setMemo(e.target.value)} placeholder="Explain the rationale for changing gates..." />
      </div>
    </div>
  );
}
