import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Briefcase, MessageSquare, LogOut, 
  Search, RefreshCw, ChevronRight, Filter 
} from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('influencers');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

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
      const res = await fetch('https://sheetdb.io/api/v1/myhiyvk7r2sy9');
      const json = await res.json();
      // SheetDB returns data in reverse order of submission usually, or we can reverse it
      setData(json.reverse());
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
              <p>Fetching data from Google Sheets...</p>
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
                            {row.YT_Name !== 'N/A' && <span className="tag yt">YT: {row.YT_Subs}</span>}
                            {row.IG_Handle !== 'N/A' && <span className="tag ig">IG: {row.IG_Followers}</span>}
                            {row.FB_Name !== 'N/A' && <span className="tag fb">FB: {row.FB_Followers}</span>}
                          </div>
                        ) : row.Type === 'brand' ? (
                          <div className="brand-meta">
                            <div>{row.Company}</div>
                            <a href={row.Website} target="_blank" rel="noreferrer" className="row-link">Visit Website</a>
                          </div>
                        ) : (
                          <div className="enquiry-meta">
                            <span className="tag service">{row.Niche_Website}</span>
                          </div>
                        )}
                      </td>
                      <td className="col-msg">
                        <div className="msg-preview">{row.Message}</div>
                      </td>
                      <td>
                        <button className="row-view-btn">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
