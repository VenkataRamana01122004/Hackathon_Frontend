// Tracks candidate progress across rounds so CandidateHome + the round
// pages themselves know what's locked. NO BACKEND IS CALLED YET — this is
// sessionStorage-backed so the whole flow works standalone; each function
// notes the real backend call in a comment for later.
//
// import axios from "axios";
// import config from "../../config";

const STORAGE_KEY = "candidateProgress_v1";

// Thresholds deciding when a round unlocks the next one.
export const BENCHMARK = {
  mcqMinPercent: 0.6, // 60%+ on the MCQ unlocks coding
  codingMinAttempted: 1, // attempting the coding assignment unlocks the interview
  // NOTE: AssignmentPanel.jsx currently only has ONE assignment (not a bank
  // of several), so "attempted" here just means "submitted the assignment".
};

function defaultProgress() {
  return {
    mcq: { completed: false, score: 0, total: 0, submittedAt: null },
    coding: { completed: false, attempted: 0, total: 0, submittedAt: null },
  };
}

export function getProgress() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultProgress(), ...JSON.parse(raw) };
  } catch {
    // ignore corrupt storage
  }
  return defaultProgress();

  // --- Backend equivalent ---
  // const token = sessionStorage.getItem("candidateToken");
  // const res = await axios.get(`${config.url}/api/candidate/progress`, {
  //   headers: { Authorization: `Bearer ${token}` },
  // });
  // return res.data;
}

function saveProgress(progress) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // sessionStorage unavailable — progress just won't persist across a refresh
  }
}

export function recordMcqResult({ score, total }) {
  const progress = getProgress();
  progress.mcq = { completed: true, score, total, submittedAt: Date.now() };
  saveProgress(progress);

  // Printed for now so it's obvious what payload a real backend endpoint
  // would receive — remove once /api/interview/submitbitsassessment (or an
  // equivalent progress-tracking endpoint) is actually wired up.
  console.log("[progress] MCQ round recorded:", progress.mcq);

  return progress;

  // --- Backend equivalent ---
  // const token = sessionStorage.getItem("candidateToken");
  // await axios.post(`${config.url}/api/candidate/mcq/result`, { score, total }, {
  //   headers: { Authorization: `Bearer ${token}` },
  // });
}

export function recordCodingResult({ attempted, total }) {
  const progress = getProgress();
  progress.coding = { completed: true, attempted, total, submittedAt: Date.now() };
  saveProgress(progress);

  console.log("[progress] Coding round recorded:", progress.coding);

  return progress;

  // --- Backend equivalent ---
  // const token = sessionStorage.getItem("candidateToken");
  // await axios.post(`${config.url}/api/candidate/coding/result`, { attempted, total }, {
  //   headers: { Authorization: `Bearer ${token}` },
  // });
}

// Each round is a strict prerequisite for the next: MCQ -> coding -> AI
// interview. A completed-but-failed round locks everything after it.
export function getRoundLocks(progress) {
  const mcq = progress.mcq;
  const coding = progress.coding;

  const mcqPassed = mcq.completed && mcq.total > 0 && mcq.score / mcq.total >= BENCHMARK.mcqMinPercent;
  const codingPassed = coding.completed && coding.attempted >= BENCHMARK.codingMinAttempted;

  const codingLock = !mcq.completed
    ? { locked: true, reason: "not_started" }
    : !mcqPassed
      ? { locked: true, reason: "below_benchmark" }
      : { locked: false, reason: null };

  const interviewLock = !coding.completed
    ? { locked: true, reason: "not_started" }
    : !codingPassed
      ? { locked: true, reason: "below_benchmark" }
      : { locked: false, reason: null };

  return {
    mcq: { locked: false, reason: null },
    coding: codingLock,
    interview: interviewLock,
  };
}
