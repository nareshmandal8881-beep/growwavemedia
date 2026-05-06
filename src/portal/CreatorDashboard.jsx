import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
const API_BASE = 'http://localhost:5000/api';
import { Helmet } from 'react-helmet-async';
import StatusBadge from './components/StatusBadge';
import {
  LayoutDashboard, FileText, User, LogOut,
  PlusCircle, TrendingUp, Clock, CheckCircle, RefreshCw,
} from 'lucide-react';

export default function CreatorDashboard() {
  const [creator, setCreator] = useState(null);
  const [deals, setDeals] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [tab, setTab] = useState('deals');
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ 
    phone: '', 
    channelName: '', 
    youtubeLink: '', 
    instagramLink: '', 
    creatorAddress: '',
    accountHolder: '',
    bankName: '',
    ifscCode: '',
    accountNumber: '',
    upiId: '' 
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate('/portal/login'); return; }
      setLoading(true);
      try {
        // 1. Fetch creator profile from MongoDB
        const cres = await fetch(`${API_BASE}/creators/uid/${user.uid}`);
        if (!cres.ok) { await signOut(auth); navigate('/portal/login'); return; }
        const creatorData = await cres.json();
        setCreator(creatorData);
        setProfileForm({
          phone: creatorData.phone || '',
          channelName: creatorData.channelName || '',
          youtubeLink: creatorData.youtubeLink || '',
          instagramLink: creatorData.instagramLink || '',
          creatorAddress: creatorData.creatorAddress || '',
          accountHolder: creatorData.accountHolder || '',
          bankName: creatorData.bankName || '',
          ifscCode: creatorData.ifscCode || '',
          accountNumber: creatorData.accountNumber || '',
          upiId: creatorData.upiId || ''
        });

        // 2. Fetch assigned deals from MongoDB
        const dres = await fetch(`${API_BASE}/deals/creator/${creatorData._id}`);
        if (dres.ok) {
          const fetchedDeals = await dres.json();
          setDeals(fetchedDeals);
        }

        // 3. Fetch invoices from MongoDB
        const ires = await fetch(`${API_BASE}/invoices/creator/${creatorData._id}`);
        if (ires.ok) {
          const fetchedInvoices = await ires.json();
          setInvoices(fetchedInvoices);
        }
      } catch (err) {
        console.error(err);
        alert("Error fetching data: " + err.message);
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/portal/login');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch(`${API_BASE}/creators/${creator._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const updatedCreator = await res.json();
      setCreator(updatedCreator);
      setIsEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const stats = [
    { label: 'Total Deals', value: deals.length, icon: <LayoutDashboard size={20} />, color: '#60a5fa' },
    { label: 'Pending', value: deals.filter((d) => d.status === 'pending').length, icon: <Clock size={20} />, color: '#f59e0b' },
    { label: 'Completed', value: deals.filter((d) => d.status === 'completed').length, icon: <CheckCircle size={20} />, color: '#34d399' },
    { label: 'Earnings', value: `₹${deals.filter((d) => d.status === 'completed').reduce((s, d) => s + (Number(d.amount) || 0), 0).toLocaleString('en-IN')}`, icon: <TrendingUp size={20} />, color: '#a78bfa' },
  ];

  return (
    <>
      <Helmet>
        <title>My Dashboard | Creator Portal</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="portal-layout">
        {/* Sidebar */}
        <aside className="portal-sidebar">
          <div className="portal-sidebar__logo">
            <span className="portal-auth-logo__wave">Wave</span>
            <span className="portal-auth-logo__portal">Portal</span>
          </div>
          {creator && (
            <div className="portal-sidebar__creator">
              <div className="portal-avatar">{creator.name?.charAt(0).toUpperCase()}</div>
              <div>
                <p className="portal-sidebar__name">{creator.name}</p>
                <p className="portal-sidebar__role">Creator</p>
              </div>
            </div>
          )}
          <nav className="portal-sidebar__nav">
            <button
              className={`portal-nav-btn ${tab === 'deals' ? 'active' : ''}`}
              onClick={() => setTab('deals')}
            >
              <LayoutDashboard size={18} /><span>My Deals</span>
            </button>
            <button
              className={`portal-nav-btn ${tab === 'invoices' ? 'active' : ''}`}
              onClick={() => setTab('invoices')}
            >
              <FileText size={18} /><span>Invoices</span>
            </button>
            <button
              className={`portal-nav-btn ${tab === 'profile' ? 'active' : ''}`}
              onClick={() => setTab('profile')}
            >
              <User size={18} /><span>Profile</span>
            </button>
          </nav>
          <button className="portal-nav-btn portal-nav-btn--logout" onClick={handleLogout}>
            <LogOut size={18} /><span>Logout</span>
          </button>
        </aside>

        {/* Main */}
        <main className="portal-main">
          {loading ? (
            <div className="portal-center">
              <div className="portal-spinner" />
              <p>Loading your dashboard…</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="portal-main__header">
                <div>
                  <h1>Welcome back, {creator?.name?.split(' ')[0]} 👋</h1>
                  <p className="portal-main__sub">Here&apos;s your overview for today</p>
                </div>
                <button
                  className="portal-btn portal-btn--ghost"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw size={16} /> Refresh
                </button>
              </div>

              {/* Stats */}
              <div className="portal-stats-grid">
                {stats.map((s, i) => (
                  <div key={i} className="portal-stat-card">
                    <div className="portal-stat-card__icon" style={{ color: s.color }}>
                      {s.icon}
                    </div>
                    <div>
                      <p className="portal-stat-card__value" style={{ color: s.color }}>{s.value}</p>
                      <p className="portal-stat-card__label">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Deals Tab */}
              {tab === 'deals' && (
                <section className="portal-section">
                  <h2 className="portal-section__title">Assigned Deals</h2>
                  {deals.length === 0 ? (
                    <div className="portal-empty">
                      <PlusCircle size={40} />
                      <p>No deals assigned yet. Check back soon.</p>
                    </div>
                  ) : (
                    <div className="portal-deals-grid">
                      {deals.map((deal) => (
                        <div key={deal.id} className="portal-deal-card">
                          <div className="portal-deal-card__top">
                            <h3>{deal.title}</h3>
                            <StatusBadge status={deal.status} />
                          </div>
                          <div className="portal-deal-card__meta">
                            <span>💰 ₹{Number(deal.amount || 0).toLocaleString('en-IN')}</span>
                            <span>📱 {deal.platform || '—'}</span>
                            {deal.deadline && <span>📅 {deal.deadline}</span>}
                          </div>
                          <p className="portal-deal-card__desc">{deal.deliverables}</p>
                          <div className="portal-deal-card__actions">
                            {(deal.status === 'locked' || deal.status === 'pending') && (
                              <div className="portal-deal-locked-state">
                                <span className="portal-deal-locked-icon">🔒</span>
                                <span>Awaiting admin approval to unlock</span>
                              </div>
                            )}
                            {deal.status === 'approved' && (
                              <Link
                                to={`/portal/deal/${deal._id}`}
                                className="portal-btn portal-btn--primary"
                              >
                                Submit Video →
                              </Link>
                            )}
                            {deal.status === 'submitted' && (
                              <span className="portal-deal-submitted-note">
                                ✓ Video Submitted — awaiting admin review/payment
                              </span>
                            )}
                            {deal.status === 'rejected' && (
                              <Link
                                to={`/portal/deal/${deal._id}`}
                                className="portal-btn portal-btn--danger"
                              >
                                Resubmit Video →
                              </Link>
                            )}
                            {deal.status === 'payment_review' && (
                              <span className="portal-deal-submitted-note" style={{ color: '#f97316' }}>
                                ⏳ Payment under review
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Invoices Tab */}
              {tab === 'invoices' && (
                <section className="portal-section">
                  <h2 className="portal-section__title">My Invoices</h2>
                  {invoices.length === 0 ? (
                    <div className="portal-empty">
                      <FileText size={40} />
                      <p>No invoices yet. Complete a deal to generate your first invoice.</p>
                    </div>
                  ) : (
                    <div className="portal-table-wrap">
                      <table className="portal-table">
                        <thead>
                          <tr>
                            <th>Invoice ID</th>
                            <th>Deal</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoices.map((inv) => (
                            <tr key={inv._id}>
                              <td className="portal-mono">{inv.invoiceId}</td>
                              <td>{inv.dealTitle}</td>
                              <td>₹{Number(inv.amount || 0).toLocaleString('en-IN')}</td>
                              <td>{inv.date}</td>
                              <td><StatusBadge status={inv.status} /></td>
                              <td>
                                <Link
                                  to={`/portal/invoice/${inv._id}`}
                                  className="portal-btn portal-btn--sm portal-btn--ghost"
                                >
                                  {inv.status === 'pending_signature' ? 'Sign Now' : 'View'}
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {tab === 'profile' && creator && (
                <section className="portal-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className="portal-section__title" style={{ marginBottom: 0 }}>My Profile</h2>
                    {!isEditingProfile && (
                      <button className="portal-btn portal-btn--ghost" onClick={() => setIsEditingProfile(true)}>
                        Edit Details
                      </button>
                    )}
                  </div>
                  
                  <div className="portal-profile-card">
                    <div className="portal-avatar portal-avatar--lg">
                      {creator.name?.charAt(0).toUpperCase()}
                    </div>
                    
                    {isEditingProfile ? (
                      <form onSubmit={handleUpdateProfile} className="admin-form-grid" style={{ marginTop: '2rem' }}>
                        <div className="portal-field">
                          <label>Full Name</label>
                          <input type="text" value={creator.name} disabled style={{ opacity: 0.5 }} />
                        </div>
                        <div className="portal-field">
                          <label>Email</label>
                          <input type="email" value={creator.email} disabled style={{ opacity: 0.5 }} />
                        </div>
                        <div className="portal-field">
                          <label>Phone</label>
                          <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} placeholder="+91..." />
                        </div>
                        <div className="portal-field">
                          <label>Channel / Creator Name</label>
                          <input type="text" value={profileForm.channelName} onChange={e => setProfileForm({...profileForm, channelName: e.target.value})} placeholder="e.g. CarryMinati" />
                        </div>
                        <div className="portal-field">
                          <label>YouTube Link</label>
                          <input type="url" value={profileForm.youtubeLink} onChange={e => setProfileForm({...profileForm, youtubeLink: e.target.value})} placeholder="https://youtube.com/@username" />
                        </div>
                        <div className="portal-field">
                          <label>Instagram Link</label>
                          <input type="url" value={profileForm.instagramLink} onChange={e => setProfileForm({...profileForm, instagramLink: e.target.value})} placeholder="https://instagram.com/username" />
                        </div>
                        <div className="portal-field" style={{ gridColumn: '1 / -1' }}>
                          <label>Billing Address</label>
                          <textarea 
                            rows="2" 
                            value={profileForm.creatorAddress} 
                            onChange={e => setProfileForm({...profileForm, creatorAddress: e.target.value})}
                            placeholder="Full address for invoice..."
                          />
                        </div>
                        <div className="portal-field">
                          <label>Account Holder Name</label>
                          <input type="text" value={profileForm.accountHolder} onChange={e => setProfileForm({...profileForm, accountHolder: e.target.value})} />
                        </div>
                        <div className="portal-field">
                          <label>Bank Name</label>
                          <input type="text" value={profileForm.bankName} onChange={e => setProfileForm({...profileForm, bankName: e.target.value})} />
                        </div>
                        <div className="portal-field">
                          <label>IFSC Code</label>
                          <input type="text" value={profileForm.ifscCode} onChange={e => setProfileForm({...profileForm, ifscCode: e.target.value})} />
                        </div>
                        <div className="portal-field">
                          <label>Account Number</label>
                          <input type="text" value={profileForm.accountNumber} onChange={e => setProfileForm({...profileForm, accountNumber: e.target.value})} />
                        </div>
                        <div className="portal-field">
                          <label>UPI ID</label>
                          <input type="text" value={profileForm.upiId} onChange={e => setProfileForm({...profileForm, upiId: e.target.value})} />
                        </div>
                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                          <button type="submit" className="portal-btn portal-btn--primary" disabled={savingProfile}>
                            {savingProfile ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button type="button" className="portal-btn portal-btn--ghost" onClick={() => {
                            setIsEditingProfile(false);
                            setProfileForm({
                              phone: creator.phone || '',
                              channelName: creator.channelName || '',
                              youtubeLink: creator.youtubeLink || '',
                              instagramLink: creator.instagramLink || '',
                              paymentDetails: creator.paymentDetails || ''
                            });
                          }}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                         <div className="portal-profile-grid">
                           {[
                             ['Full Name', creator.name],
                             ['Email', creator.email],
                             ['Phone', creator.phone || '—'],
                             ['Channel Name', creator.channelName || '—'],
                             ['YouTube Link', creator.youtubeLink || '—'],
                             ['Instagram Link', creator.instagramLink || '—'],
                             ['Billing Address', creator.creatorAddress || '—'],
                             ['Account Holder', creator.accountHolder || '—'],
                             ['Bank Name', creator.bankName || '—'],
                             ['IFSC Code', creator.ifscCode || '—'],
                             ['A/C Number', creator.accountNumber || '—'],
                             ['UPI ID', creator.upiId || '—'],
                             ['Joined', creator.createdAt?.toDate
                               ? creator.createdAt.toDate().toLocaleDateString('en-IN')
                               : '—'],
                           ].map(([label, val]) => (
                             <div key={label} className="portal-profile-item">
                               <span className="portal-profile-item__label">{label}</span>
                               <span className="portal-profile-item__val" style={{wordBreak: 'break-all'}}>{val}</span>
                             </div>
                           ))}
                         </div>
                        <p className="portal-profile-note" style={{ marginTop: '2rem' }}>
                          Need to change your name or email? Contact admin at{' '}
                          <a href="mailto:growwavemedia@gmail.com">growwavemedia@gmail.com</a>
                        </p>
                      </>
                    )}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
