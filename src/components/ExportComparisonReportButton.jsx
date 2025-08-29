import React, { useState } from 'react';

const ExportComparisonReportButton = ({ aiLayout, fallbackLayout }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleExport = async () => {
    setIsLoading(true);
    setToast(null);
    try {
      const res = await fetch('http://localhost:5004/export-comparison-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ai: aiLayout, fallback: fallbackLayout })
      });

      if (!res.ok) throw new Error('Failed to generate comparison report');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'comparison_report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setToast('✅ Comparison report ready!');
    } catch (err) {
      console.error('❌ Error exporting comparison PDF:', err);
      setToast('❌ Failed to export comparison report.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '1rem', textAlign: 'right' }}>
      <button
        onClick={handleExport}
        disabled={isLoading}
        style={{
          padding: '10px 20px',
          backgroundColor: isLoading ? '#6c757d' : '#0d6efd',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        {isLoading ? '⏳ Generating...' : '📊 Export Comparison Report'}
      </button>
      {toast && <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{toast}</div>}
    </div>
  );
};

export default ExportComparisonReportButton;
