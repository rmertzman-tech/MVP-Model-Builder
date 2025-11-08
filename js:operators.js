// operators.js — FAIM-QIRF operators

import { randomUUID } from './core.js';

// Remove non-observable criteria from rubric
export function RecalibrateCred(rubric){
  return rubric.map(ri => ({ ...ri, criteria: ri.criteria.filter(c => c.observable) }));
}

// Extend glossary with a new term proposal
export function LexiconExtend(glossary, term){
  const entry = {
    id: randomUUID(),
    term,
    by: 'student',
    date: new Date().toISOString(),
    nextReviewWeeks: 6
  };
  glossary.push(entry);
  return entry;
}

// Check tracks have equal standing (same essentials)
export function EqualStanding(tracks){
  const sameKeys = ['goals','evidenceReq','analysisReq','objectionReq'];
  const base = JSON.stringify(Object.fromEntries(sameKeys.map(k => [k, tracks[0][k]])));
  return tracks.every(t => JSON.stringify(Object.fromEntries(sameKeys.map(k => [k, t[k]]))) === base);
}

// Mini-TRC logging
export function TRC_Mini(log, {truth, recognition, remedy, reviewDate}){
  const entry = {
    id: randomUUID(),
    truth: truth || '',
    recognition: recognition || '',
    remedy: remedy || '',
    reviewDate: reviewDate || null,
    createdAt: Date.now()
  };
  log.push(entry);
  return entry;
}
