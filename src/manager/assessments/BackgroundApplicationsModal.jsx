
import { useEffect, useState } from "react";
import axios from "axios";

function BackgroundApplicationsModal({ candidateId, close }) {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `http://localhost:5000/api/manager/background-process/${candidateId}`
        );

        const logs = response.data.data || [];

        // Combine process names from all saved snapshots.
        const allProcesses = logs.flatMap((log) =>
          Array.isArray(log.processes) ? log.processes : []
        );

        setProcesses([...new Set(allProcesses)]);
      } catch (err) {
        console.error("Error loading background applications:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load background applications."
        );
      } finally {
        setLoading(false);
      }
    };

    if (candidateId != null) {
      fetchProcesses();
    }
  }, [candidateId]);

  return (
    <div style={styles.overlay} onClick={close}>
      <div
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.header}>
          <div>
            <h2 style={{ margin: 0 }}>Background Applications</h2>
            <p style={{ margin: "6px 0 0", color: "#64748b" }}>
              Candidate ID: {candidateId}
            </p>
          </div>

          <button style={styles.closeButton} onClick={close}>
            ✕
          </button>
        </div>

        <div style={styles.summary}>
          Total unique processes: <strong>{processes.length}</strong>
        </div>

        <div style={styles.list}>
          {loading ? (
            <p>Loading background applications...</p>
          ) : error ? (
            <p style={{ color: "#dc2626" }}>{error}</p>
          ) : processes.length === 0 ? (
            <p>No background applications found for this candidate.</p>
          ) : (
            processes.map((process, index) => (
              <div key={`${process}-${index}`} style={styles.item}>
                <span style={styles.number}>{index + 1}</span>
                <span style={styles.processName}>{process}</span>
              </div>
            ))
          )}
        </div>

        <div style={styles.footer}>
          <button style={styles.doneButton} onClick={close}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.65)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: 20,
  },
  modal: {
    width: "100%",
    maxWidth: 650,
    maxHeight: "85vh",
    background: "#fff",
    borderRadius: 14,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  },
  header: {
    padding: 22,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid #e2e8f0",
  },
  closeButton: {
    border: "none",
    background: "#f1f5f9",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: 16,
  },
  summary: {
    padding: "14px 22px",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    color: "#334155",
  },
  list: {
    padding: 20,
    overflowY: "auto",
    minHeight: 150,
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "11px 12px",
    borderBottom: "1px solid #e2e8f0",
  },
  number: {
    minWidth: 28,
    height: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eff6ff",
    color: "#2563eb",
    borderRadius: 7,
    fontSize: 12,
    fontWeight: 700,
  },
  processName: {
    color: "#1e293b",
    overflowWrap: "anywhere",
  },
  footer: {
    padding: 16,
    display: "flex",
    justifyContent: "flex-end",
    borderTop: "1px solid #e2e8f0",
  },
  doneButton: {
    padding: "10px 20px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
};

export default BackgroundApplicationsModal;
