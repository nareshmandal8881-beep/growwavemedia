import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import {
  collection, query, where, getDocs, orderBy, doc, updateDoc
} from 'firebase/firestore';
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
  const [profileForm, setProfileForm] = useState({ phone: '', platform: '', paymentDetails: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate('/portal/login'); return; }
      setLoading(true);
      try {
        // Fetch creator profile
        const cq = query(collection(db, 'portal_creators'), where('uid', '==', user.uid));
        const csnap = await getDocs(cq);
        if (csnap.empty) { await signOut(auth); navigate('/portal/login'); return; }
        const creatorData = { id: csnap.docs[0].id, ...csnap.docs[0].data() };
        setCreator(creatorData);
        setProfileForm({
          phone: creatorData.phone || '',
          platform: creatorData.platform || '',
          paymentDetails: creatorData.paymentDetails || ''
        });

        // Fetch assigned deals
        const dq = query(
          collection(db, 'portal_deals'),
          where('creatorId', '==', creatorData.id)
        );
        const dsnap = await getDocs(dq);
        const fetchedDeals = dsnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort in JS instead of Firestore query to avoid requiring composite indexes
        fetchedDeals.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setDeals(fetchedDeals);

        // Fetch invoices
        const iq = query(
          collection(db, 'portal_invoices'),
          where('creatorId', '==', creatorData.id)
        );
        const isnap = await getDocs(iq);
        const fetchedInvoices = isnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        fetchedInvoices.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setInvoices(fetchedInvoices);
      } catch (err) {
        console.error(err);
        alert("Error fetching data: " + err.message); // Added this to see if it's a permission issue or index issue
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
      await updateDoc(doc(db, 'portal_creators', creator.id), {
        phone: profileForm.phone,
        platform: profileForm.platform,
        paymentDetails: profileForm.paymentDetails
      });
      setCreator({ ...creator, ...profileForm });
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
              <LayoutDashboard size={18} /> My Deals
            </button>
            <button
              className={`portal-nav-btn ${tab === 'invoices' ? 'active' : ''}`}
              onClick={() => setTab('invoices')}
            >
              <FileText size={18} /> Invoices
            </button>
            <button
              className={`portal-nav-btn ${tab === 'profile' ? 'active' : ''}`}
              onClick={() => setTab('profile')}
            >
              <User size={18} /> Profile
            </button>
          </nav>
          <button className="portal-nav-btn portal-nav-btn--logout" onClick={handleLogout}>
            <LogOut size={18} /> Logout
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
                            {(deal.status === 'pending') && (
                              <Link
                                to={`/portal/deal/${deal.id}`}
                                className="portal-btn portal-btn--primary"
                              >
                                Submit Now →
                              </Link>
                            )}
                            {deal.status === 'submitted' && (
                              <span className="portal-deal-submitted-note">
                                ✓ Submitted — awaiting admin review
                              </span>
                            )}
                            {deal.status === 'rejected' && (
                              <Link
                                to={`/portal/deal/${deal.id}`}
                                className="portal-btn portal-btn--danger"
                              >
                                Resubmit →
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
                            <tr key={inv.id}>
                              <td className="portal-mono">{inv.invoiceId}</td>
                              <td>{inv.dealTitle}</td>
                              <td>₹{Number(inv.amount || 0).toLocaleString('en-IN')}</td>
                              <td>{inv.date}</td>
                              <td><StatusBadge status={inv.status} /></td>
                              <td>
                                <Link
                                  to={`/portal/invoice/${inv.id}`}
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
                          <label>Platform</label>
                          <input type="text" value={profileForm.platform} onChange={e => setProfileForm({...profileForm, platform: e.target.value})} placeholder="Instagram / YouTube" />
                        </div>
                        <div className="portal-field" style={{ gridColumn: '1 / -1' }}>
                          <label>UPI / Bank Details</label>
                          <textarea 
                            rows="3" 
                            value={profileForm.paymentDetails} 
                            onChange={e => setProfileForm({...profileForm, paymentDetails: e.target.value})}
                            placeholder="Enter UPI ID or Bank Account Details..."
                          />
                        </div>
                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                          <button type="submit" className="portal-btn portal-btn--primary" disabled={savingProfile}>
                            {savingProfile ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button type="button" className="portal-btn portal-btn--ghost" onClick={() => {
                            setIsEditingProfile(false);
                            setProfileForm({
                              phone: creator.phone || '',
                              platform: creator.platform || '',
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
                            ['Platform', creator.platform || '—'],
                            ['UPI / Bank', creator.paymentDetails || '—'],
                            ['Joined', creator.createdAt?.toDate
                              ? creator.createdAt.toDate().toLocaleDateString('en-IN')
                              : '—'],
                          ].map(([label, val]) => (
                            <div key={label} className="portal-profile-item">
                              <span className="portal-profile-item__label">{label}</span>
                              <span className="portal-profile-item__val">{val}</span>
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
