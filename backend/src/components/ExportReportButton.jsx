import React from 'react';

const ExportReportButton = ({ data, svgPath }) => {
  const handleExport = async () => {
    const enrichedData = {
      ...data,
      performancePrediction: data?.performancePrediction || null
    };

    const response = await fetch("/export/technical-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: enrichedData, svgPath })
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "solar_technical_report.pdf";
    a.click();
  };

  return (
    <button onClick={handleExport}>📄 Teknik Raporu İndir</button>
  );
};

export default ExportReportButton;
