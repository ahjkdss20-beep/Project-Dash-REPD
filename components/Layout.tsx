import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  CheckCircle, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Database,
  UserCircle
} from 'lucide-react';
import { UserRole, SubmissionType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
  currentUserRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activePage, 
  onNavigate, 
  currentUserRole, 
  onRoleChange 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(true);

  const navItemClass = (page: string) => 
    `flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
      activePage === page 
        ? 'bg-accent text-white' 
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  const subNavItemClass = (page: string) => 
    `flex items-center gap-3 pl-12 pr-4 py-2 text-sm cursor-pointer transition-colors ${
      activePage === page 
        ? 'text-accent font-medium' 
        : 'text-slate-400 hover:text-white'
    }`;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-0'
        } bg-primary transition-all duration-300 flex-shrink-0 flex flex-col border-r border-slate-800 relative`}
      >
        <div className="p-6 flex items-center justify-between">
          <h1 className={`font-bold text-xl text-white ${!isSidebarOpen && 'hidden'}`}>
            Project<span className="text-accent">Dash</span>
          </h1>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          {/* Pengajuan Cabang Menu */}
          <div>
            <div 
              className="flex items-center justify-between px-4 py-3 text-slate-300 hover:bg-slate-800 cursor-pointer"
              onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
            >
              <div className="flex items-center gap-3">
                <FileText size={20} />
                <span>Pengajuan Cabang</span>
              </div>
              {isBranchMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
            
            {isBranchMenuOpen && (
              <div className="bg-slate-900/50 py-2">
                <div 
                  className={subNavItemClass(SubmissionType.HARGA_JUAL)}
                  onClick={() => onNavigate(SubmissionType.HARGA_JUAL)}
                >
                  Harga Jual
                </div>
                <div 
                  className={subNavItemClass(SubmissionType.BIAYA)}
                  onClick={() => onNavigate(SubmissionType.BIAYA)}
                >
                  Biaya
                </div>
                <div 
                  className={subNavItemClass(SubmissionType.ROUTING)}
                  onClick={() => onNavigate(SubmissionType.ROUTING)}
                >
                  Routing
                </div>
              </div>
            )}
          </div>

          {/* Request Data */}
          <div 
            className={navItemClass(SubmissionType.DATA_REQUEST)}
            onClick={() => onNavigate(SubmissionType.DATA_REQUEST)}
          >
            <Database size={20} />
            <span>Request Data</span>
          </div>

          {/* Validasi */}
          <div 
            className={navItemClass('VALIDASI')}
            onClick={() => onNavigate('VALIDASI')}
          >
            <CheckCircle size={20} />
            <span>Validasi Data</span>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 text-slate-400 text-xs text-center">
          &copy; 2024 Project Dashboard
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="text-slate-600 hover:text-accent"
              >
                <Menu size={24} />
              </button>
            )}
            <h2 className="text-lg font-semibold text-slate-800">{activePage}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <UserCircle size={18} className="text-slate-500" />
              <span className="text-sm text-slate-600 font-medium">Role:</span>
              <select 
                value={currentUserRole}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="bg-transparent border-none text-sm font-semibold text-accent focus:ring-0 outline-none cursor-pointer"
              >
                {Object.values(UserRole).map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;