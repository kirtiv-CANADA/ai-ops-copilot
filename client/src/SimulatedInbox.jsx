import { useState } from 'react';

function SimulatedInbox({ tasks, onStatusUpdated }) {
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [replyText, setReplyText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!selectedTaskId || !replyText.trim()) return;
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/parse-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: selectedTaskId, replyText }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert('Error: ' + (data.details || data.error));
        return;
      }
      setAnalysis(data);
    } catch (err) {
      alert('Network error: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!analysis || !selectedTaskId) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${selectedTaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: analysis.suggestedStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert('Error: ' + (data.details || data.error));
        return;
      }
      alert(`✅ Status updated to "${analysis.suggestedStatus}"`);
      setAnalysis(null);
      setReplyText('');
      setSelectedTaskId('');
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  };

  const statusBadge = (status) => {
    const colors = {
      done: { bg: '#e8f5e9', color: '#2e7d32' },
      'in-progress': { bg: '#fff3e0', color: '#e65100' },
      pending: { bg: '#f5f5f5', color: '#616161' },
    };
    const c = colors[status] || colors.pending;
    return (
      <span
        style={{
          padding: '3px 10px',
          background: c.bg,
          color: c.color,
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <div
      style={{
        marginTop: 30,
        padding: 24,
        background: '#f0f4f8',
        borderRadius: 12,
        border: '1px solid #d0dce8',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 22 }}>📥</span>
        <h2 style={{ margin: 0, fontSize: 20 }}>Simulated Inbox</h2>
        <span
          style={{
            fontSize: 11,
            padding: '3px 8px',
            background: '#1976d2',
            color: 'white',
            borderRadius: 10,
            marginLeft: 'auto',
          }}
        >
          AI-powered
        </span>
      </div>

      <p style={{ fontSize: 13, color: '#666', marginTop: 0 }}>
        Paste a client reply and AI will detect the intent and suggest a status update.
      </p>

      <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
        Which task is this reply about?
      </label>
      <select
        value={selectedTaskId}
        onChange={(e) => setSelectedTaskId(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          fontSize: 14,
          border: '1px solid #ccc',
          borderRadius: 6,
          marginBottom: 12,
          background: 'white',
        }}
      >
        <option value="">-- Select a task --</option>
        {tasks.map((t) => (
          <option key={t._id} value={t._id}>
            {t.title} ({t.client}) · {t.status}
          </option>
        ))}
      </select>

      <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
        Paste the client's reply:
      </label>
      <textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder='e.g., "Thanks, I just finished it and sent it over."'
        style={{
          width: '100%',
          height: 100,
          padding: 12,
          fontSize: 14,
          fontFamily: 'system-ui',
          border: '1px solid #ccc',
          borderRadius: 6,
          boxSizing: 'border-box',
          marginBottom: 12,
          resize: 'vertical',
        }}
      />

      <button
        onClick={handleAnalyze}
        disabled={analyzing || !selectedTaskId || !replyText.trim()}
        style={{
          padding: '10px 20px',
          fontSize: 14,
          background: analyzing ? '#999' : '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: analyzing ? 'wait' : 'pointer',
          fontWeight: 600,
        }}
      >
        {analyzing ? 'Analyzing...' : '🔍 Analyze Reply'}
      </button>

      {analysis && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            background: 'white',
            borderRadius: 8,
            border: '1px solid #d0dce8',
          }}
        >
          <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
            🤖 AI Analysis:
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#666' }}>Current:</span>
            {statusBadge(analysis.currentStatus)}
            <span style={{ fontSize: 16 }}>→</span>
            <span style={{ fontSize: 13, color: '#666' }}>Suggested:</span>
            {statusBadge(analysis.suggestedStatus)}
          </div>

          <div
            style={{
              fontSize: 13,
              color: '#555',
              padding: 10,
              background: '#f9f9f9',
              borderRadius: 6,
              marginBottom: 12,
            }}
          >
            <strong>Reasoning:</strong> {analysis.reasoning}
            <br />
            <strong>Confidence:</strong> {analysis.confidence}
          </div>

          <button
            onClick={handleUpdateStatus}
            style={{
              padding: '10px 20px',
              fontSize: 14,
              background: '#2e7d32',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            ✅ Update Status to "{analysis.suggestedStatus}"
          </button>
        </div>
      )}
    </div>
  );
}

export default SimulatedInbox;