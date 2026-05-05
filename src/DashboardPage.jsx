import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users, Briefcase, MessageSquare, LogOut,
  Search, RefreshCw, Filter, Trash2,
  PlusCircle, CheckCircle, XCircle, FileText,
  ChevronDown, ChevronUp, Eye
} from 'lucide-react';
import { db, auth } from './firebase';
import {
  collection, getDocs, deleteDoc, doc,
  query, orderBy, addDoc, updateDoc,
  serverTimestamp, where
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import StatusBadge from './portal/components/StatusBadge';
import CommentThread from './portal/components/CommentThread';

// ── helpers ──────────────────────────────────────────────────────────────────
function generateInvoiceId() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  return `INV-${ymd}-${Math.floor(1000+Math.random()*9000)}`;
}

// ── Leads sub-panel (existing) ───────────────────────────────────────────────
function LeadsPanel({ activeTab }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'leads'), orderBy('Timestamp', 'desc'));
      const snap = await getDocs(q);
      setData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    await deleteDoc(doc(db, 'leads', id));
    fetchData();
  };

  const filtered = data.filter(row => {
    const tabMatch =
      activeTab === 'influencers' ? row.Type === 'influencer' :
      activeTab === 'brands'      ? row.Type === 'brand' :
                                    row.Type === 'Contact Enquiry';
    if (!tabMatch) return false;
    if (!searchTerm) return true;
    return row.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           row.Email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <>
      <div className="header-actions">
        <div className="search-box">
          <Search size={18}/>
          <input type="text" placeholder="Search…" value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <button className="refresh-btn" onClick={fetchData} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'spinning' : ''} />
        </button>
      </div>
      {loading ? (
        <div className="dash-loader"><div className="spinner"/><p>Loading…</p></div>
      ) : filtered.length === 0 ? (
        <div className="dash-empty"><Filter size={48}/><h3>No {activeTab} found</h3></div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead><tr><th>Date</th><th>Name/Info</th><th>Details</th><th>Message</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={i}>
                  <td><div>{row.Date?.split(',')[0]}</div></td>
                  <td><div className="row-name">{row.Name}</div><div className="row-email">{row.Email}</div><div className="row-phone">{row.Phone}</div></td>
                  <td>
                    {row.Type === 'influencer' ? (
                      <div className="platform-tags">
                        {row.YT_Name !== 'N/A' && <a href={row.YT_Link} target="_blank" rel="noreferrer" className="tag yt">YT: {row.YT_Subs}</a>}
                        {row.IG_Handle !== 'N/A' && <a href={row.IG_Link} target="_blank" rel="noreferrer" className="tag ig">IG: {row.IG_Followers}</a>}
                      </div>
                    ) : row.Type === 'brand' ? (
                      <div className="brand-meta"><div className="row-company">{row.Company}</div></div>
                    ) : (
                      <span className="tag service">{row.Niche_Website}</span>
                    )}
                  </td>
                  <td><div className="msg-full">{row.Message}</div></td>
                  <td>
                    <div style={{display:'flex',gap:'0.5rem'}}>
                      <button className="row-view-btn" onClick={() => setSelectedRow(row)}><Search size={18}/></button>
                      <button className="row-delete-btn" onClick={() => handleDelete(row.id)}><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selectedRow && (
        <div className="dash-modal-overlay" onClick={() => setSelectedRow(null)}>
          <div className="dash-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h2>Full Details</h2>
              <button className="close-btn" onClick={() => setSelectedRow(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <label>Basic Information</label>
                <div className="detail-grid">
                  <div className="detail-item"><span>Name:</span> {selectedRow.Name}</div>
                  <div className="detail-item"><span>Email:</span> {selectedRow.Email}</div>
                  <div className="detail-item"><span>Phone:</span> {selectedRow.Phone}</div>
                  <div className="detail-item"><span>Date:</span> {selectedRow.Date}</div>
                </div>
              </div>
              
              {selectedRow.Type === 'influencer' && (
                <div className="detail-section">
                  <label>Platform Details</label>
                  <div className="detail-grid">
                    {selectedRow.YT_Name && selectedRow.YT_Name !== 'N/A' && (
                      <div className="detail-item" style={{gridColumn: '1 / -1'}}>
                        <span>YouTube:</span> {selectedRow.YT_Name} ({selectedRow.YT_Subs} Subs) - <a href={selectedRow.YT_Link} target="_blank" rel="noreferrer" style={{color:'var(--accent)'}}>View Channel</a>
                      </div>
                    )}
                    {selectedRow.IG_Handle && selectedRow.IG_Handle !== 'N/A' && (
                      <div className="detail-item" style={{gridColumn: '1 / -1'}}>
                        <span>Instagram:</span> {selectedRow.IG_Handle} ({selectedRow.IG_Followers} Followers) - <a href={selectedRow.IG_Link} target="_blank" rel="noreferrer" style={{color:'var(--accent)'}}>View Profile</a>
                      </div>
                    )}
                    {selectedRow.FB_Link && selectedRow.FB_Link !== 'N/A' && (
                      <div className="detail-item" style={{gridColumn: '1 / -1'}}>
                        <span>Facebook:</span> <a href={selectedRow.FB_Link} target="_blank" rel="noreferrer" style={{color:'var(--accent)'}}>View Profile</a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedRow.Type === 'brand' && selectedRow.Company && (
                <div className="detail-section">
                  <label>Brand Details</label>
                  <div className="detail-grid">
                    <div className="detail-item" style={{gridColumn: '1 / -1'}}><span>Company Name:</span> {selectedRow.Company}</div>
                  </div>
                </div>
              )}

              {selectedRow.Type === 'Contact Enquiry' && selectedRow.Niche_Website && (
                <div className="detail-section">
                  <label>Enquiry Details</label>
                  <div className="detail-grid">
                    <div className="detail-item" style={{gridColumn: '1 / -1'}}><span>Website/Niche:</span> {selectedRow.Niche_Website}</div>
                  </div>
                </div>
              )}

              <div className="detail-section"><label>Message</label>
                <div className="message-box">{selectedRow.Message}</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-close-modal" onClick={() => setSelectedRow(null)}>Close</button>
              <a href={`https://wa.me/${selectedRow.Phone?.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="btn-wa-direct">WhatsApp</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Creators sub-panel ────────────────────────────────────────────────────────
function CreatorsPanel() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', phone:'', platform:'', paymentDetails:'', password:'' });
  const [saving, setSaving] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [updating, setUpdating] = useState(false);

  const handleUpdateCreator = async () => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'portal_creators', selectedCreator.id), {
        name: selectedCreator.name || '',
        phone: selectedCreator.phone || '',
        platform: selectedCreator.platform || '',
        paymentDetails: selectedCreator.paymentDetails || ''
      });
      setCreators(prev => prev.map(c => c.id === selectedCreator.id ? selectedCreator : c));
      alert('Creator details updated successfully!');
      setSelectedCreator(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const fetchCreators = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'portal_creators'));
    setCreators(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchCreators(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(cred.user, { displayName: form.name });
      await addDoc(collection(db, 'portal_creators'), {
        uid: cred.user.uid,
        name: form.name, email: form.email,
        phone: form.phone, platform: form.platform,
        paymentDetails: form.paymentDetails,
        createdAt: serverTimestamp(),
      });
      setShowForm(false);
      setForm({ name:'', email:'', phone:'', platform:'', paymentDetails:'', password:'' });
      fetchCreators();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
        <h2 style={{color:'var(--dash-text)',margin:0}}>Creator Accounts</h2>
        <button className="portal-btn portal-btn--primary" onClick={() => setShowForm(!showForm)}>
          <PlusCircle size={16}/> {showForm ? 'Cancel' : 'New Creator'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="admin-form-card">
          <h3>Create Creator Account</h3>
          <div className="admin-form-grid">
            {[['name','Full Name','text'],['email','Email','email'],['phone','Phone','tel'],['platform','Platform (YT/IG/etc.)','text'],['paymentDetails','UPI / Bank Details','text'],['password','Temporary Password','password']].map(([n,l,t]) => (
              <div className="portal-field" key={n}>
                <label>{l}</label>
                <input type={t} value={form[n]} required
                  onChange={e => setForm(p => ({...p,[n]:e.target.value}))} />
              </div>
            ))}
          </div>
          <button type="submit" className="portal-btn portal-btn--primary" disabled={saving}>
            {saving ? 'Creating…' : 'Create Account'}
          </button>
        </form>
      )}

      {loading ? <div className="dash-loader"><div className="spinner"/></div> : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Platform</th><th>Action</th></tr></thead>
            <tbody>
              {creators.map(c => (
                <tr key={c.id}>
                  <td><div className="row-name">{c.name}</div></td>
                  <td><div className="row-email">{c.email}</div></td>
                  <td><div className="row-phone">{c.phone || '—'}</div></td>
                  <td><div>{c.platform || '—'}</div></td>
                  <td>
                    <button className="row-view-btn" onClick={() => setSelectedCreator(c)} title="View Details"><Search size={18}/></button>
                  </td>
                </tr>
              ))}
              {creators.length === 0 && <tr><td colSpan={5} style={{textAlign:'center',padding:'2rem',color:'var(--dash-muted)'}}>No creators yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* View Creator Modal */}
      {selectedCreator && (
        <div className="dash-modal-overlay" onClick={() => setSelectedCreator(null)}>
          <div className="dash-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h2>Edit Creator Profile</h2>
              <button className="close-btn" onClick={() => setSelectedCreator(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <label>Basic Information</label>
                <div className="admin-form-grid" style={{marginTop: '1rem'}}>
                  <div className="portal-field">
                    <label>Name</label>
                    <input type="text" value={selectedCreator.name || ''} onChange={e => setSelectedCreator({...selectedCreator, name: e.target.value})} />
                  </div>
                  <div className="portal-field">
                    <label>Email (Cannot Edit)</label>
                    <input type="email" value={selectedCreator.email || ''} disabled style={{opacity: 0.5}} />
                  </div>
                  <div className="portal-field">
                    <label>Phone</label>
                    <input type="tel" value={selectedCreator.phone || ''} onChange={e => setSelectedCreator({...selectedCreator, phone: e.target.value})} placeholder="+91..." />
                  </div>
                  <div className="portal-field">
                    <label>Platform (e.g. YouTube, Instagram)</label>
                    <input type="text" value={selectedCreator.platform || ''} onChange={e => setSelectedCreator({...selectedCreator, platform: e.target.value})} placeholder="Instagram" />
                  </div>
                </div>
              </div>
              <div className="detail-section">
                <label>Payment Information</label>
                <div className="portal-field" style={{marginTop: '1rem'}}>
                  <textarea 
                    rows="3" 
                    value={selectedCreator.paymentDetails || ''} 
                    onChange={e => setSelectedCreator({...selectedCreator, paymentDetails: e.target.value})}
                    placeholder="Bank details or UPI..."
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{display:'flex', gap:'1rem'}}>
              <button className="portal-btn portal-btn--primary" onClick={handleUpdateCreator} disabled={updating}>
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
              <button className="btn-close-modal" onClick={() => setSelectedCreator(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Deals sub-panel ───────────────────────────────────────────────────────────
function DealsPanel() {
  const [deals, setDeals] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:'', creatorId:'', deliverables:'', amount:'', platform:'', deadline:'' });
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const [dsnap, csnap] = await Promise.all([
      getDocs(query(collection(db, 'portal_deals'), orderBy('createdAt','desc'))),
      getDocs(collection(db, 'portal_creators')),
    ]);
    setDeals(dsnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setCreators(csnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const creator = creators.find(c => c.id === form.creatorId);
      await addDoc(collection(db, 'portal_deals'), {
        ...form,
        creatorName: creator?.name || '',
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setShowForm(false);
      setForm({ title:'', creatorId:'', deliverables:'', amount:'', platform:'', deadline:'' });
      fetchAll();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this deal?')) return;
    await deleteDoc(doc(db, 'portal_deals', id));
    fetchAll();
  };

  const PLATFORMS = ['Instagram','YouTube','Facebook','Twitter/X','LinkedIn','Other'];

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
        <h2 style={{color:'var(--dash-text)',margin:0}}>Deals</h2>
        <button className="portal-btn portal-btn--primary" onClick={() => setShowForm(!showForm)}>
          <PlusCircle size={16}/> {showForm ? 'Cancel' : 'New Deal'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="admin-form-card">
          <h3>Create New Deal</h3>
          <div className="admin-form-grid">
            <div className="portal-field"><label>Deal Title *</label>
              <input type="text" value={form.title} required onChange={e => setForm(p=>({...p,title:e.target.value}))} />
            </div>
            <div className="portal-field"><label>Assign Creator *</label>
              <select value={form.creatorId} required onChange={e => setForm(p=>({...p,creatorId:e.target.value}))}>
                <option value="">Select creator…</option>
                {creators.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="portal-field"><label>Platform</label>
              <select value={form.platform} onChange={e => setForm(p=>({...p,platform:e.target.value}))}>
                <option value="">Select…</option>
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="portal-field"><label>Amount (₹) *</label>
              <input type="number" value={form.amount} required onChange={e => setForm(p=>({...p,amount:e.target.value}))} />
            </div>
            <div className="portal-field"><label>Deadline</label>
              <input type="date" value={form.deadline} onChange={e => setForm(p=>({...p,deadline:e.target.value}))} />
            </div>
            <div className="portal-field" style={{gridColumn:'1/-1'}}><label>Deliverables</label>
              <textarea rows={3} value={form.deliverables} onChange={e => setForm(p=>({...p,deliverables:e.target.value}))} />
            </div>
          </div>
          <button type="submit" className="portal-btn portal-btn--primary" disabled={saving}>
            {saving ? 'Creating…' : 'Create Deal'}
          </button>
        </form>
      )}

      {loading ? <div className="dash-loader"><div className="spinner"/></div> : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead><tr><th>Title</th><th>Creator</th><th>Platform</th><th>Amount</th><th>Deadline</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {deals.map(d => (
                <tr key={d.id}>
                  <td><div className="row-name">{d.title}</div></td>
                  <td><div>{d.creatorName}</div></td>
                  <td><div>{d.platform || '—'}</div></td>
                  <td><div>₹{Number(d.amount||0).toLocaleString('en-IN')}</div></td>
                  <td><div>{d.deadline || '—'}</div></td>
                  <td><StatusBadge status={d.status}/></td>
                  <td><button className="row-delete-btn" onClick={() => handleDelete(d.id)}><Trash2 size={16}/></button></td>
                </tr>
              ))}
              {deals.length === 0 && <tr><td colSpan={7} style={{textAlign:'center',padding:'2rem',color:'var(--dash-muted)'}}>No deals yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Submissions sub-panel ────────────────────────────────────────────────────
function SubmissionsPanel() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  const fetchSubs = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, 'portal_submissions'), orderBy('submittedAt','desc')));
    setSubs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchSubs(); }, []);

  const handleApprove = async (sub) => {
    // 1. Update submission
    await updateDoc(doc(db, 'portal_submissions', sub.id), { status: 'approved', reviewedAt: serverTimestamp() });
    // 2. Update deal
    await updateDoc(doc(db, 'portal_deals', sub.dealId), { status: 'payment_review', updatedAt: serverTimestamp() });
    // 3. Auto-generate invoice
    const invId = generateInvoiceId();
    await addDoc(collection(db, 'portal_invoices'), {
      invoiceId: invId,
      dealId: sub.dealId,
      dealTitle: sub.dealTitle,
      creatorId: sub.creatorId,
      creatorName: sub.creatorName,
      creatorEmail: sub.creatorEmail || '',
      creatorPhone: sub.creatorPhone || '',
      platform: sub.platform,
      amount: sub.amount,
      utrId: sub.utrId,
      status: 'pending_signature',
      date: new Date().toLocaleDateString('en-IN'),
      createdAt: serverTimestamp(),
    });
    alert(`✅ Approved! Invoice ${invId} generated for creator.`);
    fetchSubs();
  };

  const handleReject = async (sub) => {
    const note = rejectNote || 'Rejected by admin.';
    await updateDoc(doc(db, 'portal_submissions', sub.id), { status: 'rejected', rejectReason: note, reviewedAt: serverTimestamp() });
    await updateDoc(doc(db, 'portal_deals', sub.dealId), { status: 'rejected', updatedAt: serverTimestamp() });
    setRejectNote('');
    fetchSubs();
  };

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
        <h2 style={{color:'var(--dash-text)',margin:0}}>Submissions</h2>
        <button className="refresh-btn" onClick={fetchSubs}><RefreshCw size={18}/></button>
      </div>
      {loading ? <div className="dash-loader"><div className="spinner"/></div> : (
        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          {subs.length === 0 && <div className="dash-empty"><Filter size={48}/><h3>No submissions yet</h3></div>}
          {subs.map(sub => (
            <div key={sub.id} className="admin-sub-card">
              <div className="admin-sub-card__header" onClick={() => setExpanded(expanded === sub.id ? null : sub.id)}>
                <div>
                  <span className="row-name">{sub.dealTitle}</span>
                  <span style={{marginLeft:'1rem',color:'var(--dash-muted)',fontSize:'0.85rem'}}>{sub.creatorName}</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                  <StatusBadge status={sub.status}/>
                  {expanded === sub.id ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                </div>
              </div>
              {expanded === sub.id && (
                <div className="admin-sub-card__body">
                  <div className="admin-sub-grid">
                    <div className="portal-review-section">
                      <h4>Content Proof</h4>
                      <div className="portal-review-row"><span>Video Link</span><a href={sub.videoLink} target="_blank" rel="noreferrer">{sub.videoLink}</a></div>
                      <div className="portal-review-row"><span>Timestamp</span><strong>{sub.timestamp}</strong></div>
                      <div className="portal-review-row"><span>Platform</span><strong>{sub.platform}</strong></div>
                      <div className="portal-review-row"><span>Notes</span><em>{sub.deliverableNotes||'—'}</em></div>
                    </div>
                    <div className="portal-review-section">
                      <h4>Payment Proof</h4>
                      <div className="portal-review-row"><span>Amount</span><strong>₹{Number(sub.amount||0).toLocaleString('en-IN')}</strong></div>
                      <div className="portal-review-row"><span>UTR ID</span><strong style={{fontFamily:'monospace'}}>{sub.utrId}</strong></div>
                      {sub.proofUrl && (
                        <div className="portal-review-row">
                          <span>Screenshot</span>
                          <a href={sub.proofUrl} target="_blank" rel="noreferrer">
                            <img src={sub.proofUrl} alt="Payment proof" style={{width:120,borderRadius:6,border:'1px solid rgba(255,255,255,0.1)'}}/>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {sub.status === 'submitted' && (
                    <div className="admin-sub-actions">
                      <button className="portal-btn" style={{background:'#22c55e',color:'#fff'}} onClick={() => handleApprove(sub)}>
                        <CheckCircle size={16}/> Approve & Generate Invoice
                      </button>
                      <div style={{display:'flex',gap:'0.5rem',flex:1}}>
                        <input
                          className="comment-thread__input" style={{flex:1}}
                          placeholder="Rejection reason (optional)…"
                          value={rejectNote} onChange={e => setRejectNote(e.target.value)}
                        />
                        <button className="portal-btn" style={{background:'#ef4444',color:'#fff'}} onClick={() => handleReject(sub)}>
                          <XCircle size={16}/> Reject
                        </button>
                      </div>
                    </div>
                  )}

                  <CommentThread submissionId={sub.id} isAdmin={true}/>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Invoices sub-panel ───────────────────────────────────────────────────────
function InvoicesPanel() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const snap = await getDocs(query(collection(db, 'portal_invoices'), orderBy('createdAt','desc')));
      setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <h2 style={{color:'var(--dash-text)',marginBottom:'1.5rem'}}>Invoices</h2>
      {loading ? <div className="dash-loader"><div className="spinner"/></div> : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead><tr><th>Invoice ID</th><th>Creator</th><th>Deal</th><th>Amount</th><th>Date</th><th>Status</th><th>View</th></tr></thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td><div style={{fontFamily:'monospace',fontSize:'0.8rem'}}>{inv.invoiceId}</div></td>
                  <td><div>{inv.creatorName}</div></td>
                  <td><div>{inv.dealTitle}</div></td>
                  <td><div>₹{Number(inv.amount||0).toLocaleString('en-IN')}</div></td>
                  <td><div>{inv.date}</div></td>
                  <td><StatusBadge status={inv.status}/></td>
                  <td>
                    <Link to={`/portal/invoice/${inv.id}`} className="row-view-btn" title="View Invoice">
                      <Eye size={18}/>
                    </Link>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && <tr><td colSpan={7} style={{textAlign:'center',padding:'2rem',color:'var(--dash-muted)'}}>No invoices yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('influencers');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('waveAdminToken');
    if (token !== 'authenticated_success') navigate('/wavelogin');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('waveAdminToken');
    navigate('/wavelogin');
  };

  const NAV = [
    { id: 'influencers',  label: 'Influencers',   icon: <Users size={20}/> },
    { id: 'brands',       label: 'Brands',         icon: <Briefcase size={20}/> },
    { id: 'enquiries',    label: 'Enquiries',      icon: <MessageSquare size={20}/> },
    { id: 'creators',     label: 'Creators',       icon: <Users size={20}/> },
    { id: 'deals',        label: 'Deals',          icon: <FileText size={20}/> },
    { id: 'submissions',  label: 'Submissions',    icon: <CheckCircle size={20}/> },
    { id: 'invoices',     label: 'Invoices',       icon: <FileText size={20}/> },
  ];

  const isLeadsTab = ['influencers','brands','enquiries'].includes(activeTab);

  return (
    <div className="dash-container">
      <aside className="dash-sidebar">
        <div className="dash-logo">Wave<span>Admin</span></div>
        <nav className="dash-nav">
          {NAV.map(n => (
            <button
              key={n.id}
              className={`dash-nav-link ${activeTab === n.id ? 'active' : ''}`}
              onClick={() => setActiveTab(n.id)}
            >
              {n.icon} {n.label}
            </button>
          ))}
        </nav>
        <button className="dash-logout" onClick={handleLogout}><LogOut size={20}/> Logout</button>
      </aside>

      <main className="dash-main">
        <header className="dash-header">
          <div className="header-left">
            <h1>{NAV.find(n => n.id === activeTab)?.label}</h1>
          </div>
          {isLeadsTab && <div id="leads-header-actions" />}
        </header>
        <div className="dash-content">
          {isLeadsTab      && <LeadsPanel activeTab={activeTab}/>}
          {activeTab === 'creators'    && <CreatorsPanel/>}
          {activeTab === 'deals'       && <DealsPanel/>}
          {activeTab === 'submissions' && <SubmissionsPanel/>}
          {activeTab === 'invoices'    && <InvoicesPanel/>}
        </div>
      </main>
    </div>
  );
}
