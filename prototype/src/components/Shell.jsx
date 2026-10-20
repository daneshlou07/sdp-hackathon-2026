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

  return (
    <div className="shell">
      <aside className="side" aria-label="Sidebar">
        {/* Brand & Area */}
        <div>
          <div className="brand-row">
            <span className="brand-mark">GP</span>
            <span>GreenPulse</span>
          </div>
          <div className="side-label" style={{ marginTop: 6 }}>
            {area}
          </div>
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
                onChange={(e) => onSite && onSite(e.target.value)}
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
                  onClick={() => onTabChange && onTabChange(t.id)}
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
          <div>
            <b>{user.title}</b>
            <small>{user.org}</small>
          </div>
          <button id="logout" className="logout" onClick={onLogout}>
            Log out
          </button>
        </div>
      </aside>

      {/* Main Focused Content View */}
      <main className="main">{children}</main>
    </div>
  );
}
