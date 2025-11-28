
import React, { useState } from 'react';
import { Upload, FileUp, AlertTriangle, CheckCircle2, Download, Eye, X, Table as TableIcon } from 'lucide-react';
import { ValidationResult, ValidationMismatch, FullValidationRow } from '../types';

const ValidationPage: React.FC = () => {
  const [fileIT, setFileIT] = useState<File | null>(null);
  const [fileMaster, setFileMaster] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [selectedMismatch, setSelectedMismatch] = useState<ValidationMismatch | null>(null);
  const [showFullReport, setShowFullReport] = useState(false);
  
  // Filter state for the full report modal
  const [reportFilter, setReportFilter] = useState<'ALL' | 'MATCH' | 'MISMATCH'>('ALL');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'IT' | 'MASTER') => {
    if (e.target.files && e.target.files[0]) {
      if (type === 'IT') setFileIT(e.target.files[0]);
      else setFileMaster(e.target.files[0]);
      setResult(null);
    }
  };

  const downloadTemplate = (type: 'IT' | 'MASTER') => {
    let content = '';
    let filename = '';

    if (type === 'IT') {
        // Template based on Gambar 1 (Data IT)
        content = 'ORIGIN,DEST,SYS_CODE,SERVICE,TARIF,SLA_FORM,SLA_THRU\nMES10612,AMI10000,MES10612AMI10000,REG23,59000,3,5';
        filename = 'Template_Data_IT.csv';
    } else {
        // Template based on Gambar 2 (Master Data) - UPDATED to match IT structure (removed 3 Code, City, etc)
        content = 'ORIGIN,DEST,SYS_CODE,Service REG,Tarif REG,sla form REG,sla thru REG\nDJJ10000,AMI10000,DJJ10000AMI10000,REG23,107000,4,5';
        filename = 'Template_Master_Data.csv';
    }

    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const downloadFullReport = (rowsToDownload?: FullValidationRow[]) => {
    if (!result) return;
    
    const data = rowsToDownload || result.fullReport;

    // Header matching Gambar 2 (Updated: Removed 3 Code)
    const header = [
        'ORIGIN', 'DEST', 'SYS_CODE', 
        'Service REG', 'Tarif REG', 'sla form REG', 'sla thru REG', 
        'SERVICE', 'TARIF', 'SLA_FORM', 'SLA_THRU', 'Keterangan'
    ].join(',');

    const rows = data.map(row => [
        row.origin,
        row.dest,
        row.sysCode,
        row.serviceMaster,
        row.tarifMaster,
        row.slaFormMaster,
        row.slaThruMaster,
        row.serviceIT,
        row.tarifIT,
        row.slaFormIT,
        row.slaThruIT,
        `"${row.keterangan}"` // Quote to handle commas in description
    ].join(','));

    const content = [header, ...rows].join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = reportFilter === 'ALL' ? 'Laporan_Validasi_Full.csv' : `Laporan_Validasi_${reportFilter}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const processValidation = () => {
    if (!fileIT || !fileMaster) return;
    
    setIsValidating(true);

    // SIMULATION of validation logic
    setTimeout(() => {
        // Generate mock full report data (250 rows)
        const fullReport: FullValidationRow[] = [];
        const mismatches: ValidationMismatch[] = [];

        // 1. Generate Matching Rows
        for (let i = 0; i < 242; i++) {
            fullReport.push({
                origin: `DJJ100${i.toString().padStart(2, '0')}`,
                dest: `AMI100${i.toString().padStart(2, '0')}`,
                sysCode: `DJJ100${i}AMI100${i}`,
                serviceMaster: 'REG23',
                tarifMaster: 59000,
                slaFormMaster: 3,
                slaThruMaster: 5,
                serviceIT: 'REG23',
                tarifIT: 59000,
                slaFormIT: 3,
                slaThruIT: 5,
                keterangan: 'Sesuai'
            });
        }

        // 2. Add Mismatch Rows
        // Row 243: Tarif Mismatch
        fullReport.push({
            origin: 'MES10612', dest: 'AMI10010', sysCode: 'MES10612AMI10010',
            serviceMaster: 'REG23', tarifMaster: 60000, slaFormMaster: 3, slaThruMaster: 5,
            serviceIT: 'REG23', tarifIT: 62000, slaFormIT: 3, slaThruIT: 6,
            keterangan: 'Tidak sesuai : Tarif, SLA_THRU'
        });
        mismatches.push({
            rowId: 243,
            reasons: ['Tarif tidak sesuai', 'SLA_THRU tidak sesuai'],
            details: [
                { column: 'Service', itValue: 'REG23', masterValue: 'REG23', isMatch: true },
                { column: 'Tarif', itValue: 62000, masterValue: 60000, isMatch: false },
                { column: 'sla_form', itValue: 3, masterValue: 3, isMatch: true },
                { column: 'sla_thru', itValue: 6, masterValue: 5, isMatch: false },
            ]
        });

        // Other mismatches for demo
        for(let k=0; k<7; k++) {
             fullReport.push({
                origin: `MES106${k}`, dest: `AMI2020${k}`, sysCode: `MES106${k}AMI2020${k}`,
                serviceMaster: 'REG23', tarifMaster: 78000, slaFormMaster: 4, slaThruMaster: 7,
                serviceIT: 'YES19', tarifIT: 78000, slaFormIT: 4, slaThruIT: 7,
                keterangan: 'Tidak sesuai : Service'
            });
            mismatches.push({
                rowId: 244 + k,
                reasons: ['Service tidak sesuai'],
                details: [
                    { column: 'Service', itValue: 'YES19', masterValue: 'REG23', isMatch: false },
                    { column: 'Tarif', itValue: 78000, masterValue: 78000, isMatch: true },
                    { column: 'sla_form', itValue: 4, masterValue: 4, isMatch: true },
                    { column: 'sla_thru', itValue: 7, masterValue: 7, isMatch: true },
                ]
            });
        }

        const mockResult: ValidationResult = {
            totalRows: 250,
            matches: 242,
            mismatches: mismatches,
            fullReport: fullReport
        };
        setResult(mockResult);
        setIsValidating(false);
    }, 1500);
  };

  const handleOpenReport = (filter: 'ALL' | 'MATCH' | 'MISMATCH') => {
      setReportFilter(filter);
      setShowFullReport(true);
  };

  const getDisplayedRows = () => {
      if (!result) return [];
      if (reportFilter === 'ALL') return result.fullReport;
      if (reportFilter === 'MATCH') return result.fullReport.filter(r => r.keterangan === 'Sesuai');
      if (reportFilter === 'MISMATCH') return result.fullReport.filter(r => r.keterangan !== 'Sesuai');
      return [];
  };

  const displayedRows = getDisplayedRows();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Validasi Data Otomatis</h2>
        <p className="text-slate-500 max-w-2xl mx-auto">
            Upload <strong>Data IT</strong> dan <strong>Master Data</strong>. Sistem akan memvalidasi kolom:
            <span className="font-mono text-accent bg-blue-50 px-1 rounded ml-1">Service</span>, 
            <span className="font-mono text-accent bg-blue-50 px-1 rounded ml-1">Tarif</span>, 
            <span className="font-mono text-accent bg-blue-50 px-1 rounded ml-1">sla_form</span>, dan 
            <span className="font-mono text-accent bg-blue-50 px-1 rounded ml-1">sla_thru</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Card 1: Data IT */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center hover:border-accent transition group relative">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <FileUp size={24} />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">Template Data IT</h3>
            <p className="text-xs text-slate-400 mb-3">Upload file CSV/Excel</p>
            
            <input 
                type="file" 
                onChange={(e) => handleFileChange(e, 'IT')}
                className="hidden" 
                id="file-it" 
                accept=".csv, .xlsx, .xls"
            />
            <label 
                htmlFor="file-it" 
                className="cursor-pointer px-4 py-2 border border-dashed border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:border-accent transition w-full truncate mb-3"
            >
                {fileIT ? fileIT.name : 'Click to Upload'}
            </label>

            <button 
                onClick={() => downloadTemplate('IT')}
                className="text-xs text-accent hover:text-blue-700 flex items-center gap-1 font-medium border border-blue-100 px-3 py-1 rounded hover:bg-blue-50 transition"
            >
                <Download size={12}/> Download Template IT
            </button>
            
            {fileIT && <span className="absolute top-4 right-4 text-green-500"><CheckCircle2 size={20}/></span>}
        </div>

        {/* Upload Card 2: Master Data */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center hover:border-accent transition group relative">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <FileUp size={24} />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">Template Master Data</h3>
            <p className="text-xs text-slate-400 mb-3">Upload file CSV/Excel</p>
            
            <input 
                type="file" 
                onChange={(e) => handleFileChange(e, 'MASTER')}
                className="hidden" 
                id="file-master" 
                accept=".csv, .xlsx, .xls"
            />
            <label 
                htmlFor="file-master" 
                className="cursor-pointer px-4 py-2 border border-dashed border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:border-accent transition w-full truncate mb-3"
            >
                {fileMaster ? fileMaster.name : 'Click to Upload'}
            </label>

            <button 
                onClick={() => downloadTemplate('MASTER')}
                className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1 font-medium border border-purple-100 px-3 py-1 rounded hover:bg-purple-50 transition"
            >
                <Download size={12}/> Download Template Master
            </button>
            
            {fileMaster && <span className="absolute top-4 right-4 text-green-500"><CheckCircle2 size={20}/></span>}
        </div>
      </div>

      <div className="flex justify-center">
        <button 
            disabled={!fileIT || !fileMaster || isValidating}
            onClick={processValidation}
            className={`
                px-8 py-3 rounded-full font-semibold shadow-lg transition flex items-center gap-2
                ${(!fileIT || !fileMaster) 
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                    : 'bg-accent text-white hover:bg-blue-600 hover:scale-105'}
            `}
        >
            {isValidating ? (
                <>Processing...</>
            ) : (
                <>
                    <Upload size={20} />
                    Mulai Validasi
                </>
            )}
        </button>
      </div>

      {/* Validation Results Summary */}
      {result && (
          <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-8">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-lg text-slate-800">Hasil Validasi</h3>
                  <div className="flex gap-2">
                    <button 
                        onClick={() => handleOpenReport('ALL')}
                        className="text-slate-500 text-sm flex items-center gap-1 hover:text-accent border border-slate-200 px-3 py-1 rounded hover:bg-slate-50 transition"
                    >
                        <TableIcon size={16} /> Lihat Detail Table
                    </button>
                    <button 
                        onClick={() => downloadFullReport()}
                        className="text-accent text-sm flex items-center gap-1 hover:underline font-medium"
                    >
                        <Download size={16} /> Download Report
                    </button>
                  </div>
              </div>
              
              {/* Clickable Summary Cards */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div 
                    onClick={() => handleOpenReport('ALL')}
                    className="bg-blue-50 p-4 rounded-lg border border-blue-100 hover:bg-blue-100 transition cursor-pointer"
                    title="Klik untuk melihat semua data"
                >
                    <p className="text-sm text-blue-600 mb-1">Total Data</p>
                    <p className="text-3xl font-bold text-blue-800">{result.totalRows}</p>
                </div>
                <div 
                    onClick={() => handleOpenReport('MATCH')}
                    className="bg-green-50 p-4 rounded-lg border border-green-100 hover:bg-green-100 transition cursor-pointer"
                    title="Klik untuk melihat data sesuai"
                >
                    <p className="text-sm text-green-600 mb-1">Data Sesuai</p>
                    <p className="text-3xl font-bold text-green-800">{result.matches}</p>
                </div>
                <div 
                    onClick={() => handleOpenReport('MISMATCH')}
                    className="bg-red-50 p-4 rounded-lg border border-red-100 hover:bg-red-100 transition cursor-pointer"
                    title="Klik untuk melihat data tidak sesuai"
                >
                    <p className="text-sm text-red-600 mb-1">Tidak Sesuai</p>
                    <p className="text-3xl font-bold text-red-800">{result.totalRows - result.matches}</p>
                </div>
              </div>

              {result.mismatches.length > 0 && (
                <div className="border-t border-slate-200">
                    <div className="bg-slate-50 px-6 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Quick List Ketidaksesuaian (Klik untuk detail per baris)
                    </div>
                    <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                        {result.mismatches.map((item, idx) => (
                            <div 
                                key={idx} 
                                onClick={(e) => { e.stopPropagation(); setSelectedMismatch(item); }}
                                className="px-6 py-3 flex items-center justify-between hover:bg-blue-50 cursor-pointer group transition"
                            >
                                <div className="flex items-start gap-3">
                                    <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">Row ID: {item.rowId}</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {item.reasons.map((reason, rIdx) => (
                                                <span key={rIdx} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                                    {reason}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <Eye size={16} className="text-slate-300 group-hover:text-accent" />
                            </div>
                        ))}
                    </div>
                </div>
              )}
          </div>
      )}

      {/* FULL REPORT MODAL (Matches Gambar 2) */}
      {showFullReport && result && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-[95vw] max-h-[90vh] flex flex-col animate-in zoom-in-95">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 flex-shrink-0">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                           <TableIcon size={20} className="text-accent" />
                           Laporan Validasi: {reportFilter === 'ALL' ? 'Semua Data' : (reportFilter === 'MATCH' ? 'Data Sesuai' : 'Data Tidak Sesuai')}
                        </h3>
                        <p className="text-xs text-slate-500">Menampilkan {displayedRows.length} data</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => downloadFullReport(displayedRows)}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm transition"
                        >
                            <Download size={16} /> Download CSV
                        </button>
                        <button 
                            onClick={() => setShowFullReport(false)}
                            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded transition"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-xs text-left border-collapse">
                        <thead className="sticky top-0 z-10 shadow-sm">
                            <tr className="uppercase text-slate-800 font-bold border-b border-slate-300">
                                {/* Yellow Headers (Keys) */}
                                <th className="bg-yellow-300 px-2 py-3 border-r border-slate-300 min-w-[100px]">ORIGIN</th>
                                <th className="bg-yellow-300 px-2 py-3 border-r border-slate-300 min-w-[100px]">DEST</th>
                                <th className="bg-yellow-300 px-2 py-3 border-r border-slate-300 min-w-[150px]">SYS_CODE</th>
                                
                                {/* Grey Headers (Master Data) - Removed 3 Code */}
                                <th className="bg-slate-200 px-2 py-3 border-r border-slate-300 min-w-[80px]">Service REG</th>
                                <th className="bg-slate-200 px-2 py-3 border-r border-slate-300 min-w-[80px]">Tarif REG</th>
                                <th className="bg-slate-200 px-2 py-3 border-r border-slate-300 min-w-[80px]">sla form REG</th>
                                <th className="bg-slate-200 px-2 py-3 border-r border-slate-300 min-w-[80px]">sla thru REG</th>

                                {/* White Headers (IT Data) */}
                                <th className="bg-white px-2 py-3 border-r border-slate-200 min-w-[80px]">SERVICE</th>
                                <th className="bg-white px-2 py-3 border-r border-slate-200 min-w-[80px]">TARIF</th>
                                <th className="bg-white px-2 py-3 border-r border-slate-200 min-w-[80px]">SLA_FORM</th>
                                <th className="bg-white px-2 py-3 border-r border-slate-200 min-w-[80px]">SLA_THRU</th>

                                {/* Keterangan Header */}
                                <th className="bg-white px-2 py-3 min-w-[200px]">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {displayedRows.length > 0 ? (
                                displayedRows.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50 transition">
                                        <td className="px-2 py-2 border-r border-slate-100">{row.origin}</td>
                                        <td className="px-2 py-2 border-r border-slate-100">{row.dest}</td>
                                        <td className="px-2 py-2 border-r border-slate-100">{row.sysCode}</td>
                                        
                                        {/* Master Data */}
                                        <td className="px-2 py-2 border-r border-slate-100 bg-slate-50">{row.serviceMaster}</td>
                                        <td className="px-2 py-2 border-r border-slate-100 bg-slate-50 text-right">{row.tarifMaster.toLocaleString()}</td>
                                        <td className="px-2 py-2 border-r border-slate-100 bg-slate-50 text-center">{row.slaFormMaster}</td>
                                        <td className="px-2 py-2 border-r border-slate-100 bg-slate-50 text-center">{row.slaThruMaster}</td>

                                        {/* IT Data */}
                                        <td className="px-2 py-2 border-r border-slate-100">{row.serviceIT}</td>
                                        <td className="px-2 py-2 border-r border-slate-100 text-right">{row.tarifIT.toLocaleString()}</td>
                                        <td className="px-2 py-2 border-r border-slate-100 text-center">{row.slaFormIT}</td>
                                        <td className="px-2 py-2 border-r border-slate-100 text-center">{row.slaThruIT}</td>

                                        {/* Keterangan */}
                                        <td className={`px-2 py-2 font-medium ${row.keterangan === 'Sesuai' ? 'text-slate-800' : 'text-red-600'}`}>
                                            {row.keterangan}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={12} className="px-6 py-12 text-center text-slate-400">
                                        Tidak ada data untuk filter ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      {/* Mismatch Detail Modal (Existing row detailed view) */}
      {selectedMismatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">Detail Ketidaksesuaian</h3>
                        <p className="text-sm text-slate-500">Row ID: {selectedMismatch.rowId}</p>
                    </div>
                    <button onClick={() => setSelectedMismatch(null)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Column</th>
                                <th className="px-4 py-3">Data IT (Uploaded)</th>
                                <th className="px-4 py-3">Master Data</th>
                                <th className="px-4 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {selectedMismatch.details.map((detail, idx) => (
                                <tr key={idx} className={!detail.isMatch ? "bg-red-50/50" : ""}>
                                    <td className="px-4 py-3 font-medium text-slate-700">{detail.column}</td>
                                    <td className={`px-4 py-3 ${!detail.isMatch ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>
                                        {detail.itValue}
                                    </td>
                                    <td className={`px-4 py-3 ${!detail.isMatch ? 'text-green-700 font-semibold' : 'text-slate-600'}`}>
                                        {detail.masterValue}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {detail.isMatch ? (
                                            <span className="inline-flex items-center text-green-600 text-xs font-medium bg-green-100 px-2 py-1 rounded-full">
                                                <CheckCircle2 size={12} className="mr-1"/> Sesuai
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center text-red-600 text-xs font-medium bg-red-100 px-2 py-1 rounded-full">
                                                <X size={12} className="mr-1"/> Tidak Sesuai
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button 
                        onClick={() => setSelectedMismatch(null)}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition text-sm font-medium"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ValidationPage;
