import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users, Briefcase, MessageSquare, LogOut,
  Search, RefreshCw, Filter, Trash2,
  PlusCircle, CheckCircle, XCircle, FileText,
  ChevronDown, ChevronUp, Eye, Receipt, Download
} from 'lucide-react';
import { db, auth } from './firebase';
import { 
  collection, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, serverTimestamp, getDoc 
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
      const q = query(collection(db, 'leads'));
      const querySnapshot = await getDocs(q);
      const leads = querySnapshot.docs.map(doc => {
        const d = doc.data();
        // Support both lowercase (new) and capitalized (imported) fields
        return {
          id: doc.id,
          name: d.Name || d.name || '—',
          email: d.Email || d.email || '—',
          phone: d.Phone || d.phone || '—',
          type: d.Type || d.type || 'contact_form',
          message: d.Message || d.message || '',
          company: d.Company || d.company || '',
          location: d.Location || d.location || '',
          createdAt: d.createdAt?.toDate() || (d.Date ? new Date(d.Date) : new Date())
        };
      });
      leads.sort((a, b) => b.createdAt - a.createdAt);
      setData(leads);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!id) {
      alert("Error: Missing ID for this lead.");
      return;
    }
    if (!window.confirm('Delete this lead?')) return;
    try {
      await deleteDoc(doc(db, 'leads', id));
      fetchData();
    } catch (err) {
      alert("Error deleting lead: " + err.message);
      console.error(err);
    }
  };

  const filtered = data.filter(row => {
    const tabMatch =
      activeTab === 'influencers' ? row.type === 'influencer' :
      activeTab === 'brands'      ? row.type === 'brand' :
                                    row.type === 'contact_form';
    if (!tabMatch) return false;
    if (!searchTerm) return true;
    return row.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           row.email?.toLowerCase().includes(searchTerm.toLowerCase());
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
                  <td><div>{new Date(row.createdAt).toLocaleDateString()}</div></td>
                  <td><div className="row-name">{row.name}</div><div className="row-email">{row.email}</div><div className="row-phone">{row.phone}</div></td>
                  <td>
                    {row.type === 'influencer' ? (
                      <div className="platform-tags">
                        {row.ytName && row.ytName !== 'N/A' && <a href={row.ytLink} target="_blank" rel="noreferrer" className="tag yt">YT: {row.ytSubs}</a>}
                        {row.igHandle && row.igHandle !== 'N/A' && <a href={row.igLink} target="_blank" rel="noreferrer" className="tag ig">IG: {row.igFollowers}</a>}
                      </div>
                    ) : row.type === 'brand' ? (
                      <div className="brand-meta"><div className="row-company">{row.company}</div></div>
                    ) : (
                      <span className="tag service">{row.website}</span>
                    )}
                  </td>
                  <td><div className="msg-full">{row.message}</div></td>
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
                  <div className="detail-item"><span>Name:</span> {selectedRow.name}</div>
                  <div className="detail-item"><span>Email:</span> {selectedRow.email}</div>
                  <div className="detail-item"><span>Phone:</span> {selectedRow.phone}</div>
                  <div className="detail-item"><span>Date:</span> {new Date(selectedRow.createdAt).toLocaleString()}</div>
                </div>
              </div>
              
              {selectedRow.type === 'influencer' && (
                <div className="detail-section">
                  <label>Platform Details</label>
                  <div className="detail-grid">
                    {selectedRow.ytName && selectedRow.ytName !== 'N/A' && (
                      <div className="detail-item" style={{gridColumn: '1 / -1'}}>
                        <span>YouTube:</span> {selectedRow.ytName} ({selectedRow.ytSubs} Subs) - <a href={selectedRow.ytLink} target="_blank" rel="noreferrer" style={{color:'var(--accent)'}}>View Channel</a>
                      </div>
                    )}
                    {selectedRow.igHandle && selectedRow.igHandle !== 'N/A' && (
                      <div className="detail-item" style={{gridColumn: '1 / -1'}}>
                        <span>Instagram:</span> {selectedRow.igHandle} ({selectedRow.igFollowers} Followers) - <a href={selectedRow.igLink} target="_blank" rel="noreferrer" style={{color:'var(--accent)'}}>View Profile</a>
                      </div>
                    )}
                    {selectedRow.fbLink && selectedRow.fbLink !== 'N/A' && (
                      <div className="detail-item" style={{gridColumn: '1 / -1'}}>
                        <span>Facebook:</span> <a href={selectedRow.fbLink} target="_blank" rel="noreferrer" style={{color:'var(--accent)'}}>View Profile</a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedRow.type === 'brand' && selectedRow.company && (
                <div className="detail-section">
                  <label>Brand Details</label>
                  <div className="detail-grid">
                    <div className="detail-item" style={{gridColumn: '1 / -1'}}><span>Company Name:</span> {selectedRow.company}</div>
                  </div>
                </div>
              )}

              {selectedRow.type === 'contact_form' && selectedRow.website && (
                <div className="detail-section">
                  <label>Enquiry Details</label>
                  <div className="detail-grid">
                    <div className="detail-item" style={{gridColumn: '1 / -1'}}><span>Service Interest:</span> {selectedRow.website}</div>
                  </div>
                </div>
              )}

              <div className="detail-section" style={{marginTop:'1.5rem'}}>
                <label>Message / Additional Info</label>
                <div className="detail-message">{selectedRow.message || 'No additional message provided.'}</div>
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
  const [form, setForm] = useState({ name:'', email:'', phone:'', channelName:'', youtubeLink:'', instagramLink:'', paymentDetails:'', password:'' });
  const [saving, setSaving] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [updating, setUpdating] = useState(false);

  const handleUpdateCreator = async () => {
    setUpdating(true);
    try {
      const creatorRef = doc(db, 'portal_creators', selectedCreator.id);
      await updateDoc(creatorRef, {
        ...selectedCreator,
        updatedAt: serverTimestamp()
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
    try {
      const q = query(collection(db, 'portal_creators'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          name: d.Name || d.name || '—',
          email: d.Email || d.email || '—',
          phone: d.Phone || d.phone || '—',
          channelName: d.ChannelName || d.channelName || d.channel_name || '—'
        };
      });
      setCreators(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCreators(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Create in Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(cred.user, { displayName: form.name });
      
      // 2. Create in Firestore
      await setDoc(doc(db, 'portal_creators', cred.user.uid), {
        uid: cred.user.uid,
        name: form.name,
        email: form.email,
        phone: form.phone,
        channelName: form.channelName,
        youtubeLink: form.youtubeLink,
        instagramLink: form.instagramLink,
        creatorAddress: form.creatorAddress || 'N/A',
        accountHolder: form.accountHolder || 'N/A',
        bankName: form.bankName || 'N/A',
        ifscCode: form.ifscCode || 'N/A',
        accountNumber: form.accountNumber || 'N/A',
        upiId: form.upiId || 'N/A',
        createdAt: serverTimestamp()
      });
      
      setShowForm(false);
      setForm({ name:'', email:'', phone:'', channelName:'', youtubeLink:'', instagramLink:'', paymentDetails:'', password:'' });
      fetchCreators();
      alert('Creator account created successfully!');
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
            {[['name','Full Name','text'],['email','Email','email'],['phone','Phone','tel'],['channelName','Channel Name','text'],['youtubeLink','YouTube Link','url'],['instagramLink','Instagram Link','url'],['paymentDetails','UPI / Bank Details','text'],['password','Temporary Password','password']].map(([n,l,t]) => (
              <div className="portal-field" key={n}>
                <label>{l}</label>
                <input type={t} value={form[n]} required={n!=='phone' && n!=='paymentDetails'}
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
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Channel Name</th><th>Action</th></tr></thead>
            <tbody>
              {creators.map(c => (
                <tr key={c.id}>
                  <td><div className="row-name">{c.name}</div></td>
                  <td><div className="row-email">{c.email}</div></td>
                  <td><div className="row-phone">{c.phone || '—'}</div></td>
                  <td><div>{c.channelName || '—'}</div></td>
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
                    <label>Channel Name</label>
                    <input type="text" value={selectedCreator.channelName || ''} onChange={e => setSelectedCreator({...selectedCreator, channelName: e.target.value})} placeholder="e.g. CarryMinati" />
                  </div>
                  <div className="portal-field">
                    <label>YouTube Link</label>
                    <input type="url" value={selectedCreator.youtubeLink || ''} onChange={e => setSelectedCreator({...selectedCreator, youtubeLink: e.target.value})} placeholder="https://youtube.com/@username" />
                  </div>
                  <div className="portal-field">
                    <label>Instagram Link</label>
                    <input type="url" value={selectedCreator.instagramLink || ''} onChange={e => setSelectedCreator({...selectedCreator, instagramLink: e.target.value})} placeholder="https://instagram.com/username" />
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
  const [form, setForm] = useState({ title:'', creatorId:'', deliverables:'', amount:'', platform:'', videoType:'', deadline:'' });
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dSnap, cSnap] = await Promise.all([
        getDocs(collection(db, 'portal_deals')),
        getDocs(collection(db, 'portal_creators'))
      ]);
      const dData = dSnap.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          title: d.Title || d.title || 'Untitled Deal',
          creatorId: d.CreatorId || d.creatorId || '',
          creatorName: d.CreatorName || d.creatorName || d.Name || d.name || '',
          status: d.Status || d.status || 'locked',
          amount: d.Amount || d.amount || 0
        };
      });
      const cData = cSnap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        name: doc.data().Name || doc.data().name || '—'
      }));
      setDeals(dData);
      setCreators(cData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
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
        channelName: creator?.channelName || '',
        youtubeLink: creator?.youtubeLink || '',
        instagramLink: creator?.instagramLink || '',
        status: 'locked',
        createdAt: serverTimestamp()
      });
      setShowForm(false);
      setForm({ title:'', creatorId:'', deliverables:'', amount:'', platform:'', videoType:'', deadline:'' });
      fetchAll();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this deal?')) return;
    await deleteDoc(doc(db, 'portal_deals', id));
    fetchAll();
  };

  const handleApproveDeal = async (id) => {
    if (!window.confirm('Approve this deal and notify the creator?')) return;
    try {
      // Optimistic UI update
      setDeals(prev => prev.map(d => d.id === id ? {...d, status: 'approved', Status: 'approved'} : d));
      
      const dealRef = doc(db, 'portal_deals', id);
      await updateDoc(dealRef, {
        status: 'approved',
        Status: 'approved',
        updatedAt: serverTimestamp()
      });
      console.log("Deal approved in Firestore:", id);
    } catch (err) { 
      console.error("Approve Error:", err);
      alert("Failed to approve deal. Please check your internet connection.");
      fetchAll(); // Revert on error
    }
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
            <div className="portal-field"><label>Video Type *</label>
              <select value={form.videoType} required onChange={e => setForm(p=>({...p,videoType:e.target.value}))}>
                <option value="">Select type…</option>
                <option value="Integrated">Integrated</option>
                <option value="Dedicated">Dedicated</option>
                <option value="Media Ads">Media Ads</option>
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
            <thead><tr><th>Title</th><th>Creator</th><th>Video Type</th><th>Amount</th><th>Deadline</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {deals.map(d => (
                <tr key={d.id}>
                  <td><div className="row-name">{d.title}</div></td>
                  <td><div>{d.creatorName}</div></td>
                  <td><div>{d.videoType || '—'}</div></td>
                  <td><div>₹{Number(d.amount||0).toLocaleString('en-IN')}</div></td>
                  <td><div>{d.deadline || '—'}</div></td>
                  <td><StatusBadge status={d.status}/></td>
                  <td style={{display: 'flex', gap: '0.5rem'}}>
                    {d.status === 'locked' && (
                      <button className="portal-btn portal-btn--sm portal-btn--primary" onClick={() => handleApproveDeal(d.id)}>Approve</button>
                    )}
                    <button className="row-delete-btn" onClick={() => handleDelete(d.id)}><Trash2 size={16}/></button>
                  </td>
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
  const [paymentForms, setPaymentForms] = useState({});
  const [paying, setPaying] = useState(false);

  // Helper to convert file to Base64
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  const fetchSubs = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'portal_submissions'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          status: d.Status || d.status || 'pending',
          creatorId: d.CreatorId || d.creatorId || '',
          dealId: d.DealId || d.dealId || '',
          createdAt: d.createdAt?.toDate() || (d.Date ? new Date(d.Date) : new Date())
        };
      });
      data.sort((a, b) => b.createdAt - a.createdAt);
      setSubs(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSubs(); }, []);

  const handleApproveAndPay = async (sub) => {
    const pForm = paymentForms[sub.id] || {};
    if (!pForm.utrId) {
      alert("Please enter a UTR ID to mark as paid.");
      return;
    }
    setPaying(true);
    try {
      let proofUrl = '';
      if (pForm.file) {
        proofUrl = await toBase64(pForm.file);
      }

      // 1. Update submission in Firestore
      await updateDoc(doc(db, 'portal_submissions', sub.id), {
        status: 'paid',
        adminUtrId: pForm.utrId,
        adminProofUrl: proofUrl,
        updatedAt: serverTimestamp()
      });

      // 2. Find and update invoice in Firestore
      const q = query(
        collection(db, 'portal_invoices'), 
        where('creatorId', '==', sub.creatorId),
        where('dealId', '==', sub.dealId),
        where('status', '==', 'pending_payment')
      );
      const invSnap = await getDocs(q);
      if (!invSnap.empty) {
        const invDoc = invSnap.docs[0];
        await updateDoc(doc(db, 'portal_invoices', invDoc.id), {
          status: 'paid',
          utrId: pForm.utrId,
          adminProofUrl: proofUrl || '',
          updatedAt: serverTimestamp()
        });
      }

      // 3. Update Deal status to completed
      await updateDoc(doc(db, 'portal_deals', sub.dealId), {
        status: 'completed',
        updatedAt: serverTimestamp()
      });

      alert(`✅ Paid & Approved!`);
      fetchSubs();
    } catch (err) {
      alert(err.message);
    } finally {
      setPaying(false);
    }
  };

  const handleReject = async (sub) => {
    const note = rejectNote || 'Rejected by admin.';
    try {
      await updateDoc(doc(db, 'portal_submissions', sub.id), {
        status: 'rejected',
        rejectReason: note,
        updatedAt: serverTimestamp()
      });
      await updateDoc(doc(db, 'portal_deals', sub.dealId), {
        status: 'rejected',
        updatedAt: serverTimestamp()
      });
      setRejectNote('');
      fetchSubs();
    } catch (err) { alert(err.message); }
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
                      {/* Platform badge */}
                      {sub.contentPlatform && (
                        <div className="portal-review-row">
                          <span>Platform</span>
                          <strong style={{textTransform:'capitalize'}}>{sub.contentPlatform}</strong>
                        </div>
                      )}
                      {/* Link submission */}
                      {sub.videoLink && (
                        <div className="portal-review-row">
                          <span>Content Link</span>
                          <a href={sub.videoLink} target="_blank" rel="noreferrer" style={{color:'var(--accent)',wordBreak:'break-all'}}>{sub.videoLink}</a>
                        </div>
                      )}
                      {/* Uploaded video */}
                      {sub.uploadedVideoUrl && (
                        <div className="portal-review-row" style={{flexDirection:'column',alignItems:'flex-start',gap:'0.5rem'}}>
                          <span>Uploaded Video</span>
                          <video
                            src={sub.uploadedVideoUrl}
                            controls
                            style={{width:'100%',maxHeight:'200px',borderRadius:'8px',background:'#000',marginTop:'0.5rem'}}
                          />
                          <a href={sub.uploadedVideoUrl} target="_blank" rel="noreferrer" className="portal-btn portal-btn--sm portal-btn--ghost">
                            <Download size={14}/> Download Video
                          </a>
                        </div>
                      )}
                      <div className="portal-review-row"><span>Timestamp</span><strong>{sub.timestamp}</strong></div>
                    </div>
                    <div className="portal-review-section">
                      <h4>Billing & Payment (Creator)</h4>
                      <div className="portal-review-row"><span>Channel Name</span><strong>{sub.channelName || '—'}</strong></div>
                      <div className="portal-review-row"><span>Billing Address</span><em style={{fontSize:'0.8rem'}}>{sub.creatorAddress || '—'}</em></div>
                      <div className="portal-review-row"><span>Account Holder</span><strong>{sub.accountHolder || '—'}</strong></div>
                      <div className="portal-review-row"><span>Bank Name</span><strong>{sub.bankName || '—'}</strong></div>
                      <div className="portal-review-row"><span>IFSC Code</span><strong className="portal-mono">{sub.ifscCode || '—'}</strong></div>
                      <div className="portal-review-row"><span>A/C Number</span><strong className="portal-mono">{sub.accountNumber || '—'}</strong></div>
                      <div className="portal-review-row"><span>UPI ID</span><strong>{sub.upiId || '—'}</strong></div>
                      <div className="portal-review-row"><span>Amount</span><strong>₹{Number(sub.amount||0).toLocaleString('en-IN')}</strong></div>
                      
                      {(sub.signatureUrl || sub.signatureData) && (
                        <div className="portal-review-row" style={{marginTop:'1rem', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem'}}>
                          <span>Signature Proof</span>
                          {sub.signatureData ? (
                            <img src={sub.signatureData} alt="Signature" style={{maxHeight:'80px', background:'#fff', padding:'4px', borderRadius:'4px'}} />
                          ) : sub.signatureUrl?.includes('firebasestorage') ? (
                            <img src={sub.signatureUrl} alt="Signature" style={{maxHeight:'80px', background:'#fff', padding:'4px', borderRadius:'4px'}} />
                          ) : (
                            <a href={sub.signatureUrl} target="_blank" rel="noreferrer" style={{color: 'var(--accent)', textDecoration: 'underline', wordBreak: 'break-all', fontSize: '0.9rem'}}>
                              🔗 View Google Drive Link
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {sub.status === 'paid' && (
                    <div className="portal-alert portal-alert--success" style={{marginTop:'1rem'}}>
                      <strong>Paid & Invoice Generated</strong><br/>
                      UTR: {sub.adminUtrId}
                      {sub.adminProofUrl && <div><a href={sub.adminProofUrl} target="_blank" rel="noreferrer" style={{color:'inherit',textDecoration:'underline'}}>View Payment Screenshot</a></div>}
                    </div>
                  )}

                  {sub.status === 'submitted_video' && (
                    <div style={{marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)'}}>
                      <h4 style={{marginTop: 0, marginBottom: '1rem', color: '#fff'}}>Admin Action: Mark as Paid</h4>
                      <div className="admin-form-grid" style={{marginBottom: '1rem'}}>
                        <div className="portal-field">
                          <label>UTR ID *</label>
                          <input type="text" placeholder="Enter UTR..." value={paymentForms[sub.id]?.utrId || ''} onChange={e => setPaymentForms(p => ({...p, [sub.id]: {...(p[sub.id]||{}), utrId: e.target.value}}))} />
                        </div>
                        <div className="portal-field">
                          <label>Payment Screenshot</label>
                          <input type="file" accept="image/*" onChange={e => setPaymentForms(p => ({...p, [sub.id]: {...(p[sub.id]||{}), file: e.target.files[0]}}))} />
                        </div>
                      </div>
                      <div className="admin-sub-actions">
                        <button className="portal-btn" style={{background:'#22c55e',color:'#fff'}} onClick={() => handleApproveAndPay(sub)} disabled={paying}>
                          <CheckCircle size={16}/> {paying ? 'Processing...' : 'Mark Paid & Generate Invoice'}
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
      try {
        const querySnapshot = await getDocs(collection(db, 'portal_invoices'));
        const data = querySnapshot.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            ...d,
            status: d.Status || d.status || 'unpaid',
            creatorName: d.CreatorName || d.creatorName || '—',
            amount: d.Amount || d.amount || 0,
            createdAt: d.createdAt?.toDate() || (d.Date ? new Date(d.Date) : new Date())
          };
        });
        data.sort((a, b) => b.createdAt - a.createdAt);
        setInvoices(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
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
    // Require both Firebase Auth session AND localStorage token
    const unsubscribe = auth.onAuthStateChanged((user) => {
      const token = localStorage.getItem('waveAdminToken');
      if (!user || token !== 'authenticated_success') {
        localStorage.removeItem('waveAdminToken');
        navigate('/wavelogin');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem('waveAdminToken');
    navigate('/wavelogin');
  };

  const NAV = [
    { id: 'influencers',  label: 'Influencers',   icon: <Users size={20}/> },
    { id: 'brands',       label: 'Brands',         icon: <Briefcase size={20}/> },
    { id: 'enquiries',    label: 'Enquiries',      icon: <MessageSquare size={20}/> },
    { id: 'portal_creators',     label: 'Creators',       icon: <Users size={20}/> },
    { id: 'portal_deals',        label: 'Deals',          icon: <FileText size={20}/> },
    { id: 'portal_submissions',  label: 'Submissions',    icon: <CheckCircle size={20}/> },
    { id: 'portal_invoices',     label: 'Invoices',       icon: <FileText size={20}/> },
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
          {activeTab === 'portal_creators'    && <CreatorsPanel/>}
          {activeTab === 'portal_deals'       && <DealsPanel/>}
          {activeTab === 'portal_submissions' && <SubmissionsPanel/>}
          {activeTab === 'portal_invoices'    && <InvoicesPanel/>}
        </div>
      </main>
    </div>
  );
}
