// core.js — data model & helpers

export function randomUUID() {
  if (crypto && crypto.randomUUID) return crypto.randomUUID();
  // tiny fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c=>{
    const r = (Math.random()*16)|0, v = c==='x'?r:(r&0x3|0x8); return v.toString(16);
  });
}

// Agent
export function createAgent(name='Student Agent') {
  return {
    name,
    IK: [],          // Identity Kernel items (strings)
    AH: '',          // Assembly History (free text)
    SPTS: [],        // Skills/Practices/Tools/Standards (strings)
    BROA: {},        // Beliefs/Rules/Ontology/Auth notes
    PRS: {},         // Personal Reality Structure (optional)
    ATCF: { score: null } // Adaptive Temporal Consistency Function (placeholder)
  };
}

// Default tracks for EqualStanding tests
function trackA() {
  return {
    id: 'A', label: 'Textual Track',
    goals: ['Demonstrate understanding'],
    evidenceReq: ['text'],
    analysisReq: ['concepts','relations','counterarguments'],
    objectionReq: true
  };
}
function trackB() {
  return {
    id: 'B', label: 'Relational Track',
    goals: ['Demonstrate understanding'],
    evidenceReq: ['lived','interview','artifact'],
    analysisReq: ['concepts','relations','counterarguments'],
    objectionReq: true
  };
}

// A simple rubric with observable criteria
export function defaultRubric() {
  return [
    { id:'clarity', label:'Concept clarity', criteria:[
      { key:'defines_terms', label:'Defines key terms', observable:true },
      { key:'vibes', label:'Feels sophisticated', observable:false } // should be removed by RecalibrateCred
    ]},
    { id:'analysis', label:'Analytic rigor', criteria:[
      { key:'uses_evidence', label:'Cites/grounds claims', observable:true },
      { key:'tone', label:'Sounds authoritative', observable:false } // should be removed
    ]}
  ];
}

export function createWorld() {
  return {
    Ctx: { termWeek: 6 },
    Gates: {
      voice: (agent)=> true,
      evidence: (claim)=> ['text','empirical','lived'].includes(claim.type),
      standing: (agent)=> true
    },
    Constructors: [],
    MetaCons: { changeLog: [] },
    Glossary: [],
    Tracks: [trackA(), trackB()],
    Rubric: defaultRubric()
  };
}

// Sample claims to preview gating
export function sampleClaims() {
  return [
    { id:'c1', type:'text', label:'Textual citation: Nussbaum (2011)' },
    { id:'c2', type:'empirical', label:'Empirical stat: Census data' },
    { id:'c3', type:'lived', label:'Lived experience interview (IRB OK)' },
    { id:'c4', type:'other', label:'Artwork without context' }
  ];
}

// Simple ATCF placeholder scoring
export function computeATCF(agent) {
  const ik = agent.IK?.length || 0;
  const spts = agent.SPTS?.length || 0;
  const ah = agent.AH?.trim().length || 0;
  const raw = Math.min(100, Math.round( (ik*10) + (spts*8) + Math.min(ah/10, 40) ));
  return raw; // 0..100
}
