// js/core/models.js
(function () {
  const makeUUID = () =>
    (crypto && crypto.randomUUID) ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });

  // Agent factory
  const Agent = (name = "Agent") => ({
    id: makeUUID(),
    name,
    IK: [],        // Identity Kernel descriptors
    AH: [],        // Assembly History highlights
    SPTS: [],      // Standpoint set tags
    BROA: {},      // Beliefs/Rules/Ontology/Authenticity (free-form)
    PRS: {},       // Phenomenal Reference Space notes
    ATCF: { score: null, notes: "" } // Adaptive Temporal Coherence proxy
  });

  // World factory (with serializable gate config)
  const worldTemplate = () => ({
    Ctx: { termWeek: 6 },
    GateConfig: {
      evidenceAllowed: ["text", "empirical", "lived"],
      requireSPTS: [],       // e.g., ["free_male_greek"] to mimic Aristotle
      standingRule: "any",   // "any" | "requiresSPTS"
    },
    Glossary: [],     // {term, by, date, nextReviewWeeks}
    Tracks: [
      { id: "A", name: "Textual",
        goals: "Demonstrate understanding",
        evidenceReq: ["text", "empirical"],
        analysisReq: true, objectionReq: true
      },
      { id: "B", name: "Relational",
        goals: "Demonstrate understanding",
        evidenceReq: ["lived", "empirical"],
        analysisReq: true, objectionReq: true,
        consentRequired: true, redactionEnabled: true
      }
    ],
    Rubric: [
      { id: "goals", label: "States goals clearly",
        criteria: [{ name: "States 2–3 goals explicitly", observable: true },
                   { name: "Shows scholarly voice", observable: false }] }, // will be removed
      { id: "analysis", label: "Analysis quality",
        criteria: [{ name: "Explains 3+ core concepts", observable: true },
                   { name: "Uses prestigious sources", observable: false }] }
    ],
    Constructors: [],
    MetaCons: { changeLog: [] }, // TRC & gate changes appended here
    Privacy: { requireConsent: true, allowNoLivedPath: true, redactionText: "" }
  });

  // Rehydrate functional gates from GateConfig (for runtime)
  function buildGates(cfg) {
    return {
      voice: (agent) =>
        cfg.standingRule === "requiresSPTS"
          ? agent.SPTS.some(tag => cfg.requireSPTS.includes(tag))
          : true,
      standing: (agent) => true, // extension point
      evidence: (claim) => cfg.evidenceAllowed.includes(claim.type)
    };
  }

  // Operators
  function RecalibrateCred(rubric) {
    return rubric.map(r =>
      ({ ...r, criteria: r.criteria.filter(c => !!c.observable) })
    );
  }

  function LexiconExtend(glossary, term, by = "student") {
    const entry = {
      term,
      by,
      date: new Date().toISOString(),
      nextReviewWeeks: 6
    };
    return [...glossary, entry];
  }

  function EqualStanding(tracks) {
    if (!tracks || tracks.length < 2) return true;
    const keys = ["goals", "evidenceReq", "analysisReq", "objectionReq"];
    const ref = JSON.stringify(Object.fromEntries(keys.map(k => [k, tracks[0][k]])));
    return tracks.every(t =>
      JSON.stringify(Object.fromEntries(keys.map(k => [k, t[k]]))) === ref
    );
  }

  function TRC_Mini(log, { truth, recognition, remedy, reviewDate }) {
    const entry = {
      id: makeUUID(),
      kind: "TRC",
      truth, recognition, remedy,
      reviewDate,
      createdAt: Date.now()
    };
    return [...log, entry];
  }

  function GateChange(log, memo, previous, next) {
    const entry = {
      id: makeUUID(),
      kind: "GATE_CHANGE",
      memo,
      previous,
      next,
      createdAt: Date.now()
    };
    return [...log, entry];
  }

  // Derive simple metrics from current state
  function computeMetrics(state) {
    const { agents, world } = state;
    const Gates = buildGates(world.GateConfig);
    const voiceable = agents.filter(a => Gates.voice(a)).length;
    const percentVoice = agents.length ? Math.round((voiceable / agents.length) * 100) : 0;

    const evidenceUniverse = new Set(["text", "empirical", "lived"]);
    const coverage = Math.round((world.GateConfig.evidenceAllowed.length / evidenceUniverse.size) * 100);

    const lexiconSize = world.Glossary.length;

    // TRC latency: average days between createdAt and reviewDate (if set)
    const trcs = world.MetaCons.changeLog.filter(e => e.kind === "TRC");
    const avgLatencyDays = trcs.length
      ? Math.round(trcs.reduce((acc, e) => {
          const d = e.reviewDate ? (new Date(e.reviewDate).getTime() - e.createdAt) : 0;
          return acc + Math.max(0, d);
        }, 0) / trcs.length / (1000 * 60 * 60 * 24))
      : 0;

    // ATCF: simple mean ignoring nulls
    const scores = agents.map(a => a.ATCF?.score).filter(s => s !== null && !Number.isNaN(s));
    const avgATCF = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

    return { percentVoice, coverage, lexiconSize, avgLatencyDays, avgATCF };
  }

  // Export a serializable snapshot (no functions)
  function serialize(state) {
    return JSON.stringify(state, null, 2);
  }

  // Import + rehydrate (ensures GateConfig exists)
  function deserialize(json) {
    const obj = typeof json === "string" ? JSON.parse(json) : json;
    // Ensure shape
    if (!obj.world?.GateConfig) obj.world.GateConfig = worldTemplate().GateConfig;
    return obj;
  }

  // Starter state with a couple of illustrative agents
  const initialState = () => {
    const a1 = Agent("Aristotle");
    a1.SPTS = ["free_male_greek", "scientist_philosopher"];
    a1.IK = ["Eudaimonia", "Teleology"];
    a1.ATCF.score = 62;

    const a2 = Agent("Patricia Hill Collins");
    a2.SPTS = ["black_woman", "community_scholar"];
    a2.IK = ["Lived experience counts", "Standpoint methodology"];
    a2.ATCF.score = 85;

    const world = worldTemplate(); // default, inclusive
    return {
      agents: [a1, a2],
      world
    };
  };

  window.FAIM = {
    Agent,
    worldTemplate,
    buildGates,
    ops: { RecalibrateCred, LexiconExtend, EqualStanding, TRC_Mini, GateChange },
    metrics: { computeMetrics },
    io: { serialize, deserialize },
    initialState,
    util: { makeUUID }
  };
})();
