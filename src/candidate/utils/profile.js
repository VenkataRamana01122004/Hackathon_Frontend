// Stores the candidate's intake form (name, mobile, resume, experience)
// captured by SubmissionForm.jsx before the MCQ round.
//
// import axios from "axios";
// import config from "../../config";

const STORAGE_KEY = "candidateProfile_v1";

export function getProfile() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupt storage
  }
  return null;

  // --- Backend equivalent ---
  // const token = sessionStorage.getItem("candidateToken");
  // const res = await axios.get(`${config.url}/api/candidate/profile`, {
  //   headers: { Authorization: `Bearer ${token}` },
  // });
  // return res.data;
}

export function hasSubmittedProfile() {
  return getProfile() !== null;
}

export function saveProfile({ name, mobile, resumeFileName, resumeText, experience }) {
  const profile = {
    name,
    mobile,
    resumeFileName: resumeFileName || null,
    resumeText,
    experience,
    submittedAt: new Date().toISOString(),
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // sessionStorage unavailable — form still "submits" for this page view
  }

  // Printed on submission so the exact payload shape is visible for
  // verification now, and as a reference for whoever wires up the real
  // endpoint later.
  console.log("[candidate submission] Profile form submitted:", profile);

  return profile;

  // --- Backend equivalent ---
  // const token = sessionStorage.getItem("candidateToken");
  // const formData = new FormData();
  // formData.append("name", name);
  // formData.append("mobile", mobile);
  // formData.append("resume_text", resumeText);
  // formData.append("experience", experience);
  // if (resumeFile) formData.append("resume_file", resumeFile); // actual File object
  // const res = await axios.post(`${config.url}/api/candidate/profile`, formData, {
  //   headers: {
  //     Authorization: `Bearer ${token}`,
  //     "Content-Type": "multipart/form-data",
  //   },
  // });
  // return res.data;
}
