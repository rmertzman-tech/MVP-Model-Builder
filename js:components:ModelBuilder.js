const { useState } = React;

function ModelBuilder({ state, setState }) {
  const [draft, setDraft] = useState({ name: "", IK: "", AH: "", SPTS: "", ATCF: 70 });

  const addAgent = () => {
    if (!draft.name.trim()) return;
    const a = FAIM.Agent(draft.name.trim());
    a.IK = draft.IK.split(",").map(s => s.trim()).filter(Boolean);
    a.AH = draft.AH.split(",").map(s => s.trim()).filter(Boolean);
    a.SPTS = draft.SPTS.split(",").map(s => s.trim()).filter(Boolean);
    a.ATCF.score = Number(draft.ATCF) || null;
    setState(prev => ({ ...prev, agents: [...prev.agents, a] }));
    setDraft({ name: "", IK: "", AH: "", SPTS: "", ATCF: 70 });
  };

  const removeAgent = (id) =>
    setState(prev => ({ ...prev, agents: prev.agents.filter(a => a.id !== id) }));

  return (
    <div className="card p-5">
      <h3>Model Builder</h3>
      <p className="text-sm text-gray-600 mb-4">
        Define agents (IK, AH, SPTS, ATCF). These standpoints interact with World gates.
      </p>

      <div className="grid md:grid-cols-5 gap-3">
        <input className="border rounded-lg px-3 py-2 col-span-1" placeholder="Name"
          value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} />
        <input className="border rounded-lg px-3 py-2 col-span-1" placeholder="IK (comma sep)"
          value={draft.IK} onChange={e => setDraft({ ...draft, IK: e.target.value })} />
        <input className="border rounded-lg px-3 py-2 col-span-1" placeholder="AH (comma sep)"
          value={draft.AH} onChange={e => setDraft({ ...draft, AH: e.target.value })} />
        <input className="border rounded-lg px-3 py-2 col-span-1" placeholder="SPTS (comma sep)"
          value={draft.SPTS} onChange={e => setDraft({ ...draft, SPTS: e.target.value })} />
        <input type="number" min="0" max="100" className="border rounded-lg px-3 py-2 col-span-1" placeholder="ATCF"
          value={draft.ATCF} onChange={e => setDraft({ ...draft, ATCF: e.target.value })} />
      </div>

      <div className="mt-3">
        <button className="btn btn-primary" onClick={addAgent}>Add Agent</button>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold mb-2">Agents</h4>
        <ul className="space-y-2">
          {state.agents.map(a => (
            <li key={a.id} className="flex items-start justify-between bg-gray-50 p-3 rounded-lg">
              <div>
                <div className="font-semibold">{a.name}</div>
                <div className="text-xs text-gray-600">
                  <span className="badge badge-ok mr-2">ATCF: {a.ATCF?.score ?? "—"}</span>
                  SPTS: {a.SPTS.join(", ") || "—"}
                </div>
              </div>
              <button className="btn btn-ghost" onClick={() => removeAgent(a.id)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
