import React from 'react';

const STATUS_CONFIG = {
  pending:         { label: 'Pending',          color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  submitted:       { label: 'Submitted',         color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  submitted_video: { label: 'Video Submitted',   color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  payment_review:  { label: 'Payment Review',    color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  approved:        { label: 'Approved',          color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  rejected:        { label: 'Rejected',          color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  paid:            { label: 'Paid',              color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  completed:       { label: 'Completed',         color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  pending_signature: { label: 'Awaiting Signature', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  pending_payment:   { label: 'Pending Payment',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  signed:          { label: 'Signed',            color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: '#9ca3af', bg: 'rgba(156,163,175,0.12)' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.03em',
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.color}33`,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
      {cfg.label}
    </span>
  );
}
