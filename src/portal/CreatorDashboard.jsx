import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import {
  collection, query, where, getDocs, orderBy,
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

        // Fetch assigned deals
        const dq = query(
          collection(db, 'portal_deals'),
          where('creatorId', '==', creatorData.id),
          orderBy('createdAt', 'desc'),
        );
        const dsnap = await getDocs(dq);
        setDeals(dsnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        // Fetch invoices
        const iq = query(
          collection(db, 'portal_invoices'),
          where('creatorId', '==', creatorData.id),
          orderBy('createdAt', 'desc'),
        );
        const isnap = await getDocs(iq);
        setInvoices(isnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
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

              {/* Profile Tab */}
              {tab === 'profile' && creator && (
                <section className="portal-section">
                  <h2 className="portal-section__title">My Profile</h2>
                  <div className="portal-profile-card">
                    <div className="portal-avatar portal-avatar--lg">
                      {creator.name?.charAt(0).toUpperCase()}
                    </div>
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
                    <p className="portal-profile-note">
                      To update your details, contact admin at{' '}
                      <a href="mailto:growwavemedia@gmail.com">growwavemedia@gmail.com</a>
                    </p>
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
