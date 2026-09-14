import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileText, Table, BarChart3, CheckCircle2 } from 'lucide-react';
import { mapLocations } from '../../data/mapLocations';

export const ExportReport = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerDownload = (filename, content, mimeType) => {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleExportFormat = (type) => {
    setIsOpen(false);

    if (type === 'geojson') {
      const geojson = {
        type: 'FeatureCollection',
        features: mapLocations.map((loc) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [loc.longitude, loc.latitude]
          },
          properties: {
            id: loc.id,
            name: loc.name,
            location: loc.location,
            risk: loc.risk,
            temperature: loc.temperature,
            humidity: loc.humidity,
            confidence: loc.confidence
          }
        }))
      };
      triggerDownload(
        'ThermalX_Fire_Risk_Synthesis.geojson',
        JSON.stringify(geojson, null, 2),
        'application/json'
      );
      setNotification('GeoJSON Exported');
    } else if (type === 'csv') {
      const headers = 'ID,Name,Location,Risk,Temperature(C),Humidity(%),ML_Confidence(%)\n';
      const rows = mapLocations
        .map(
          (l) =>
            `"${l.id}","${l.name}","${l.location}","${l.risk}",${l.temperature},${l.humidity},${l.confidence}`
        )
        .join('\n');
      triggerDownload('ThermalX_Telemetry_Log.csv', headers + rows, 'text/csv');
      setNotification('CSV Telemetry Log Exported');
    } else if (type === 'briefing') {
      const htmlContent = `<!DOCTYPE html>
<html>
<head><title>ThermalX Fire Incident Briefing</title></head>
<body style="font-family: sans-serif; padding: 20px;">
  <h2>ThermalX Fire Intelligence Briefing</h2>
  <p>Generated: ${new Date().toUTCString()}</p>
  <hr/>
  <h3>Active High-Risk Target: Industrial Zone A (Bengaluru)</h3>
  <ul>
    <li>Risk: HIGH (87.4% ML Confidence)</li>
    <li>Surface Temperature: 42.0°C</li>
    <li>Fuel Moisture: 24% (Severe Desiccation)</li>
    <li>Wind Vector: 28 km/h NW</li>
  </ul>
</body>
</html>`;
      triggerDownload('ThermalX_Incident_Briefing.html', htmlContent, 'text/html');
      setNotification('Incident Briefing Exported');
    }

    setTimeout(() => {
      setNotification('');
    }, 3000);
  };

  return (
    <div className="relative inline-flex items-center" ref={menuRef}>
      {notification && (
        <div className="absolute -top-9 right-0 bg-[#0F172A] text-white px-2.5 py-1 text-[11px] font-medium rounded shadow-lg whitespace-nowrap flex items-center gap-1.5 border border-slate-700 z-50 animate-fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Split Button */}
      <div className="inline-flex items-center rounded shadow-sm overflow-hidden border border-[#00236F]">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="h-10 px-3.5 bg-[#00236F] hover:bg-[#1E3A8A] text-white text-[12px] font-semibold transition-colors flex items-center gap-2 whitespace-nowrap focus:outline-none"
          type="button"
        >
          <Download className="w-4 h-4 text-blue-200" />
          <span>Export Report</span>
        </button>

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="h-10 px-2.5 bg-[#1E3A8A] hover:bg-[#00236F] text-white border-l border-blue-900/80 transition-colors flex items-center justify-center focus:outline-none"
          type="button"
          aria-label="Toggle export options"
        >
          <ChevronDown className={`w-4 h-4 text-blue-200 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Menu Tray */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-60 bg-white border border-slate-200 shadow-xl rounded py-1 z-50 text-[12px]">
          <div className="px-3 py-1 bg-slate-50 border-b border-slate-100">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Export Formats
            </span>
          </div>

          <div className="py-1">
            <button
              onClick={() => handleExportFormat('geojson')}
              className="w-full text-left px-3 py-2 hover:bg-slate-100 text-slate-800 flex items-center gap-2.5 transition-colors group"
              type="button"
            >
              <div className="w-7 h-7 rounded bg-blue-50 border border-blue-200 flex items-center justify-center group-hover:bg-blue-100">
                <FileText className="w-3.5 h-3.5 text-blue-700" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-slate-900">PDF / GeoJSON Synthesis</span>
                <span className="text-[10px] text-slate-500">Spatial vector & layer indices</span>
              </div>
            </button>

            <button
              onClick={() => handleExportFormat('csv')}
              className="w-full text-left px-3 py-2 hover:bg-slate-100 text-slate-800 flex items-center gap-2.5 transition-colors group"
              type="button"
            >
              <div className="w-7 h-7 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center group-hover:bg-emerald-100">
                <Table className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-slate-900">CSV Telemetry Log</span>
                <span className="text-[10px] text-slate-500">Full tabular sensor dataset</span>
              </div>
            </button>

            <button
              onClick={() => handleExportFormat('briefing')}
              className="w-full text-left px-3 py-2 hover:bg-slate-100 text-slate-800 flex items-center gap-2.5 transition-colors group"
              type="button"
            >
              <div className="w-7 h-7 rounded bg-amber-50 border border-amber-200 flex items-center justify-center group-hover:bg-amber-100">
                <BarChart3 className="w-3.5 h-3.5 text-amber-700" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-slate-900">Incident Briefing (HTML)</span>
                <span className="text-[10px] text-slate-500">Formatted executive summary</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
