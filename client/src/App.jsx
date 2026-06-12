import { useEffect, useState } from 'react';

const STATUS_OPTIONS = ['new', 'contacted', 'converted'];

function App() {
  const [token, setToken] = useState(localStorage.getItem('crmToken') || '');
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [leadForm, setLeadForm] = useState({ name: '', email: '', source: 'Website Contact Form', company: '', phone: '' });
  const [noteText, setNoteText] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      fetchLeads();
    }
  }, [token]);

  const fetchLeads = async () => {
    const res = await fetch('/api/leads', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setLeads(data);
      setMessage('');
    } else {
      setMessage('Unable to load leads. Please log in again.');
      setToken('');
      localStorage.removeItem('crmToken');
    }
  };

  const handleLogin = async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm),
    });
    if (res.ok) {
      const data = await res.json();
      setToken(data.token);
      localStorage.setItem('crmToken', data.token);
      setLoginForm({ username: '', password: '' });
      setMessage('Logged in successfully');
    } else {
      setMessage('Login failed: check username/password');
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('crmToken');
    setLeads([]);
    setSelectedLead(null);
    setMessage('Logged out');
  };

  const submitLead = async () => {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadForm),
    });
    if (res.ok) {
      setMessage('Lead created successfully');
      setLeadForm({ name: '', email: '', source: 'Website Contact Form', company: '', phone: '' });
      if (token) fetchLeads();
    } else {
      setMessage('Failed to create lead');
    }
  };

  const selectLead = (lead) => {
    setSelectedLead(lead);
    setNoteText('');
  };

  const updateLead = async (updates) => {
    if (!selectedLead) return;
    const res = await fetch(`/api/leads/${selectedLead._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const updated = await res.json();
      setSelectedLead(updated);
      setLeads((current) => current.map((lead) => (lead._id === updated._id ? updated : lead)));
      setMessage('Lead updated');
    } else {
      setMessage('Failed to update lead');
    }
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    await updateLead({ note: noteText });
    setNoteText('');
  };

  const updateStatus = async (status) => {
    await updateLead({ status });
  };

  return (
    <div className="app-shell">
      <header>
        <h1>CRM Lead Manager</h1>
        {token && <button className="logout" onClick={handleLogout}>Logout</button>}
      </header>

      <section className="content">
        <div className="panel panel-left">
          <div className="card">
            <h2>Admin Login</h2>
            {!token ? (
              <>
                <label>Username</label>
                <input value={loginForm.username} onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })} />
                <label>Password</label>
                <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
                <button onClick={handleLogin}>Sign In</button>
              </>
            ) : (
              <p>Welcome. Your admin session is active.</p>
            )}
          </div>

          <div className="card">
            <h2>Website Contact Form</h2>
            <p>Submit a lead just like a website visitor.</p>
            <label>Name</label>
            <input value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} />
            <label>Email</label>
            <input value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} />
            <label>Company</label>
            <input value={leadForm.company} onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })} />
            <label>Phone</label>
            <input value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} />
            <button onClick={submitLead}>Submit Lead</button>
          </div>
        </div>

        <div className="panel panel-right">
          <div className="card card-leads">
            <h2>Lead List</h2>
            {token ? (
              <div className="lead-list">
                {leads.map((lead) => (
                  <button
                    key={lead._id}
                    className={selectedLead?._id === lead._id ? 'lead-item selected' : 'lead-item'}
                    onClick={() => selectLead(lead)}
                  >
                    <span>{lead.name}</span>
                    <small>{lead.email}</small>
                    <strong>{lead.status}</strong>
                  </button>
                ))}
                {!leads.length && <p>No leads yet. Add one via the form.</p>}
              </div>
            ) : (
              <p>Please log in to view lead management.</p>
            )}
          </div>

          {selectedLead && token && (
            <div className="card card-detail">
              <h2>Lead Details</h2>
              <p><strong>Name:</strong> {selectedLead.name}</p>
              <p><strong>Email:</strong> {selectedLead.email}</p>
              <p><strong>Company:</strong> {selectedLead.company || '—'}</p>
              <p><strong>Phone:</strong> {selectedLead.phone || '—'}</p>
              <p><strong>Source:</strong> {selectedLead.source}</p>
              <div className="status-buttons">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    className={selectedLead.status === status ? 'active' : ''}
                    onClick={() => updateStatus(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="notes">
                <h3>Notes</h3>
                {selectedLead.notes.length ? (
                  selectedLead.notes.map((note, index) => (
                    <div key={index} className="note-item">
                      <span>{new Date(note.createdAt).toLocaleString()}</span>
                      <p>{note.text}</p>
                    </div>
                  ))
                ) : (
                  <p>No notes added yet.</p>
                )}
                <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add follow-up note..." />
                <button onClick={addNote}>Save Note</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {message && <div className="toast">{message}</div>}
    </div>
  );
}

export default App;
