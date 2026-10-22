import { useState } from 'react';
import logoImg from '../assets/BUILDWITHGEEKS LOGO.png';
import { SITES } from '../data/sites';

export default function Shell({
  user,
  area,
  siteId,
  onSite,
  showSites,
  sites = SITES,
  tabs = [],
  activeTab,
  onTabChange,
  onLogout,
  children,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabSelect = (tabId) => {
    if (onTabChange) onTabChange(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="shell">
      {/* Mobile Top Header (Hidden on Desktop) */}
      <header className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src={logoImg}
            alt="GreenPulse"
            style={{ height: '26px', width: 'auto', display: 'block' }}
          />
          <div style={{ fontSize: '11px', color: '#8EA39C', fontWeight: 600 }}>{area}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {showSites && (
            <select
              className="site-select-mobile"
              value={siteId}
              onChange={(e) => onSite && onSite(e.target.value)}
              aria-label="Select active project site"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.short}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Mobile Horizontal Tabs Scrollbar (Hidden on Desktop) */}
      <nav className="mobile-tab-bar" aria-label="Mobile Navigation Tabs">
        {tabs.map((t) => {
          const isSelected = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleTabSelect(t.id)}
              className={`mobile-tab-item ${isSelected ? 'active' : ''}`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Desktop Sidebar & Mobile Slide-over Drawer */}
      <aside className={`side ${mobileMenuOpen ? 'mobile-open' : ''}`} aria-label="Sidebar">
        {/* Brand & Area */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
          <div style={{ width: '100%', textAlign: 'left' }}>
            <div className="brand-row" style={{ justifyContent: 'flex-start', padding: '0 6px' }}>
              <img
                src={logoImg}
                alt="GreenPulse"
                style={{ height: '36px', width: 'auto', display: 'block' }}
              />
            </div>
            <div className="side-label" style={{ marginTop: 8, textAlign: 'left', color: '#8EA39C' }}>
              {area}
            </div>
          </div>
          {mobileMenuOpen && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-ghost"
              style={{ color: '#FFFFFF', borderColor: '#334D46', padding: '4px 10px', fontSize: 12, backgroundColor: '#1C2A27' }}
            >
              ✕ Close
            </button>
          )}
        </div>


        {/* Site Picker (for M&E and EO) or Scope (for HQ) */}
        {showSites ? (
          <div>
            <label htmlFor="active-site-select" className="side-label" style={{ display: 'block', cursor: 'pointer' }}>
              Active Project Site
            </label>
            <div style={{ padding: '0 6px' }}>
              <select
                id="active-site-select"
                className="site-select"
                value={siteId}
                onChange={(e) => {
                  if (onSite) onSite(e.target.value);
                  setMobileMenuOpen(false);
                }}
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.short}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div>
            <div className="side-label">Portfolio Overview</div>
            <div className="pill">
              <span>All Townships</span>
              <b>{sites.length} BESS Units</b>
            </div>
          </div>
        )}

        {/* Structured Tabbed Sidebar Navigation */}
        <nav aria-label="Main Navigation">
          <div className="side-label">Modules & Views</div>
          <div className="nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {tabs.map((t) => {
              const isSelected = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  id={`tab-${t.id}`}
                  onClick={() => handleTabSelect(t.id)}
                  className={`side-nav-btn ${isSelected ? 'active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: isSelected ? 700 : 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: isSelected ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
                    background: isSelected
                      ? 'linear-gradient(135deg, #2E7D5B 0%, #206246 100%)'
                      : 'transparent',
                    color: isSelected ? '#FFFFFF' : '#A3B8B0',
                    boxShadow: isSelected ? '0 4px 14px rgba(46, 125, 91, 0.4)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#1C2A27';
                      e.currentTarget.style.color = '#FFFFFF';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#A3B8B0';
                    }
                  }}
                >
                  <span style={{ fontSize: '15px' }}>{t.icon || '•'}</span>
                  <span style={{ flex: 1 }}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Role Card & Logout */}
        <div className="side-user">
          <div>
            <b>{user.title}</b>
            <small>{user.org}</small>
          </div>
          <button id="logout" className="logout" onClick={onLogout}>
            Log out
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Focused Content View */}
      <main className="main">{children}</main>
    </div>
  );
}
