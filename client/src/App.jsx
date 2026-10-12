import AlexaAssistant from './AlexaAssistant';
import SimulatedInbox from './SimulatedInbox';
import { useState, useEffect } from 'react';

function App() {
  const [emailText, setEmailText] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [reminderModal, setReminderModal] = useState(null);
  const [draftingId, setDraftingId] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`);
      const data = await res.json();
      setTasks(Array.isArray(data.tasks) ? data.tasks : []);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleExtract = async () => {
    if (!emailText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/parse-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailText }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert('Backend error: ' + (data.details || data.error));
        return;
      }
      await fetchTasks();
      setEmailText('');
    } catch (err) {
      alert('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Delete ALL tasks? This cannot be undone.')) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, { method: 'DELETE' });
      await fetchTasks();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDraftReminder = async (taskId) => {
    setDraftingId(taskId);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/draft-reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert('Error: ' + (data.details || data.error));
        return;
      }
      setReminderModal({ taskId, taskTitle: data.taskTitle, draft: data.draft });
    } catch (err) {
      alert('Network error: ' + err.message);
    } finally {
      setDraftingId(null);
    }
  };

  const handleSendReminder = async () => {
    if (!reminderModal) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/send-reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: reminderModal.taskId,
          draft: reminderModal.draft,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert('Error: ' + (data.details || data.error));
        return;
      }
      alert(`✅ Reminder sent to ${data.to}`);
      setReminderModal(null);
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  };

  const statusColor = (s) => {
    const colors = {
      done: '#2e7d32',
      'in-progress': '#e65100',
      pending: '#616161',
    };
    return colors[s] || '#666';
  };

  const priorityColor = (p) =>
    ({ high: '#e53935', medium: '#fb8c00', low: '#43a047' }[p] || '#666');

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 20, fontFamily: 'system-ui' }}>
      <AlexaAssistant />

      <h1>AI Ops Copilot</h1>
      <p style={{ color: '#666' }}>Paste a messy client email — AI extracts the tasks.</p>

      <textarea
        value={emailText}
        onChange={(e) => setEmailText(e.target.value)}
        placeholder="Paste client email here..."
        style={{
          width: '100%',
          height: 160,
          padding: 12,
          fontSize: 14,
          fontFamily: 'monospace',
          border: '1px solid #ccc',
          borderRadius: 8,
          boxSizing: 'border-box',
        }}
      />

      <button
        onClick={handleExtract}
        disabled={loading || !emailText.trim()}
        style={{
          marginTop: 12,
          padding: '10px 20px',
          fontSize: 15,
          background: loading ? '#999' : '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: loading ? 'wait' : 'pointer',
        }}
      >
        {loading ? 'Extracting...' : 'Extract Tasks'}
      </button>

      <div style={{ marginTop: 30 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <h2 style={{ margin: 0 }}>Tasks ({tasks.length})</h2>
          {tasks.length > 0 && (
            <button
              onClick={handleClearAll}
              style={{
                padding: '6px 14px',
                fontSize: 13,
                background: '#fff',
                color: '#e53935',
                border: '1px solid #e53935',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              🗑️ Clear All
            </button>
          )}
        </div>

        {loadingTasks && <p style={{ color: '#999' }}>Loading tasks...</p>}

        {!loadingTasks && tasks.length === 0 && (
          <p style={{ color: '#999' }}>No tasks yet. Paste an email above to get started.</p>
        )}

        {tasks.map((t) => (
          <div
            key={t._id}
            style={{
              padding: 16,
              marginBottom: 10,
              border: '1px solid #eee',
              borderLeft: `4px solid ${priorityColor(t.priority)}`,
              borderRadius: 6,
              background: '#fafafa',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <strong>{t.title}</strong>
                <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                  {t.client} · Deadline: {t.deadline} · Priority: {t.priority} ·{' '}
                  <span style={{ color: statusColor(t.status), fontWeight: 600 }}>
                    Status: {t.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDraftReminder(t._id)}
                disabled={draftingId === t._id}
                style={{
                  padding: '6px 12px',
                  fontSize: 13,
                  background: draftingId === t._id ? '#ccc' : '#00b894',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: draftingId === t._id ? 'wait' : 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {draftingId === t._id ? 'Drafting...' : '📧 Remind'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <SimulatedInbox tasks={tasks} onStatusUpdated={fetchTasks} />

      {reminderModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setReminderModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 12,
              padding: 24,
              maxWidth: 600,
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              fontFamily: 'system-ui',
            }}
          >
            <h3 style={{ marginTop: 0 }}>📧 Reminder Draft</h3>
            <p style={{ fontSize: 13, color: '#666', margin: '0 0 12px 0' }}>
              <strong>Task:</strong> {reminderModal.taskTitle}
            </p>

            <div
              style={{
                padding: 16,
                background: '#f5f5f5',
                borderRadius: 8,
                fontSize: 14,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                marginBottom: 16,
              }}
            >
              {reminderModal.draft}
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setReminderModal(null)}
                style={{
                  padding: '10px 20px',
                  fontSize: 14,
                  background: '#eee',
                  color: '#333',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSendReminder}
                style={{
                  padding: '10px 20px',
                  fontSize: 14,
                  background: '#00b894',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Send Reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;