import { useState } from 'react';
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
  pills = [],
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
          <span className="brand-mark">GP</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#FFFFFF', lineHeight: 1.1 }}>GreenPulse</div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>{area}</div>
          </div>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="brand-row">
              <span className="brand-mark">GP</span>
              <span>GreenPulse</span>
            </div>
            <div className="side-label" style={{ marginTop: 6 }}>
              {area}
            </div>
          </div>
          {mobileMenuOpen && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-ghost"
              style={{ color: '#fff', borderColor: '#334155', padding: '4px 10px', fontSize: 12 }}
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
            <div className="side-label">Portfolio Scope</div>
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
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: isSelected ? 700 : 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: isSelected ? '1px solid #0F766E' : '1px solid transparent',
                    backgroundColor: isSelected ? 'rgba(15, 118, 110, 0.15)' : 'transparent',
                    color: isSelected ? '#FFFFFF' : '#94A3B8',
                  }}
                >
                  <span style={{ fontSize: '15px' }}>{t.icon || '•'}</span>
                  <span style={{ flex: 1 }}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Live Telemetry Status Pills */}
        <div>
          <div className="side-label">Live Site Telemetry</div>
          <div className="pills">
            {pills.map((p) => (
              <div className="pill" key={p.k}>
                <span>{p.k}</span>
                <b className={p.tone}>{p.v}</b>
              </div>
            ))}
          </div>
        </div>

        {/* User Role Card & Logout */}
        <div className="side-user">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
            {user.icon && (
              <span
                style={{
                  fontSize: '16px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                {user.icon}
              </span>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <b style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontSize: '13px' }}>
                {user.title}
              </b>
              <small style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontSize: '11px', color: '#94A3B8' }}>
                {user.org || 'Site Operations'}
              </small>
            </div>
          </div>
          <button id="logout" className="logout" onClick={onLogout} title="Log out">
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
