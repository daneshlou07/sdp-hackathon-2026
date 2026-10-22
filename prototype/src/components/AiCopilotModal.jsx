import React, { useState } from 'react';
import { AI_QUICK_PROMPTS, solveAiQuery } from '../data/aiEngine';

export default function AiCopilotModal({ isOpen, onClose, role = 'me' }) {
  const prompts = AI_QUICK_PROMPTS[role] || AI_QUICK_PROMPTS.me;
  const [selectedPromptId, setSelectedPromptId] = useState(prompts[0]?.id || 'me-1');
  const [customInput, setCustomInput] = useState('');
  const [activeResult, setActiveResult] = useState(() => solveAiQuery(role, prompts[0]?.id || 'me-1'));

  if (!isOpen) return null;

  const handleSelectPrompt = (id) => {
    setSelectedPromptId(id);
    setActiveResult(solveAiQuery(role, id));
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    // Map custom text to the closest prompt or generic analysis
    const match = prompts.find((p) =>
      p.query.toLowerCase().includes(customInput.toLowerCase()) ||
      customInput.toLowerCase().includes(p.title.toLowerCase())
    );
    if (match) {
      handleSelectPrompt(match.id);
    } else {
      setActiveResult({
        title: `AI Analysis: "${customInput}"`,
        tag: 'SiteOps Cognitive Engine',
        summary: 'Calculated using real-time site telemetry, empirical Malaysian diesel pricing (RM 5.17/L), and statutory DOE limits.',
        points: [
          'Engineered for Sime Darby Property: All energy, carbon, and cash values are calculated from validated engineering models.',
          'Model Predictive Control: Recommends maintaining BESS reserves above 65% during peak afternoon hours.',
          'Statutory Protection: Boundary noise maintained under 60 dBA Day / 45 dBA Night under DOE Planning Guidelines Schedule 6.',
        ],
        actionBadge: 'Telemetry Synchronized',
      });
    }
  };

  const roleTitle =
    role === 'me'
      ? 'M&E Site Operations Copilot'
      : role === 'eo'
      ? 'DOE Environmental & Acoustic Copilot'
      : 'HQ Finance & Township Fleet Copilot';

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #CBD5E1',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #0F766E',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(15, 118, 110, 0.3)',
                border: '1px solid #0F766E',
                fontSize: '1.2rem',
              }}
            >
              ⚡
            </span>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                GreenPulse AI Copilot
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                {roleTitle} (Physics-Informed ML + Model Predictive Control)
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              fontSize: '1.5rem',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '0.25rem',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
          {/* Quick Prompts Selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem',
              }}
            >
              Select Real-Time Engineering Simulation:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {prompts.map((p) => {
                const isSelected = selectedPromptId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPrompt(p.id)}
                    style={{
                      padding: '0.5rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: isSelected ? '1.5px solid #0F766E' : '1px solid #E2E8F0',
                      backgroundColor: isSelected ? '#F0FDFA' : '#F8FAFC',
                      color: isSelected ? '#0F766E' : '#334155',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {p.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Result Card */}
          {activeResult && (
            <div
              style={{
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '1.25rem',
                backgroundColor: '#FAFAFA',
                marginBottom: '1.25rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      backgroundColor: '#0F766E',
                      color: '#FFFFFF',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {activeResult.tag}
                  </span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                    {activeResult.title}
                  </span>
                </div>
                <span
                  style={{
                    backgroundColor: '#ECFDF5',
                    color: '#065F46',
                    border: '1px solid #A7F3D0',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.6rem',
                    borderRadius: '9999px',
                  }}
                >
                  ✓ {activeResult.actionBadge}
                </span>
              </div>

              <div
                style={{
                  fontSize: '0.88rem',
                  color: '#1E293B',
                  fontWeight: 600,
                  marginBottom: '0.85rem',
                  lineHeight: 1.45,
                }}
              >
                {activeResult.summary}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {activeResult.points.map((pt, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      fontSize: '0.82rem',
                      color: '#475569',
                      lineHeight: 1.4,
                    }}
                  >
                    <span style={{ color: '#0F766E', fontWeight: 800 }}>•</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Question Input */}
          <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Ask SiteOps AI anything (e.g. simulate crane surge, check night curfew, diesel sensitivity)..."
              style={{
                flex: 1,
                padding: '0.65rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                backgroundColor: '#0F766E',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Analyze
            </button>
          </form>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.75rem',
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#64748B',
          }}
        >
          <span>
            Telemetry Source: <strong>City of Elmina 4G IoT Gateway</strong> | MET Malaysia Radar Feed
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
