const { useState } = React;

function TopBar({ onExport, onImport, state, setState }) {
  const p = state.world.Privacy;
  return (
    <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">FAIM-QIRF Agent Demo</h1>
          <p className="text-xs opacity-90">
            Formalizing epistemic justice with Agents (PRFs) + World (Gates) + Operators.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs bg-white/10 rounded px-2 py-1">
            <input type="checkbox" className="mr-1"
              checked={p.requireConsent}
              onChange={(e) =>
                setState(prev => ({ ...prev, world: { ...prev.world, Privacy: { ...p, requireConsent: e.target.checked } } }))
              } />
            require consent
          </label>
          <label className="text-xs bg-white/10 rounded px-2 py-1">
            <input type="checkbox" className="mr-1"
              checked={p.allowNoLivedPath}
              onChange={(e) =>
                setState(prev => ({ ...prev, world: { ...prev.world, Privacy: { ...p, allowNoLivedPath: e.target.checked } } }))
              } />
            allow no-lived path
          </label>
          <button className="btn btn-ghost" onClick={onExport}>Export JSON</button>
          <label className="btn btn-ghost cursor-pointer">
            Import JSON
            <input type="file" accept="application/json" className="hidden"
              onChange={onImport} />
          </label>
        </div>
      </div>
    </header>
  );
}

function App() {
  const [state, setState] = useState(FAIM.initialState());

  const doExport = () => {
    const blob = new Blob([FAIM.io.serialize(state)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "faim-qirf-demo.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const obj = FAIM.io.deserialize(reader.result);
      setState(obj);
    };
    reader.readAsText(f);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen">
      <TopBar onExport={doExport} onImport={doImport} state={state} setState={setState} />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <MetricsDashboard state={state} />
        <div className="grid md:grid-cols-2 gap-6">
          <ModelBuilder state={state} setState={setState} />
          <GateEditor state={state} setState={setState} />
        </div>
        <OperatorPanel state={state} setState={setState} />
        <ChangeLog state={state} />
        <footer className="text-center text-xs text-gray-500 mt-6">
          Demo is stateless. Use Export/Import to share a configuration. No tracking, no cookies.
        </footer>
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
