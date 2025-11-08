const { useState } = React;

function OperatorPanel({ state, setState }) {
  const [newTerm, setNewTerm] = useState("");
  const [trc, setTrc] = useState({ truth: "", recognition: "", remedy: "", reviewDate: "" });
  const [equal, setEqual] = useState(null);

  const runRecalibrate = () => {
    const cleaned = FAIM.ops.RecalibrateCred(state.world.Rubric);
    setState(prev => ({ ...prev, world: { ...prev.world, Rubric: cleaned } }));
  };

  const addTerm = () => {
    if (!newTerm.trim()) return;
    const nextGloss = FAIM.ops.LexiconExtend(state.world.Glossary, newTerm.trim(), "instructor");
    setState(prev => ({ ...prev, world: { ...prev.world, Glossary: nextGloss } }));
    setNewTerm("");
  };

  const checkEqualStanding = () => {
    setEqual(FAIM.ops.EqualStanding(state.world.Tracks));
  };

  const addTRC = () => {
    const nextLog = FAIM.ops.TRC_Mini(state.world.MetaCons.changeLog, trc);
    setState(prev => ({ ...prev, world: { ...prev.world, MetaCons: { changeLog: nextLog } } }));
    setTrc({ truth: "", recognition: "", remedy: "", reviewDate: "" });
  };

  return (
    <div className="card p-5">
      <h3>Operator Panel</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="font-semibold mb-2">RecalibrateCred</div>
          <p className="text-sm text-gray-600 mb-2">
            Strip non-observable rubric criteria.
          </p>
          <button className="btn btn-primary" onClick={runRecalibrate}>Recalibrate Rubric</button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="font-semibold mb-2">LexiconExtend</div>
          <input className="border rounded-lg px-3 py-2 w-full mb-2" placeholder="New term"
            value={newTerm} onChange={e => setNewTerm(e.target.value)} />
          <button className="btn btn-primary" onClick={addTerm}>Add Term</button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="font-semibold mb-2">EqualStanding</div>
          <button className="btn btn-primary mb-2" onClick={checkEqualStanding}>Check Tracks</button>
          {equal !== null && (
            <div className={`badge ${equal ? 'badge-ok' : 'badge-error'}`}>
              {equal ? "Tracks aligned" : "Tracks NOT aligned"}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
        <div className="font-semibold mb-2">TRC_Mini (append to Change-Log)</div>
        <div className="grid md:grid-cols-4 gap-2">
          <input className="border rounded-lg px-3 py-2" placeholder="Truth"
            value={trc.truth} onChange={e => setTrc({ ...trc, truth: e.target.value })} />
          <input className="border rounded-lg px-3 py-2" placeholder="Recognition"
            value={trc.recognition} onChange={e => setTrc({ ...trc, recognition: e.target.value })} />
          <input className="border rounded-lg px-3 py-2" placeholder="Remedy"
            value={trc.remedy} onChange={e => setTrc({ ...trc, remedy: e.target.value })} />
          <input type="date" className="border rounded-lg px-3 py-2" placeholder="Review date"
            value={trc.reviewDate} onChange={e => setTrc({ ...trc, reviewDate: e.target.value })} />
        </div>
        <button className="btn btn-primary mt-2" onClick={addTRC}>Add TRC Entry</button>
      </div>
    </div>
  );
}
