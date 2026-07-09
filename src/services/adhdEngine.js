/**
 * ADHD Risk Prediction Engine
 * ===========================
 * Uses the REAL 2,000-patient CSV dataset (public/ADHD.csv) — not assumptions.
 *
 * Two modes:
 *  1. FAST (lookup tables)  — instant results using pre-computed rates from CSV
 *  2. LIVE (CSV scan)       — finds your actual similar patients from raw data
 *
 * Columns: Age, Gender, EducationStage, InattentionScore, HyperactivityScore,
 *          ImpulsivityScore, SymptomSum, Daydreaming, RSD, SleepHours,
 *          ScreenTimeHours, ComorbidAnxiety, ComorbidDepression,
 *          FamilyHistoryADHD, Medication, SchoolSupport, AcademicScore, ADHD
 */

// ─── PRE-COMPUTED LOOKUP TABLES (derived directly from ADHD.csv) ───────────
// These are the REAL diagnosis rates per score from 2,000 patients.
// Re-run the Python script if CSV changes.

export const INN_RISK = {0:26,1:40,2:52,3:54,4:67,5:75,6:80,7:85,8:94,9:100};
export const HYP_RISK = {0:36,1:47,2:56,3:67,4:74,5:82,6:86,7:86,8:96,9:67};
export const IMP_RISK = {0:46,1:47,2:55,3:67,4:73,5:79,6:81,7:89,8:100,9:100};
export const SUM_RISK = {
  2:8,3:0,4:6,5:17,6:20,7:32,8:43,9:58,10:71,
  11:85,12:90,13:95,14:91,15:93,16:96,17:95,18:100,19:100
};

// Academic score impact by symptom sum (real data)
export const ACADEMIC_BY_SUM = {
  2:89.6,3:86.0,4:85.5,5:82.3,6:81.7,7:80.1,8:79.0,9:78.1,
  10:77.6,11:76.0,12:74.6,13:74.4,14:73.5,15:71.4,16:72.4,17:69.6,18:70.6,19:66.8
};

// Population statistics
export const DATASET = {
  total:2000, adhdCount:1294, nonAdhdCount:706, adhdRate:64.7,
  adhd:{ inn:4.47,hyp:3.51,imp:3.44,academic:75.79,sleep:7.07,screen:4.19 },
  nonAdhd:{ inn:3.12,hyp:2.23,imp:2.36,academic:79.77,sleep:7.12,screen:4.27 },
  rsd:{ withRSD:67, withoutRSD:61 },
  family:{ withFamily:72, withoutFamily:62 },
  sleep:{ low:{ count:253,rate:70 }, normal:{ count:1364,rate:64 }, high:{ count:383,rate:63 } },
  medication:{
    Stimulant:{ count:462,adhdRate:66,avgAcademic:76.75 },
    'Non-stimulant':{ count:142,adhdRate:65,avgAcademic:77.71 },
    No:{ count:1396,adhdRate:64,avgAcademic:77.29 }
  },
};

// ─── LIVE CSV PARSER ────────────────────────────────────────────────────────
let _csvCache = null;

export async function loadCSV() {
  if (_csvCache) return _csvCache;
  const resp = await fetch('/ADHD.csv');
  const text = await resp.text();
  const lines = text.trim().split('\n');
  const headers = lines[0].replace(/\r/g,'').split(',');
  const rows = lines.slice(1).map(line => {
    const vals = line.replace(/\r/g,'').split(',');
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i]; });
    return obj;
  });
  _csvCache = rows;
  return rows;
}

/**
 * Find real patients from CSV similar to the user's profile.
 * Returns { count, adhdCount, rate, patients[] }
 */
/**
 * Find real patients from CSV similar to the user's profile.
 *
 * A sample of 10-12 patients giving "100%" is statistically meaningless —
 * one different patient would swing the rate by 8-10 points. We require
 * a minimum sample size (default 50) before treating the rate as
 * informative, widening the match tolerance until we reach it (capped
 * so we don't end up matching the entire dataset and calling it "similar").
 */
export async function findSimilarPatients(inn, hyp, imp, opts = {}) {
  const { minSample = 50, maxTolerance = 4 } = opts;
  const rows = await loadCSV();

  let tolerance = 1;
  let similar = [];
  while (tolerance <= maxTolerance) {
    similar = rows.filter(r =>
      Math.abs(parseInt(r.InattentionScore)   - inn) <= tolerance &&
      Math.abs(parseInt(r.HyperactivityScore) - hyp) <= tolerance &&
      Math.abs(parseInt(r.ImpulsivityScore)   - imp) <= tolerance
    );
    if (similar.length >= minSample) break;
    tolerance++;
  }

  const adhdCount = similar.filter(r => r.ADHD === '1').length;
  const confidence = similar.length >= 100 ? 'high' : similar.length >= minSample ? 'moderate' : 'low';

  return {
    count: similar.length,
    adhdCount,
    rate: similar.length ? Math.round(adhdCount / similar.length * 100) : null,
    patients: similar,
    tolerance,
    confidence,
    reachedMinSample: similar.length >= minSample,
  };
}

/**
 * Get real academic score for users with same symptom total from CSV.
 */
export async function getAcademicImpact(inn, hyp, imp, opts = {}) {
  const { minSample = 30, maxTolerance = 5 } = opts;
  const rows = await loadCSV();
  // Real SymptomSum in the CSV tops out around 19 — cap so we don't
  // search for a sum that doesn't meaningfully occur in the data.
  const symSum = Math.min(inn + hyp + imp, 19);

  let tolerance = 1;
  let similar = [];
  while (tolerance <= maxTolerance) {
    similar = rows.filter(r => Math.abs(parseInt(r.SymptomSum) - symSum) <= tolerance);
    if (similar.length >= minSample) break;
    tolerance++;
  }
  if (!similar.length) return null;

  const avgAcademic = similar.reduce((s,r) => s + parseFloat(r.AcademicScore), 0) / similar.length;
  const avgAll = 77.2;
  const confidence = similar.length >= 100 ? 'high' : similar.length >= minSample ? 'moderate' : 'low';

  return {
    yourGroupAvg: Math.round(avgAcademic * 10) / 10,
    populationAvg: avgAll,
    gap: Math.round((avgAll - avgAcademic) * 10) / 10,
    sampleSize: similar.length,
    symptomSum: symSum,
    confidence,
  };
}

/**
 * Get age-group stats from CSV matching user's education stage.
 */
export async function getAgeGroupStats(stage) {
  const rows = await loadCSV();
  const grp = rows.filter(r => r.EducationStage === stage);
  if (!grp.length) return null;
  const adhd = grp.filter(r => r.ADHD === '1');
  return {
    total: grp.length,
    adhdCount: adhd.length,
    rate: Math.round(adhd.length / grp.length * 100),
    avgAcademic: Math.round(grp.reduce((s,r)=>s+parseFloat(r.AcademicScore),0)/grp.length*10)/10,
  };
}

/**
 * Get medication breakdown from real CSV data.
 */
export async function getMedicationBreakdown() {
  const rows = await loadCSV();
  const meds = ['Stimulant','Non-stimulant','No'];
  return meds.map(med => {
    const grp = rows.filter(r => r.Medication === med);
    const adhd = grp.filter(r => r.ADHD === '1');
    return {
      medication: med,
      count: grp.length,
      adhdRate: Math.round(adhd.length / grp.length * 100),
      avgAcademic: Math.round(grp.reduce((s,r)=>s+parseFloat(r.AcademicScore),0)/grp.length*10)/10,
    };
  });
}

// ─── SCORING MODEL ──────────────────────────────────────────────────────────
/**
 * Calculate ADHD risk score from user answers.
 * Weighted blend: Inattention 45% · Hyperactivity 25% · Impulsivity 20% · SymptomSum 10%
 * Modifiers: RSD +2.5, FamilyHistory +4, LowSleep +2, Daydreaming −1
 */
export function calculateRisk(answers) {
  const inn = answers.inattention  ?? 4;
  const hyp = answers.hyperactivity ?? 4;
  const imp = answers.impulsivity   ?? 4;
  const symSum = Math.min(inn + hyp + imp, 19);

  const core =
    (INN_RISK[inn] ?? 50) * 0.45 +
    (HYP_RISK[hyp] ?? 50) * 0.25 +
    (IMP_RISK[imp] ?? 50) * 0.20 +
    (SUM_RISK[symSum] ?? 50) * 0.10;

  let mod = 0;
  if (answers.rsd)             mod += 2.5;
  if (answers.familyHistory)   mod += 4.0;
  if ((answers.sleepHours??7) < 6) mod += 2.0;
  if (answers.daydreaming)     mod -= 1.0;
  if (answers.anxiety)         mod -= 0.5;
  if (answers.depression)      mod += 0.3;

  return Math.min(99, Math.max(1, Math.round(core + mod)));
}

// ─── HELPERS ────────────────────────────────────────────────────────────────
export function getRiskLevel(score) {
  if (score >= 80) return { label:'Very High Risk', color:'#FF5C5C', bg:'#FFF0F0', emoji:'🔴', gradient:'linear-gradient(135deg,#B85C5C,#FF8F8F)' };
  if (score >= 70) return { label:'High Risk',      color:'#FF8C00', bg:'#FFF3E8', emoji:'🟠', gradient:'linear-gradient(135deg,#c47a00,#FFB347)' };
  if (score >= 60) return { label:'Moderate Risk',  color:'#F59E0B', bg:'#FFFBEB', emoji:'🟡', gradient:'linear-gradient(135deg,#b07800,#F59E0B)' };
  if (score >= 45) return { label:'Borderline',     color:'#6C5CE7', bg:'#F0EEFF', emoji:'🟣', gradient:'linear-gradient(135deg,#6C5CE7,#A29BFE)' };
  return               { label:'Low Risk',          color:'#00B37D', bg:'#E8F8F2', emoji:'🟢', gradient:'linear-gradient(135deg,#009468,#55D6A0)' };
}

export function getADHDType(inn, hyp) {
  if (inn > hyp + 2) return { type:'Primarily Inattentive', code:'ADHD-PI', desc:'Focus & attention are your main challenge' };
  if (hyp > inn + 2) return { type:'Primarily Hyperactive', code:'ADHD-PH', desc:'Restlessness & impulsivity are primary' };
  return { type:'Combined Type', code:'ADHD-C', desc:'Both inattention and hyperactivity elevated' };
}

export function getBreakdown(answers) {
  const inn = answers.inattention  ?? 4;
  const hyp = answers.hyperactivity ?? 4;
  const imp = answers.impulsivity   ?? 4;
  return [
    { label:'Inattention',   score:INN_RISK[inn]??50, weight:45, raw:inn, color:'#6C5CE7', description:`${INN_RISK[inn]}% of patients scoring ${inn} had ADHD` },
    { label:'Hyperactivity', score:HYP_RISK[hyp]??50, weight:25, raw:hyp, color:'#FF8C00', description:`${HYP_RISK[hyp]}% of patients scoring ${hyp} had ADHD` },
    { label:'Impulsivity',   score:IMP_RISK[imp]??50, weight:20, raw:imp, color:'#FF5C5C', description:`${IMP_RISK[imp]}% of patients scoring ${imp} had ADHD` },
  ];
}

export function predictedAcademic(inn, hyp, imp) {
  const s = Math.min(inn + hyp + imp, 19);
  return ACADEMIC_BY_SUM[s] ?? 77.2;
}
