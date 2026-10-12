import { useState } from 'react';

function AlexaAssistant() {
  const [command, setCommand] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  // Voice input via Web Speech API
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setCommand(transcript);
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const askAlexa = async () => {
    if (!command.trim()) return;
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/mcp/parse-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailText: command }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setCommand('');
    setResponse(null);
  };

  return (
    <div
      style={{
        maxWidth: 800,
        margin: '0 auto 30px',
        padding: 24,
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        borderRadius: 12,
        color: 'white',
        fontFamily: 'system-ui',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 28 }}>🤖</span>
        <h2 style={{ margin: 0, fontSize: 22 }}>Alexa+ Assistant</h2>
        <span
          style={{
            fontSize: 11,
            padding: '3px 8px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 10,
            marginLeft: 'auto',
          }}
        >
          MCP-powered
        </span>
      </div>

      <p style={{ fontSize: 13, opacity: 0.85, marginTop: 0 }}>
        Type or speak a command. Alexa+ will call the MCP server to process it.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && askAlexa()}
          placeholder='e.g., "Extract tasks from: Hi, send report by Friday. Thanks, Sam"'
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: 14,
            border: 'none',
            borderRadius: 8,
            outline: 'none',
          }}
        />
        <button
          onClick={startListening}
          title="Voice input"
          style={{
            padding: '12px 16px',
            fontSize: 18,
            background: listening ? '#e53935' : 'white',
            color: listening ? 'white' : '#1e3c72',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          {listening ? '🔴' : '🎤'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={askAlexa}
          disabled={loading || !command.trim()}
          style={{
            flex: 1,
            padding: '12px 20px',
            fontSize: 15,
            fontWeight: 600,
            background: loading ? '#666' : '#00d4aa',
            color: loading ? 'white' : '#003b2e',
            border: 'none',
            borderRadius: 8,
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          {loading ? 'Alexa is thinking...' : '🗣️ Ask Alexa'}
        </button>
        {(command || response) && (
          <button
            onClick={clearAll}
            style={{
              padding: '12px 20px',
              fontSize: 15,
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        )}
      </div>

      {response && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 8,
            fontSize: 14,
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
            Alexa+ response (source: {response.source || 'error'}):
          </div>
          {response.error && (
            <p style={{ color: '#ff8a80', margin: 0 }}>❌ {response.error}</p>
          )}
          {response.tasks && (
            <div>
              <p style={{ margin: '0 0 8px 0' }}>
                ✅ Found {response.tasks.length} task{response.tasks.length !== 1 ? 's' : ''}:
              </p>
              {response.tasks.map((t, i) => (
                <div
                  key={i}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(0,0,0,0.15)',
                    borderRadius: 6,
                    marginBottom: 6,
                    fontSize: 13,
                  }}
                >
                  <strong>{t.title}</strong>
                  <span style={{ opacity: 0.75 }}>
                    {' '}
                    — {t.client} · {t.deadline} · {t.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AlexaAssistant;