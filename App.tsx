
import React, { useState } from 'react';
import Layout from './components/Layout';
import WorkflowPage from './pages/WorkflowPage';
import ValidationPage from './pages/ValidationPage';
import { UserRole, SubmissionType } from './types';

const App: React.FC = () => {
  // Navigation State
  const [activePage, setActivePage] = useState<string>(SubmissionType.HARGA_JUAL);
  
  // User Role Mock State (Global for the app to simulate different users)
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(UserRole.REQUESTER);

  const renderContent = () => {
    switch (activePage) {
      case SubmissionType.HARGA_JUAL:
      case SubmissionType.BIAYA:
      case SubmissionType.ROUTING:
        return <WorkflowPage key={activePage} type={activePage as SubmissionType} currentUserRole={currentUserRole} />;
      case SubmissionType.DATA_REQUEST:
        return <WorkflowPage key={activePage} type={SubmissionType.DATA_REQUEST} currentUserRole={currentUserRole} />;
      case 'VALIDASI_TARIF':
        return <ValidationPage key="TARIF" category="TARIF" />;
      case 'VALIDASI_BIAYA':
        return <ValidationPage key="BIAYA" category="BIAYA" />;
      default:
        return <WorkflowPage type={SubmissionType.HARGA_JUAL} currentUserRole={currentUserRole} />;
    }
  };

  return (
    <Layout 
      activePage={activePage} 
      onNavigate={setActivePage}
      currentUserRole={currentUserRole}
      onRoleChange={setCurrentUserRole}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
