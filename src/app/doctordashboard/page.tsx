'use client';
import React, { use, useState } from 'react';
import { Patient, Appointment, Prescription, mockPatients, mockAppointments } from '../types/types';

interface DoctorDashboardProps {
  onLogout: () => void;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ onLogout }) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<'patients' | 'appointments'>('patients');
  const [prescription, setPrescription] = useState<Prescription | null>(null);

  const generatePrescription = (
    symptoms: string,
    diagnosis: string
  ): Omit<Prescription, 'patientName' | 'date' | 'doctorName'> => { 
    const prescriptions = {
      Hypertension: {
        medications: ['Lisinopril 10mg - Once daily', 'Amlodipine 5mg - Once daily'],
        instructions: 'Take with food. Monitor blood pressure daily. Avoid excessive salt intake.',
        followUp: '2 weeks',
      },
      Migraine: {
        medications: ['Sumatriptan 50mg - As needed', 'Propranolol 40mg - Twice daily (preventive)'],
        instructions: 'Take sumatriptan at onset of headache. Avoid known triggers. Stay hydrated.',
        followUp: '1 month',
      },
      'Common Cold': {
        medications: ['Paracetamol 500mg - Every 6 hours', 'Cetirizine 10mg - Once daily'],
        instructions: 'Rest well. Increase fluid intake. Use humidifier if available.',
        followUp: '1 week if symptoms persist',
      },
    };

    return (
      prescriptions[diagnosis as keyof typeof prescriptions] || {
        medications: ['Consult with specialist for specific medication'],
        instructions: 'Follow general health guidelines. Monitor symptoms closely.',
        followUp: '1 week',
      }
    );
  };

  const handleGeneratePrescription = (patient: Patient) => {
    const generated = generatePrescription(patient.symptoms, patient.diagnosis);
    setPrescription({
      ...generated,
      patientName: patient.name,
      date: new Date().toLocaleDateString(),
      doctorName: 'Dr. Smith',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Dr. Smith</span>
            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex space-x-2 mb-6">
          {['patients', 'appointments'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'patients' | 'appointments')}
              className={`px-6 py-2 rounded-lg font-medium transition duration-200 ${
                activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'patients' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow col-span-1">
              <h2 className="text-xl font-semibold mb-4">Patient List</h2>
              <div className="space-y-3">
                {mockPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`p-4 rounded-lg cursor-pointer transition ${
                      selectedPatient?.id === patient.id
                        ? 'bg-blue-50 border-2 border-blue-300'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <h3 className="font-medium text-gray-900">{patient.name}</h3>
                    <p className="text-sm text-gray-600">Age: {patient.age}</p>
                    <p className="text-sm text-gray-600">{patient.diagnosis}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-1 lg:col-span-2">
              {selectedPatient ? (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow">
                    <h2 className="text-xl font-semibold mb-4">Patient Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Detail label="Name" value={selectedPatient.name} />
                      <Detail label="Age" value={selectedPatient.age} />
                      <Detail label="Phone" value={selectedPatient.phone} />
                      <Detail label="Last Visit" value={selectedPatient.lastVisit} />
                      <Detail label="Diagnosis" value={selectedPatient.diagnosis} full />
                      <Detail label="Symptoms" value={selectedPatient.symptoms} full />
                      <Detail label="Medical History" value={selectedPatient.history} full />
                    </div>
                    <div className="mt-6">
                      <button
                        onClick={() => handleGeneratePrescription(selectedPatient)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
                      >
                        Generate AI Prescription
                      </button>
                    </div>
                  </div>

                  {prescription && (
                    <div className="bg-white p-6 rounded-xl shadow">
                      <h2 className="text-xl font-semibold mb-4">AI Generated Prescription</h2>
                      <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                        <div>
                          <h4 className="font-medium">Patient: {prescription.patientName}</h4>
                          <p className="text-sm text-gray-600">
                            Date: {prescription.date} | Doctor: {prescription.doctorName}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Medications:</h4>
                          <ul className="list-disc list-inside">
                            {prescription.medications.map((med, idx) => (
                              <li key={idx}>{med}</li>
                            ))}
                          </ul>
                        </div>
                        <Detail label="Instructions" value={prescription.instructions} full />
                        <Detail label="Follow-up" value={prescription.followUp} full />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
                  Select a patient to view details
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Today's Appointments</h2>
            <div className="space-y-4">
              {mockAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{appointment.patientName}</h3>
                    <p className="text-sm text-gray-600">
                      {appointment.type} - {appointment.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-blue-600">{appointment.time}</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Scheduled
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const Detail = ({ label, value, full = false }: { label: string; value: any; full?: boolean }) => (
  <div className={full ? 'md:col-span-2' : ''}>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <p className="mt-1 text-gray-900">{value}</p>
  </div>
);

export default DoctorDashboard;