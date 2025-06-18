'use client';
import React, { useState, useEffect, useRef } from 'react';

// Define types
type AppointmentType = 'Consultation' | 'Follow-up' | 'Check-up' | 'Emergency' | 'Surgery' | 'Therapy';
type AppointmentStatus = 'Scheduled' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show';
type PaymentStatus = 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';
type InsuranceProvider = 'Blue Cross' | 'Aetna' | 'UnitedHealth' | 'Medicare' | 'Medicaid' | 'Self Pay';
type StaffType = 'Doctor' | 'Nurse' | 'Technician' | 'Admin';

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  insurance: InsuranceProvider;
  insuranceId: string;
  medicalHistory: string[];
  allergies: string[];
  medications: string[];
  lastVisit: string;
  totalVisits: number;
}

interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  date: string;
  time: string;
  duration: number;
  type: AppointmentType;
  status: AppointmentStatus;
  doctorId: number;
  doctorName: string;
  notes: string;
  roomNumber?: string;
}

interface Bill {
  id: number;
  patientId: number;
  patientName: string;
  appointmentId: number;
  amount: number;
  paymentStatus: PaymentStatus;
  dueDate: string;
  services: string[];
  insuranceCovered: number;
  patientOwes: number;
  createdDate: string;
}

interface Staff {
  id: number;
  name: string;
  type: StaffType;
  phone: string;
  email: string;
  schedule: { [key: string]: string[] }; // day: ["09:00-17:00"]
  isAvailable: boolean;
}

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  cost: number;
  supplier: string;
  lastUpdated: string;
}

interface QueueItem {
  id: number;
  patientName: string;
  appointmentTime: string;
  status: 'Waiting' | 'Called' | 'In Room' | 'Done';
  waitTime: number;
  priority: 'Normal' | 'High' | 'Emergency';
}

// Mock data
const mockPatients: Patient[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1985-03-15',
    phone: '(555) 123-4567',
    email: 'john.doe@email.com',
    address: '123 Main St, City, State 12345',
    emergencyContact: 'Jane Doe',
    emergencyPhone: '(555) 987-6543',
    insurance: 'Blue Cross',
    insuranceId: 'BC12345678',
    medicalHistory: ['Hypertension', 'Diabetes Type 2'],
    allergies: ['Penicillin'],
    medications: ['Metformin', 'Lisinopril'],
    lastVisit: '2024-05-15',
    totalVisits: 12
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    dateOfBirth: '1990-07-22',
    phone: '(555) 234-5678',
    email: 'jane.smith@email.com',
    address: '456 Oak Ave, City, State 12345',
    emergencyContact: 'Bob Smith',
    emergencyPhone: '(555) 876-5432',
    insurance: 'Aetna',
    insuranceId: 'AE87654321',
    medicalHistory: ['Asthma'],
    allergies: ['Shellfish'],
    medications: ['Albuterol'],
    lastVisit: '2024-06-10',
    totalVisits: 8
  }
];

const mockAppointments: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    patientName: 'John Doe',
    date: '2024-06-18',
    time: '10:00 AM',
    duration: 30,
    type: 'Check-up',
    status: 'Confirmed',
    doctorId: 1,
    doctorName: 'Dr. Williams',
    notes: 'Annual physical examination',
    roomNumber: 'Room 101'
  },
  {
    id: 2,
    patientId: 2,
    patientName: 'Jane Smith',
    date: '2024-06-18',
    time: '11:30 AM',
    duration: 45,
    type: 'Follow-up',
    status: 'Confirmed',
    doctorId: 2,
    doctorName: 'Dr. Johnson',
    notes: 'Follow-up for asthma treatment',
    roomNumber: 'Room 102'
  }
];

const mockStaff: Staff[] = [
  {
    id: 1,
    name: 'Dr. Williams',
    type: 'Doctor',
    phone: '(555) 111-2222',
    email: 'dr.williams@clinic.com',
    schedule: {
      'Monday': ['09:00-17:00'],
      'Tuesday': ['09:00-17:00'],
      'Wednesday': ['09:00-17:00'],
      'Thursday': ['09:00-17:00'],
      'Friday': ['09:00-15:00']
    },
    isAvailable: true
  },
  {
    id: 2,
    name: 'Dr. Johnson',
    type: 'Doctor',
    phone: '(555) 333-4444',
    email: 'dr.johnson@clinic.com',
    schedule: {
      'Monday': ['10:00-18:00'],
      'Tuesday': ['10:00-18:00'],
      'Wednesday': ['10:00-18:00'],
      'Thursday': ['10:00-18:00'],
      'Friday': ['10:00-16:00']
    },
    isAvailable: true
  }
];

const mockInventory: InventoryItem[] = [
  {
    id: 1,
    name: 'Disposable Gloves',
    category: 'PPE',
    currentStock: 500,
    minimumStock: 100,
    cost: 0.15,
    supplier: 'MedSupply Co.',
    lastUpdated: '2024-06-15'
  },
  {
    id: 2,
    name: 'Blood Pressure Cuffs',
    category: 'Equipment',
    currentStock: 8,
    minimumStock: 5,
    cost: 45.00,
    supplier: 'MedEquip Inc.',
    lastUpdated: '2024-06-10'
  }
];

const mockBills: Bill[] = [
  {
    id: 1,
    patientId: 1,
    patientName: 'John Doe',
    appointmentId: 1,
    amount: 250.00,
    paymentStatus: 'Pending',
    dueDate: '2024-07-18',
    services: ['Physical Examination', 'Blood Work'],
    insuranceCovered: 200.00,
    patientOwes: 50.00,
    createdDate: '2024-06-18'
  }
];

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface FrontDeskDashboardProps {
  onLogout: () => void;
}

const FrontDeskDashboard: React.FC<FrontDeskDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [staff, setStaff] = useState<Staff[]>(mockStaff);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [recognitionSupported, setRecognitionSupported] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState<boolean>(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState<boolean>(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  
  const [newAppointment, setNewAppointment] = useState({
    patientId: 0,
    patientName: '',
    date: '',
    time: '',
    duration: 30,
    type: 'Consultation' as AppointmentType,
    doctorId: 1,
    notes: ''
  });

  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    insurance: 'Blue Cross' as InsuranceProvider,
    insuranceId: ''
  });

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const checkRecognitionSupport = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      return !!SpeechRecognition;
    };

    const initializeRecognition = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + ' ' + finalTranscript);
          parseVoiceInput(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
    };

    if (checkRecognitionSupport()) {
      setRecognitionSupported(true);
      initializeRecognition();
    }

    // Initialize queue with today's appointments
    const todayQueue = appointments
      .filter(apt => apt.date === new Date().toISOString().split('T')[0])
      .map(apt => ({
        id: apt.id,
        patientName: apt.patientName,
        appointmentTime: apt.time,
        status: 'Waiting' as const,
        waitTime: 0,
        priority: apt.type === 'Emergency' ? 'Emergency' as const : 'Normal' as const
      }));
    setQueue(todayQueue);
  }, [appointments]);

  const parseVoiceInput = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Enhanced parsing logic
    const nameMatch = lowerText.match(/(?:book|schedule|appointment for|patient)\s+([a-zA-Z\s]+)/);
    const dateMatch = lowerText.match(/(?:on|for)\s+(\w+\s+\d{1,2}|\d{1,2}\/\d{1,2}|\d{1,2}-\d{1,2})/);
    const timeMatch = lowerText.match(/(?:at|time)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))/);
    
    // Check for search commands
    if (lowerText.includes('search for') || lowerText.includes('find patient')) {
      const searchMatch = lowerText.match(/(?:search for|find patient)\s+([a-zA-Z\s]+)/);
      if (searchMatch) {
        setSearchTerm(searchMatch[1].trim());
        setActiveTab('patients');
      }
    }
    
    // Check for navigation commands
    if (lowerText.includes('show appointments')) {
      setActiveTab('appointments');
    } else if (lowerText.includes('show patients')) {
      setActiveTab('patients');
    } else if (lowerText.includes('show billing')) {
      setActiveTab('billing');
    }
    
    if (nameMatch) {
      setNewAppointment(prev => ({
        ...prev,
        patientName: nameMatch[1].trim()
      }));
    }
    
    if (dateMatch) {
      setNewAppointment(prev => ({
        ...prev,
        date: dateMatch[1]
      }));
    }
    
    if (timeMatch) {
      setNewAppointment(prev => ({
        ...prev,
        time: timeMatch[1]
      }));
    }
  };

  const startRecording = () => {
    if (recognitionSupported && recognitionRef.current) {
      setIsRecording(true);
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(false);
      recognitionRef.current.stop();
    }
  };

  const bookAppointment = () => {
    if (newAppointment.patientName && newAppointment.date && newAppointment.time) {
      const appointment: Appointment = {
        id: appointments.length + 1,
        patientId: newAppointment.patientId || 0,
        patientName: newAppointment.patientName,
        date: newAppointment.date,
        time: newAppointment.time,
        duration: newAppointment.duration,
        type: newAppointment.type,
        status: 'Scheduled',
        doctorId: newAppointment.doctorId,
        doctorName: staff.find(s => s.id === newAppointment.doctorId)?.name || 'Dr. Williams',
        notes: newAppointment.notes
      };
      setAppointments([...appointments, appointment]);
      setNewAppointment({
        patientId: 0,
        patientName: '',
        date: '',
        time: '',
        duration: 30,
        type: 'Consultation',
        doctorId: 1,
        notes: ''
      });
      setTranscript('');
      setShowAppointmentModal(false);
    }
  };

  const addPatient = () => {
    if (newPatient.firstName && newPatient.lastName && newPatient.phone) {
      const patient: Patient = {
        id: patients.length + 1,
        ...newPatient,
        medicalHistory: [],
        allergies: [],
        medications: [],
        lastVisit: '',
        totalVisits: 0
      };
      setPatients([...patients, patient]);
      setNewPatient({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        phone: '',
        email: '',
        address: '',
        emergencyContact: '',
        emergencyPhone: '',
        insurance: 'Blue Cross',
        insuranceId: ''
      });
      setShowPatientModal(false);
    }
  };

  const updateAppointmentStatus = (appointmentId: number, status: AppointmentStatus) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId ? { ...apt, status } : apt
    ));
    
    // Update queue status
    setQueue(queue.map(q => 
      q.id === appointmentId ? { 
        ...q, 
        status: status === 'In Progress' ? 'In Room' : 
                status === 'Completed' ? 'Done' : q.status 
      } : q
    ));
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todayAppointments = appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]);
  const lowStockItems = inventory.filter(item => item.currentStock <= item.minimumStock);
  const overduePayments = bills.filter(bill => bill.paymentStatus === 'Overdue');












  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{todayAppointments.length}</div>
          <div className="text-gray-600">Today's Appointments</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{patients.length}</div>
          <div className="text-gray-600">Total Patients</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-orange-600">{queue.filter(q => q.status === 'Waiting').length}</div>
          <div className="text-gray-600">Patients Waiting</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-red-600">{lowStockItems.length}</div>
          <div className="text-gray-600">Low Stock Alerts</div>
        </div>
      </div>










      {/* Today's Schedule & Patient Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Today's Schedule</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {todayAppointments.map(appointment => (
              <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">{appointment.patientName}</h4>
                  <p className="text-sm text-gray-600">{appointment.type} - {appointment.doctorName}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-blue-600">{appointment.time}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    appointment.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Patient Queue</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {queue.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">{item.patientName}</h4>
                  <p className="text-sm text-gray-600">Appointment: {item.appointmentTime}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.priority === 'Emergency' ? 'bg-red-100 text-red-800' :
                    item.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {item.priority}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">{item.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Appointments</h2>
        <button
          onClick={() => setShowAppointmentModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Schedule Appointment
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map(appointment => (
                <tr key={appointment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{appointment.patientName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{appointment.date}</div>
                    <div className="text-sm text-gray-500">{appointment.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{appointment.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{appointment.doctorName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={appointment.status}
                      onChange={(e) => updateAppointmentStatus(appointment.id, e.target.value as AppointmentStatus)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="No Show">No Show</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPatients = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Patients</h2>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setShowPatientModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Add Patient
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map(patient => (
          <div key={patient.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{patient.firstName} {patient.lastName}</h3>
                <p className="text-gray-600">DOB: {patient.dateOfBirth}</p>
              </div>
              <button
                onClick={() => setSelectedPatient(patient)}
                className="text-blue-600 hover:text-blue-800"
              >
                View Details
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Phone:</strong> {patient.phone}</p>
              <p><strong>Insurance:</strong> {patient.insurance}</p>
              <p><strong>Last Visit:</strong> {patient.lastVisit || 'N/A'}</p>
              <p><strong>Total Visits:</strong> {patient.totalVisits}</p>
            </div>
            {patient.allergies.length > 0 && (
              <div className="mt-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Allergies: {patient.allergies.join(', ')}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderBilling = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Billing & Payments</h2>
      
      {overduePayments.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">Overdue Payments ({overduePayments.length})</h3>
          <div className="space-y-2">
            {overduePayments.map(bill => (
              <div key={bill.id} className="text-sm text-red-700">
                {bill.patientName} - ${bill.patientOwes} (Due: {bill.dueDate})
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insurance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Owes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bills.map(bill => (
                <tr key={bill.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{bill.patientName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${bill.amount.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${bill.insuranceCovered.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${bill.patientOwes.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      bill.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                      bill.paymentStatus === 'Overdue' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {bill.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {bill.dueDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-green-600 hover:text-green-900 mr-3">Process Payment</button>
                    <button className="text-blue-600 hover:text-blue-900">Send Invoice</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Inventory Management</h2>
      
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Low Stock Alerts ({lowStockItems.length})</h3>
          <div className="space-y-2">
            {lowStockItems.map(item => (
              <div key={item.id} className="text-sm text-yellow-700">
                {item.name} - Current: {item.currentStock}, Minimum: {item.minimumStock}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.map(item => (
                <tr key={item.id} className={item.currentStock <= item.minimumStock ? 'bg-yellow-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      item.currentStock <= item.minimumStock ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {item.currentStock}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.minimumStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${item.cost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.supplier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Reorder</button>
                    <button className="text-green-600 hover:text-green-900">Update Stock</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderStaff = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Staff Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map(member => (
          <div key={member.id} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{member.name}</h3>
                <p className="text-gray-600">{member.type}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                member.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {member.isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Phone:</strong> {member.phone}</p>
              <p><strong>Email:</strong> {member.email}</p>
            </div>
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">This Week's Schedule:</h4>
              <div className="space-y-1 text-xs">
                {Object.entries(member.schedule).map(([day, hours]) => (
                  <div key={day} className="flex justify-between">
                    <span className="font-medium">{day}:</span>
                    <span>{hours.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVoiceBooking = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Voice Assistant</h2>
      
      {!recognitionSupported ? (
        <div className="text-center p-8">
          <p className="text-red-600 mb-4">Speech recognition is not supported in your browser.</p>
          <p className="text-gray-600">Please use Chrome, Safari, or Edge for voice features.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <div className="relative inline-block">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl transition duration-300 ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 recording-animation' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isRecording ? '🛑' : '🎤'}
              </button>
              {isRecording && (
                <div className="absolute inset-0 w-20 h-20 rounded-full bg-red-400 pulse-ring"></div>
              )}
            </div>
            <p className="mt-4 text-gray-600">
              {isRecording ? 'Listening... Click to stop' : 'Click to start voice commands'}
            </p>
          </div>

          {transcript && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Voice Transcript:</h4>
              <p className="text-gray-700">{transcript}</p>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Voice Commands:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• "Book appointment for [Name]"</li>
              <li>• "Search for patient [Name]"</li>
              <li>• "Show appointments"</li>
              <li>• "Show patients"</li>
              <li>• "Show billing"</li>
              <li>• "Schedule [Name] on [Date] at [Time]"</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Comprehensive Front Desk System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Reception Desk</span>
              <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'appointments', label: 'Appointments', icon: '📅' },
              { id: 'patients', label: 'Patients', icon: '👥' },
              { id: 'billing', label: 'Billing', icon: '💰' },
              { id: 'inventory', label: 'Inventory', icon: '📦' },
              { id: 'staff', label: 'Staff', icon: '👨‍⚕️' },
              { id: 'voice', label: 'Voice Assistant', icon: '🎤' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'appointments' && renderAppointments()}
        {activeTab === 'patients' && renderPatients()}
        {activeTab === 'billing' && renderBilling()}
        {activeTab === 'inventory' && renderInventory()}
        {activeTab === 'staff' && renderStaff()}
        {activeTab === 'voice' && renderVoiceBooking()}
      </main>

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule New Appointment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                  <input
                    type="text"
                    value={newAppointment.patientName}
                    onChange={(e) => setNewAppointment({...newAppointment, patientName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter patient name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={newAppointment.duration}
                    onChange={(e) => setNewAppointment({...newAppointment, duration: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newAppointment.type}
                    onChange={(e) => setNewAppointment({...newAppointment, type: e.target.value as AppointmentType})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Check-up">Check-up</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Therapy">Therapy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                  <select
                    value={newAppointment.doctorId}
                    onChange={(e) => setNewAppointment({...newAppointment, doctorId: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {staff.filter(s => s.type === 'Doctor').map(doctor => (
                      <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAppointmentModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={bookAppointment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Schedule Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Modal */}
      {showPatientModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Patient</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={newPatient.firstName}
                    onChange={(e) => setNewPatient({...newPatient, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newPatient.lastName}
                    onChange={(e) => setNewPatient({...newPatient, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newPatient.dateOfBirth}
                    onChange={(e) => setNewPatient({...newPatient, dateOfBirth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Insurance</label>
                  <select
                    value={newPatient.insurance}
                    onChange={(e) => setNewPatient({...newPatient, insurance: e.target.value as InsuranceProvider})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Blue Cross">Blue Cross</option>
                    <option value="Aetna">Aetna</option>
                    <option value="UnitedHealth">UnitedHealth</option>
                    <option value="Medicare">Medicare</option>
                    <option value="Medicaid">Medicaid</option>
                    <option value="Self Pay">Self Pay</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Insurance ID</label>
                  <input
                    type="text"
                    value={newPatient.insuranceId}
                    onChange={(e) => setNewPatient({...newPatient, insuranceId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={newPatient.emergencyContact}
                    onChange={(e) => setNewPatient({...newPatient, emergencyContact: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone</label>
                  <input
                    type="tel"
                    value={newPatient.emergencyPhone}
                    onChange={(e) => setNewPatient({...newPatient, emergencyPhone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowPatientModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={addPatient}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </h3>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>DOB:</strong> {selectedPatient.dateOfBirth}</p>
                    <p><strong>Phone:</strong> {selectedPatient.phone}</p>
                    <p><strong>Email:</strong> {selectedPatient.email}</p>
                    <p><strong>Address:</strong> {selectedPatient.address}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Emergency Contact</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedPatient.emergencyContact}</p>
                    <p><strong>Phone:</strong> {selectedPatient.emergencyPhone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Insurance</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Provider:</strong> {selectedPatient.insurance}</p>
                    <p><strong>ID:</strong> {selectedPatient.insuranceId}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Visit History</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Last Visit:</strong> {selectedPatient.lastVisit || 'N/A'}</p>
                    <p><strong>Total Visits:</strong> {selectedPatient.totalVisits}</p>
                  </div>
                </div>
              </div>
              {selectedPatient.medicalHistory.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Medical History</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.medicalHistory.map((condition, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selectedPatient.allergies.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Allergies</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.allergies.map((allergy, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selectedPatient.medications.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Current Medications</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.medications.map((medication, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {medication}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setNewAppointment({
                      ...newAppointment,
                      patientId: selectedPatient.id,
                      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`
                    });
                    setShowAppointmentModal(true);
                    setSelectedPatient(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Schedule Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style jsx>{`
        .recording-animation {
          animation: pulse 1.5s infinite;
        }
        .pulse-ring {
          animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
          opacity: 0;
        }
        @keyframes pulse {
          0% { transform: scale(0.95); }
          50% { transform: scale(1.05); }
          100% { transform: scale(0.95); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.33); opacity: 0.6; }
          80%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default FrontDeskDashboard;