import React, { useState } from 'react';
import { 
  Plus, 
  Download, 
  Upload, 
  Check, 
  ExternalLink,
  Bell,
  X,
  FileText
} from 'lucide-react';
import { UserRole, RequestStatus, Submission, SubmissionType } from '../types';

interface WorkflowPageProps {
  type: SubmissionType;
  currentUserRole: UserRole;
}

const WorkflowPage: React.FC<WorkflowPageProps> = ({ type, currentUserRole }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: 'REQ-001',
      type: type,
      title: `Contoh Pengajuan ${type}`,
      description: 'Permintaan update data Q4',
      requesterName: 'John Doe',
      date: new Date().toISOString().split('T')[0],
      status: RequestStatus.OPEN,
      formDetails: {
        reason: 'Periodic Update',
        detil: 'Update tarif zona A'
      }
    }
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [resultInput, setResultInput] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Form States
  const isDataRequest = type === SubmissionType.DATA_REQUEST;
  
  // Branch Submission Form State
  const [branchForm, setBranchForm] = useState({
    jenisPenyesuaian: [] as string[],
    detilPermintaan: '',
    alasan: ''
  });

  // Data Request Form State
  const [requestForm, setRequestForm] = useState({
    jenisData: [] as string[], // Tarif, BT/BP/BD, Product
    tujuan: ''
  });

  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let details = {};
    let title = '';

    if (isDataRequest) {
        title = `Request Data: ${requestForm.jenisData.join(', ')}`;
        details = { ...requestForm };
    } else {
        title = `Penyesuaian: ${branchForm.jenisPenyesuaian.join(', ')}`;
        details = { ...branchForm };
    }

    const newSubmission: Submission = {
      id: `REQ-${Math.floor(Math.random() * 10000)}`,
      type,
      title: title || `Pengajuan Baru`,
      requesterName: 'Current User',
      date: new Date().toISOString().split('T')[0],
      status: RequestStatus.OPEN,
      formDetails: details
    };

    setSubmissions([newSubmission, ...submissions]);
    setIsFormOpen(false);
    resetForms();
  };

  const resetForms = () => {
    setBranchForm({ jenisPenyesuaian: [], detilPermintaan: '', alasan: '' });
    setRequestForm({ jenisData: [], tujuan: '' });
  };

  const handleCheckboxChange = (
    value: string, 
    currentList: string[], 
    setter: React.Dispatch<React.SetStateAction<any>>, 
    field: string
  ) => {
    if (currentList.includes(value)) {
        setter((prev: any) => ({ ...prev, [field]: prev[field].filter((item: string) => item !== value) }));
    } else {
        setter((prev: any) => ({ ...prev, [field]: [...prev[field], value] }));
    }
  };

  const handleApprove = (id: string, currentStatus: RequestStatus) => {
    setSubmissions(prev => prev.map(sub => {
      if (sub.id !== id) return sub;

      if (currentStatus === RequestStatus.OPEN) {
        return { ...sub, status: RequestStatus.APPROVED_HEAD };
      } else if (currentStatus === RequestStatus.APPROVED_HEAD) {
        return { ...sub, status: RequestStatus.APPROVED_DEPT }; // Changes to On Process
      }
      return sub;
    }));
  };

  const handleComplete = (id: string, resultUrl: string) => {
    setSubmissions(prev => prev.map(sub => {
        if (sub.id !== id) return sub;
        return { 
            ...sub, 
            status: RequestStatus.COMPLETED,
            resultDataUrl: resultUrl
        };
    }));
    
    // Trigger Notification
    setNotification(`Data Request ${id} sudah selesai (Completed).`);
    setTimeout(() => setNotification(null), 5000); // Hide after 5s
  };

  // Status Badge
  const renderStatus = (status: RequestStatus) => {
    const styles = {
      [RequestStatus.OPEN]: 'bg-blue-100 text-blue-700 border-blue-200',
      [RequestStatus.APPROVED_HEAD]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      [RequestStatus.APPROVED_DEPT]: 'bg-orange-100 text-orange-700 border-orange-200', // Displayed as On Process
      [RequestStatus.COMPLETED]: 'bg-green-100 text-green-700 border-green-200',
    };

    const label = status === RequestStatus.APPROVED_DEPT ? 'On Process' : status;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {label}
      </span>
    );
  };

  const renderActions = (item: Submission) => {
    // 1. Head Branch Approval
    if (item.status === RequestStatus.OPEN && currentUserRole === UserRole.HEAD_BRANCH) {
      return (
        <button 
          onClick={() => handleApprove(item.id, item.status)}
          className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-sm transition"
        >
          <Check size={16} /> Approve (Head)
        </button>
      );
    }
    
    // 2. Dept Approval
    if (item.status === RequestStatus.APPROVED_HEAD && currentUserRole === UserRole.DEPARTMENT) {
      return (
        <button 
          onClick={() => handleApprove(item.id, item.status)}
          className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-sm transition"
        >
          <Check size={16} /> Approve (Dept)
        </button>
      );
    }

    // 3. Upload Result (On Process) - Available to Department or Admin
    if (item.status === RequestStatus.APPROVED_DEPT) {
       return (
         <div className="flex flex-col gap-2">
            <input 
                type="text" 
                placeholder="Input Link / Upload..." 
                className="border border-slate-300 rounded px-2 py-1 text-sm w-full"
                onChange={(e) => setResultInput(e.target.value)}
            />
            <button 
                onClick={() => handleComplete(item.id, resultInput || 'File Uploaded')}
                className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm transition"
            >
                <Upload size={14} /> Submit Selesai
            </button>
         </div>
       )
    }

    if (item.status === RequestStatus.COMPLETED) {
        return (
            <div className="flex flex-col">
                <div className="flex items-center text-green-600 text-sm font-medium gap-1">
                    <CheckCircle size={16} />
                    <span>Selesai</span>
                </div>
                {item.resultDataUrl && (
                    <a href="#" className="text-xs text-accent underline flex items-center gap-1 mt-1">
                        <ExternalLink size={10}/> View Data
                    </a>
                )}
            </div>
        )
    }

    return <span className="text-slate-400 text-sm italic">Menunggu giliran...</span>;
  };

  const CheckCircle = ({size}: {size:number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;

  return (
    <div className="space-y-6 relative">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-right-10">
          <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
             <Bell size={20} />
             <span className="font-medium">{notification}</span>
             <button onClick={() => setNotification(null)} className="ml-2 hover:bg-green-500 rounded-full p-1">
                <X size={16} />
             </button>
          </div>
        </div>
      )}

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-slate-500 text-sm font-medium">Total Request</h3>
            <p className="text-2xl font-bold text-slate-800">{submissions.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-slate-500 text-sm font-medium">Pending Approval</h3>
            <p className="text-2xl font-bold text-orange-600">
                {submissions.filter(s => s.status === RequestStatus.OPEN || s.status === RequestStatus.APPROVED_HEAD).length}
            </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-slate-500 text-sm font-medium">On Process</h3>
            <p className="text-2xl font-bold text-blue-600">
                {submissions.filter(s => s.status === RequestStatus.APPROVED_DEPT).length}
            </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-slate-500 text-sm font-medium">Completed</h3>
            <p className="text-2xl font-bold text-green-600">
                {submissions.filter(s => s.status === RequestStatus.COMPLETED).length}
            </p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <div>
                <h2 className="text-lg font-bold text-slate-800">Daftar {type}</h2>
                <p className="text-slate-500 text-sm">Kelola pengajuan, approval, dan status workflow</p>
            </div>
            {currentUserRole === UserRole.REQUESTER && (
                <button 
                    onClick={() => setIsFormOpen(true)}
                    className="bg-accent hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition shadow-sm"
                >
                    <Plus size={18} />
                    Buat Pengajuan
                </button>
            )}
        </div>

        {/* Modal Form Input */}
        {isFormOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <FileText size={20} className="text-accent" />
                            {isDataRequest ? 'Form Request Data' : 'Formulir Permintaan Penyesuaian'}
                        </h3>
                        <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Common Header Info */}
                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <div><span className="font-semibold">Nama Pemohon:</span> Current User</div>
                            <div><span className="font-semibold">Tanggal:</span> {new Date().toLocaleDateString()}</div>
                            <div><span className="font-semibold">Cabang/Dept:</span> Headquarters</div>
                        </div>

                        {/* Template Download */}
                        <div className="flex justify-between items-center border border-dashed border-slate-300 p-3 rounded-lg">
                            <span className="text-sm text-slate-500">Silahkan download template dan isi kelengkapan data.</span>
                            <button type="button" className="text-sm flex items-center gap-1 text-accent border border-accent px-3 py-1.5 rounded hover:bg-blue-50 transition">
                                <Download size={14}/> Download Template
                            </button>
                        </div>

                        {/* DYNAMIC FORM FIELDS */}
                        {isDataRequest ? (
                            // FORM REQUEST DATA (Gambar 3 style)
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Permintaan Data:</label>
                                    <div className="space-y-2">
                                        {['Data Tarif', 'Data BT / BP / BD', 'Data Product / Lainnya'].map((opt) => (
                                            <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    value={opt}
                                                    checked={requestForm.jenisData.includes(opt)}
                                                    onChange={() => handleCheckboxChange(opt, requestForm.jenisData, setRequestForm, 'jenisData')}
                                                    className="rounded text-accent focus:ring-accent"
                                                />
                                                {opt}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tujuan Penggunaan Data:</label>
                                    <textarea 
                                        required
                                        rows={3}
                                        className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-accent outline-none text-sm"
                                        value={requestForm.tujuan}
                                        onChange={e => setRequestForm({...requestForm, tujuan: e.target.value})}
                                        placeholder="Jelaskan tujuan penggunaan data..."
                                    />
                                </div>
                            </>
                        ) : (
                            // FORM PENGAJUAN CABANG (Gambar 4 style)
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Penyesuaian:</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Tarif Baru', 'Perubahan Koding Area', 'Penyesuaian Tarif', 'Perubahan Komponen Biaya', 'Tarif Baru Non Expres', 'Perubahan Coverage'].map((opt) => (
                                            <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    value={opt}
                                                    checked={branchForm.jenisPenyesuaian.includes(opt)}
                                                    onChange={() => handleCheckboxChange(opt, branchForm.jenisPenyesuaian, setBranchForm, 'jenisPenyesuaian')}
                                                    className="rounded text-accent focus:ring-accent"
                                                />
                                                {opt}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Detil Permintaan Penyesuaian:</label>
                                    <textarea 
                                        required
                                        rows={2}
                                        className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-accent outline-none text-sm"
                                        value={branchForm.detilPermintaan}
                                        onChange={e => setBranchForm({...branchForm, detilPermintaan: e.target.value})}
                                        placeholder="Deskripsikan permintaan..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Alasan Penyesuaian:</label>
                                    <textarea 
                                        required
                                        rows={2}
                                        className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-accent outline-none text-sm"
                                        value={branchForm.alasan}
                                        onChange={e => setBranchForm({...branchForm, alasan: e.target.value})}
                                        placeholder="Berikan alasan..."
                                    />
                                </div>
                            </>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button 
                                type="button" 
                                onClick={() => setIsFormOpen(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded transition"
                            >
                                Batal
                            </button>
                            <button 
                                type="submit" 
                                className="px-6 py-2 bg-accent text-white rounded hover:bg-blue-600 shadow-sm transition font-medium"
                            >
                                Submit Pengajuan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4 w-24">ID</th>
                        <th className="px-6 py-4">Judul / Detil</th>
                        <th className="px-6 py-4">Requester</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {submissions.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                            <td className="px-6 py-4 font-mono text-slate-500">{item.id}</td>
                            <td className="px-6 py-4">
                                <div className="font-medium text-slate-800">{item.title}</div>
                                <div className="text-xs text-slate-500 mt-1">{item.date}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{item.requesterName}</td>
                            <td className="px-6 py-4">{renderStatus(item.status)}</td>
                            <td className="px-6 py-4">
                                {renderActions(item)}
                            </td>
                        </tr>
                    ))}
                    {submissions.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                Belum ada data pengajuan.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default WorkflowPage;