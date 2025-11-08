// components.js — dumb renderers (vanilla DOM)

import { computeATCF } from './core.js';
import { RecalibrateCred, LexiconExtend, EqualStanding, TRC_Mini } from './operators.js';

export function Tabs(container, tabs, activeId, onPick){
  container.innerHTML = '';
  tabs.forEach(t=>{
    const b = document.createElement('button');
    b.className = 'tab';
    b.setAttribute('role','tab');
    b.setAttribute('aria-selected', t.id===activeId ? 'true' : 'false');
    b.textContent = t.label;
    b.addEventListener('click', ()=> onPick(t.id));
    container.appendChild(b);
  });
}

// ——— Views ———

export function View_ModelBuilder(el, state, setState){
  const a = state.agent, w = state.world;

  el.innerHTML = `
    <div class="card">
      <h2>Model Builder</h2>
      <p class="muted small">Define your Agent (IK, AH, SPTS) and the World (Gates, Tracks, Rubric).</p>
    </div>

    <div class="row">
      <div class="card">
        <h3>Agent</h3>
        <label>Agent name</label>
        <input id="mb_name" type="text" value="${escapeHTML(a.name)}" />
        <label>Identity Kernel (comma-separated)</label>
        <input id="mb_ik" type="text" value="${escapeHTML(a.IK.join(', '))}" />
        <label>Assembly History</label>
        <textarea id="mb_ah">${escapeHTML(a.AH||'')}</textarea>
        <label>SPTS — Skills/Practices/Tools/Standards (comma-separated)</label>
        <input id="mb_spts" type="text" value="${escapeHTML(a.SPTS.join(', '))}" />
        <div class="btnbar">
          <button class="btn" id="mb_save_agent">Save Agent</button>
        </div>
      </div>

      <div class="card">
        <h3>World</h3>
        <div class="grid">
          <div class="kpi"><strong>Term week:</strong> <span id="mb_week">${w.Ctx.termWeek}</span></div>
          <div class="kpi"><strong>Glossary terms:</strong> ${w.Glossary.length}</div>
          <div class="kpi"><strong>Tracks:</strong> ${w.Tracks.map(t=>t.label).join(' , ')}</div>
        </div>
        <div class="divider"></div>
        <h3>Rubric (observable criteria only after recalibration)</h3>
        <div id="mb_rubric">${renderRubric(w.Rubric)}</div>
        <div class="btnbar">
          <button class="btn" id="mb_recal">RecalibrateCred (remove non-observable)</button>
        </div>
      </div>
    </div>
  `;

  el.querySelector('#mb_save_agent').addEventListener('click', ()=>{
    const name = el.querySelector('#mb_name').value.trim() || 'Agent';
    const IK = csvToList(el.querySelector('#mb_ik').value);
    const AH = el.querySelector('#mb_ah').value;
    const SPTS = csvToList(el.querySelector('#mb_spts').value);
    setState({
      ...state,
      agent: { ...state.agent, name, IK, AH, SPTS, ATCF: { score: computeATCF({IK, SPTS, AH}) } }
    });
  });

  el.querySelector('#mb_recal').addEventListener('click', ()=>{
    const newRubric = RecalibrateCred(state.world.Rubric);
    setState({ ...state, world: { ...state.world, Rubric: newRubric } });
  });
}

export function View_GateEditor(el, state, setState){
  const w = state.world;

  el.innerHTML = `
    <div class="card">
      <h2>Gate Editor</h2>
      <p class="muted small">Toggle which claims pass the evidence gate; preview what gets filtered.</p>
    </div>

    <div class="card">
      <h3>Evidence Types Allowed</h3>
      <div class="btnbar">
        ${['text','empirical','lived','other'].map(t=>`
          <label class="pill"><input type="checkbox" class="ge_chk" value="${t}" ${isAllowed(w,t)?'checked':''}/> ${t}</label>
        `).join('')}
      </div>

      <h3>Preview (claims)</h3>
      <div class="list">
        ${state.claims.map(c=>{
          const pass = w.Gates.evidence(c);
          return `<div class="kpi"><strong>${escapeHTML(c.label)}</strong> → ${pass?'<span class="ok">passes</span>':'<span class="err">blocked</span>'}</div>`;
        }).join('')}
      </div>

      <div class="btnbar">
        <button class="btn" id="ge_save">Save Gate Settings</button>
        <button class="btn ghost" id="ge_reset">Allow text, empirical, lived (default)</button>
      </div>

      <p class="small muted">Every change should come with a “What changed?” memo for audit (omitted here but easy to add to Change-Log).</p>
    </div>
  `;

  el.querySelector('#ge_save').addEventListener('click', ()=>{
    const chosen = [...el.querySelectorAll('.ge_chk')].filter(i=>i.checked).map(i=>i.value);
    const evGate = (claim)=> chosen.includes(claim.type);
    setState({ ...state, world: { ...state.world, Gates: { ...state.world.Gates, evidence: evGate } } });
  });
  el.querySelector('#ge_reset').addEventListener('click', ()=>{
    const evGate = (claim)=> ['text','empirical','lived'].includes(claim.type);
    setState({ ...state, world: { ...state.world, Gates: { ...state.world.Gates, evidence: evGate } } });
  });
}

export function View_Operators(el, state, setState){
  const w = state.world;

  el.innerHTML = `
    <div class="card">
      <h2>Operators</h2>
      <p class="muted small">One-click interventions that update the model + logs.</p>
    </div>

    <div class="card">
      <div class="btnbar">
        <button class="btn" id="op_recal">RecalibrateCred</button>
        <button class="btn" id="op_lex">LexiconExtend</button>
        <button class="btn" id="op_equal">EqualStanding?</button>
        <button class="btn" id="op_trc">TRC_Mini</button>
      </div>

      <div id="op_out" class="mono"></div>
    </div>
  `;

  const out = el.querySelector('#op_out');
  const log = (s)=> out.innerHTML = `<div>${escapeHTML(s)}</div>` + out.innerHTML;

  el.querySelector('#op_recal').addEventListener('click', ()=>{
    const nr = RecalibrateCred(w.Rubric);
    setState({ ...state, world: { ...w, Rubric: nr } });
    log('RecalibrateCred → non-observable criteria removed.');
  });

  el.querySelector('#op_lex').addEventListener('click', ()=>{
    const term = prompt('New glossary term to propose?');
    if (!term) return;
    const entry = LexiconExtend(w.Glossary, term.trim());
    setState({ ...state, world: { ...w } }); // glossary mutated (ok for demo)
    log(`LexiconExtend → added "${entry.term}" (review in ${entry.nextReviewWeeks} weeks).`);
  });

  el.querySelector('#op_equal').addEventListener('click', ()=>{
    const ok = EqualStanding(w.Tracks);
    log(ok ? 'EqualStanding ✓ Tracks meet equal-standing constraints.'
           : 'EqualStanding ✗ Tracks diverge on essential constraints.');
  });

  el.querySelector('#op_trc').addEventListener('click', ()=>{
    const truth = prompt('Truth (what happened)?') || '';
    const recognition = prompt('Recognition (acknowledgement)?') || '';
    const remedy = prompt('Remedy (owner/resources/date)?') || '';
    const reviewDate = prompt('Review date (YYYY-MM-DD)') || '';
    const entry = TRC_Mini(w.MetaCons.changeLog, {truth, recognition, remedy, reviewDate});
    setState({ ...state, world: { ...w } });
    log(`TRC_Mini → logged case ${entry.id.slice(0,8)} for review ${reviewDate || '(unspecified)'}.`);
  });
}

export function View_Metrics(el, state){
  const w = state.world;
  const a = state.agent;

  const allowed = ['text','empirical','lived','other'].reduce((acc,t)=>{
    // probe gate by fake claim
    const pass = w.Gates.evidence({type:t});
    acc[t] = pass;
    return acc;
  }, {});

  const passRate = state.claims.filter(c=> w.Gates.evidence(c)).length / state.claims.length;

  el.innerHTML = `
    <div class="card">
      <h2>Metrics Dashboard</h2>
    </div>

    <div class="row">
      <div class="kpi"><strong>ATCF (placeholder):</strong> ${a.ATCF?.score ?? 'n/a'}</div>
      <div class="kpi"><strong>Glossary size:</strong> ${w.Glossary.length}</div>
      <div class="kpi"><strong>Evidence pass rate:</strong> ${(passRate*100).toFixed(0)}%</div>
      <div class="kpi"><strong>Allowed evidence:</strong>
        ${Object.entries(allowed).map(([k,v])=>`<span class="pill">${k}: ${v?'<span class="ok">on</span>':'<span class="err">off</span>'}</span>`).join(' ')}
      </div>
    </div>
  `;
}

export function View_ChangeLog(el, state){
  const log = state.world.MetaCons.changeLog.slice().reverse();
  el.innerHTML = `
    <div class="card">
      <h2>Change-Log (Mini-TRC)</h2>
      ${log.length===0 ? '<p class="muted small">No entries yet.</p>' : ''}
      <div class="list">
        ${log.map(e=>`
          <div class="kpi">
            <div><strong>Case:</strong> ${e.id}</div>
            <div class="small"><strong>Date:</strong> ${new Date(e.createdAt).toLocaleString()}</div>
            ${e.truth?`<div><strong>Truth:</strong> ${escapeHTML(e.truth)}</div>`:''}
            ${e.recognition?`<div><strong>Recognition:</strong> ${escapeHTML(e.recognition)}</div>`:''}
            ${e.remedy?`<div><strong>Remedy:</strong> ${escapeHTML(e.remedy)}</div>`:''}
            ${e.reviewDate?`<div class="small"><strong>Review:</strong> ${escapeHTML(e.reviewDate)}</div>`:''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ——— helpers ———
function csvToList(s){ return s.split(',').map(x=>x.trim()).filter(Boolean); }
function renderRubric(r){
  return `<div class="list">` + r.map(row=>`
    <div class="kpi">
      <div><strong>${escapeHTML(row.label)}</strong></div>
      <div class="small">${row.criteria.map(c=>`<span class="pill">${escapeHTML(c.label)} ${c.observable?'✓':''}</span>`).join(' ')}</div>
    </div>
  `).join('') + `</div>`;
}
function isAllowed(world, type){
  try{ return world.Gates.evidence({type}); } catch{ return false; }
}
function escapeHTML(s=''){
  return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}
