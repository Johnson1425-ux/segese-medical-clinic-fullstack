import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import * as Tabs from '@radix-ui/react-tabs';
import { useAuth } from '../context/AuthContext';
import { visitService } from '../utils/visitService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import VitalsForm from '../components/visit/VitalsForm';
import DiagnosisForm from '../components/visit/DiagnosisForm';
import LabOrderForm from '../components/visit/LabOrderForm';
import PrescriptionForm from '../components/visit/PrescriptionForm';
import { ArrowLeft, Calendar, User, Stethoscope, FileText, HeartPulse, Clipboard } from 'lucide-react';

const VisitDetail = () => {
  const { id } = useParams();
  const { hasPermission } = useAuth();

  const { data: visitData, isLoading, error } = useQuery(
    ['visit', id],
    () => visitService.getVisitById(id),
    { staleTime: 5000 }
  );

  const visit = visitData?.data.data; // Correctly access the nested data object

  const getStatusBadge = (status) => {
    const statusClasses = {
        active: 'bg-green-100 text-green-800',
        completed: 'bg-blue-100 text-blue-800',
        cancelled: 'bg-red-100 text-red-800',
        'Pending Payment': 'bg-yellow-100 text-yellow-800',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading visit details: {error.message}</div>;
  if (!visit) return <div>Visit not found.</div>;
  
  const DetailCard = ({ title, icon: Icon, children }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center"><Icon className="w-5 h-5 mr-2 text-gray-500" />{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium text-gray-900 text-right">{value}</span>
    </div>
  );

  const tabStyle = "px-4 py-2 text-sm font-medium border-b-2 focus:outline-none transition-colors";
  const activeTabStyle = "border-blue-600 text-blue-600";
  const inactiveTabStyle = "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300";

  return (
    <div className="p-6">
      <Link to="/dashboard/visits" className="inline-flex items-center text-blue-600 hover:underline mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to My Queue
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
          <Tabs.Root defaultValue="vitals">
            <Tabs.List className="flex border-b mb-4">
              <Tabs.Trigger value="vitals" className={`${tabStyle} ${inactiveTabStyle}`} activeClassName={activeTabStyle}><HeartPulse className="inline w-4 h-4 mr-1" /> Vitals</Tabs.Trigger>
              <Tabs.Trigger value="diagnosis" className={`${tabStyle} ${inactiveTabStyle}`} activeClassName={activeTabStyle}><Stethoscope className="inline w-4 h-4 mr-1" /> Diagnosis</Tabs.Trigger>
              <Tabs.Trigger value="lab_orders" className={`${tabStyle} ${inactiveTabStyle}`} activeClassName={activeTabStyle}><Clipboard className="inline w-4 h-4 mr-1" /> Lab Orders</Tabs.Trigger>
              <Tabs.Trigger value="prescriptions" className={`${tabStyle} ${inactiveTabStyle}`} activeClassName={activeTabStyle}><FileText className="inline w-4 h-4 mr-1" /> Prescriptions</Tabs.Trigger>
            </Tabs.List>
            <div className="pt-4">
              <Tabs.Content value="vitals">
                <VitalsForm visitId={visit._id} existingVitals={visit.vitalSigns} />
              </Tabs.Content>
              <Tabs.Content value="diagnosis">
                <DiagnosisForm visitId={visit._id} existingDiagnosis={visit.diagnosis} />
              </Tabs.Content>
              <Tabs.Content value="lab_orders">
                <LabOrderForm visitId={visit._id} existingOrders={visit.labOrders} />
              </Tabs.Content>
              <Tabs.Content value="prescriptions">
                <PrescriptionForm visitId={visit._id} existingPrescriptions={visit.prescriptions} />
              </Tabs.Content>
            </div>
          </Tabs.Root>
        </div>

        {/* Right Sidebar with Info */}
        <div className="space-y-6">
          <DetailCard title="Patient" icon={User}>
            <InfoRow label="Name" value={`${visit.patient.firstName} ${visit.patient.lastName}`} />
            <InfoRow label="Patient ID" value={visit.patient.patientId} />
            <InfoRow label="Visit Status" value={getStatusBadge(visit.status)} />
          </DetailCard>

          <DetailCard title="Visit Info" icon={Calendar}>
            <InfoRow label="Reason" value={visit.reason} />
            <InfoRow label="Started At" value={new Date(visit.visitDate).toLocaleString()} />
            <InfoRow label="Doctor" value={`Dr. ${visit.doctor.firstName} ${visit.doctor.lastName}`} />
          </DetailCard>
        </div>
      </div>
    </div>
  );
};

export default VisitDetail;