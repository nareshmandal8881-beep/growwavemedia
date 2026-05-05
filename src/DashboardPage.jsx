import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Briefcase, MessageSquare, LogOut, 
  Search, RefreshCw, ChevronRight, Filter, Trash2 
} from 'lucide-react';

import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';

export default function DashboardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('influencers');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    // Auth Check
    const token = localStorage.getItem('waveAdminToken');
    if (token !== 'authenticated_success') {
      navigate('/wavelogin');
    } else {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'leads'), orderBy('Timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const leads = [];
      querySnapshot.forEach((doc) => {
        leads.push({ id: doc.id, ...doc.data() });
      });
      setData(leads);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('waveAdminToken');
    navigate('/wavelogin');
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this lead?`)) return;
    
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'leads', id));
      alert('Lead deleted successfully!');
      fetchData();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete lead.');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(row => {
    const isTabMatch = 
      activeTab === 'influencers' ? row.Type === 'influencer' :
      activeTab === 'brands' ? row.Type === 'brand' :
      row.Type === 'Contact Enquiry';

    if (!isTabMatch) return false;

    if (!searchTerm) return true;
    return (
      row.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.Phone?.includes(searchTerm)
    );
  });

  return (
    <div className="dash-container">
      {/* Sidebar */}
      <aside className="dash-sidebar">
        <div className="dash-logo">
          Wave<span>Admin</span>
        </div>
        <nav className="dash-nav">
          <button 
            className={`dash-nav-link ${activeTab === 'influencers' ? 'active' : ''}`}
            onClick={() => setActiveTab('influencers')}
          >
            <Users size={20} /> Influencers
          </button>
          <button 
            className={`dash-nav-link ${activeTab === 'brands' ? 'active' : ''}`}
            onClick={() => setActiveTab('brands')}
          >
            <Briefcase size={20} /> Brands
          </button>
          <button 
            className={`dash-nav-link ${activeTab === 'enquiries' ? 'active' : ''}`}
            onClick={() => setActiveTab('enquiries')}
          >
            <MessageSquare size={20} /> Contact Enquiries
          </button>
        </nav>
        <button className="dash-logout" onClick={handleLogout}>
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main */}
      <main className="dash-main">
        <header className="dash-header">
          <div className="header-left">
            <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <p>Managing all incoming {activeTab} applications</p>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search by name, email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="refresh-btn" onClick={fetchData} disabled={loading}>
              <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            </button>
          </div>
        </header>

        <div className="dash-content">
          {loading ? (
            <div className="dash-loader">
              <div className="spinner"></div>
              <p>Fetching data from Firebase...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="dash-empty">
              <Filter size={48} />
              <h3>No {activeTab} found</h3>
              <p>Try clearing your search or wait for new submissions.</p>
            </div>
          ) : (
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name / Info</th>
                    <th>Platforms / Details</th>
                    <th>Message</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, i) => (
                    <tr key={i}>
                      <td className="col-date">{row.Date?.split(',')[0]}</td>
                      <td className="col-info">
                        <div className="row-name">{row.Name}</div>
                        <div className="row-email">{row.Email}</div>
                        <div className="row-phone">{row.Phone}</div>
                      </td>
                      <td className="col-details">
                        {row.Type === 'influencer' ? (
                          <div className="platform-tags">
                            {row.YT_Name !== 'N/A' && (
                              <a href={row.YT_Link} target="_blank" rel="noreferrer" className="tag yt">
                                YT: {row.YT_Subs}
                              </a>
                            )}
                            {row.IG_Handle !== 'N/A' && (
                              <a href={row.IG_Link} target="_blank" rel="noreferrer" className="tag ig">
                                IG: {row.IG_Followers}
                              </a>
                            )}
                            {row.FB_Name !== 'N/A' && (
                              <a href={row.FB_Link} target="_blank" rel="noreferrer" className="tag fb">
                                FB: {row.FB_Followers}
                              </a>
                            )}
                          </div>
                        ) : row.Type === 'brand' ? (
                          <div className="brand-meta">
                            <div className="row-company">{row.Company}</div>
                            <a href={row.Website} target="_blank" rel="noreferrer" className="row-link">{row.Website}</a>
                          </div>
                        ) : (
                          <div className="enquiry-meta">
                            <span className="tag service">{row.Niche_Website}</span>
                          </div>
                        )}
                      </td>
                      <td className="col-msg">
                        <div className="msg-full">{row.Message}</div>
                      </td>
                      <td className="col-actions-btns">
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="row-view-btn" onClick={() => setSelectedRow(row)} title="View Details">
                            <Search size={18} />
                          </button>
                          <button 
                            className="row-delete-btn" 
                            onClick={() => handleDelete(row.id)}
                            title="Delete Lead"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* DETAIL MODAL */}
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
                  <div className="detail-item"><span>Type:</span> {selectedRow.Type?.toUpperCase()}</div>
                  <div className="detail-item"><span>Date:</span> {selectedRow.Date}</div>
                </div>
              </div>

              {selectedRow.Type === 'influencer' && (
                <div className="detail-section">
                  <label>Social Media Platforms</label>
                  <div className="platform-detail-grid">
                    {selectedRow.YT_Name !== 'N/A' && (
                      <div className="p-detail yt">
                        <strong>YouTube</strong>
                        <p>{selectedRow.YT_Name}</p>
                        <p>{selectedRow.YT_Subs} Subscribers</p>
                        <a href={selectedRow.YT_Link} target="_blank" rel="noreferrer">Visit Channel &rarr;</a>
                      </div>
                    )}
                    {selectedRow.IG_Handle !== 'N/A' && (
                      <div className="p-detail ig">
                        <strong>Instagram</strong>
                        <p>{selectedRow.IG_Handle}</p>
                        <p>{selectedRow.IG_Followers} Followers</p>
                        <a href={selectedRow.IG_Link} target="_blank" rel="noreferrer">Visit Profile &rarr;</a>
                      </div>
                    )}
                    {selectedRow.FB_Name !== 'N/A' && (
                      <div className="p-detail fb">
                        <strong>Facebook</strong>
                        <p>{selectedRow.FB_Name}</p>
                        <p>{selectedRow.FB_Followers} Followers</p>
                        <a href={selectedRow.FB_Link} target="_blank" rel="noreferrer">Visit Page &rarr;</a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(selectedRow.Type === 'brand' || selectedRow.Type === 'Contact Enquiry') && (
                <div className="detail-section">
                  <label>{selectedRow.Type === 'brand' ? 'Company Info' : 'Inquiry Info'}</label>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span>{selectedRow.Type === 'brand' ? 'Company:' : 'Service:'}</span> 
                      {selectedRow.Type === 'brand' ? selectedRow.Company : selectedRow.Niche_Website}
                    </div>
                    {selectedRow.Website !== 'N/A' && (
                      <div className="detail-item">
                        <span>Website:</span> 
                        <a href={selectedRow.Website} target="_blank" rel="noreferrer">{selectedRow.Website}</a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="detail-section">
                <label>Message / Requirements</label>
                <div className="message-box">
                  {selectedRow.Message}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-close-modal" onClick={() => setSelectedRow(null)}>Close View</button>
              <a 
                href={`https://wa.me/${selectedRow.Phone?.replace(/\D/g, '')}`} 
                target="_blank" rel="noreferrer" 
                className="btn-wa-direct"
              >
                Contact on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
