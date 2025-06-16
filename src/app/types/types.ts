// Patient type
export interface Patient {
  id: number;
  name: string;
  age: number;
  diagnosis: string;
  history: string;
  symptoms: string;
  lastVisit: string;
  phone: string;
}

// Appointment type
export interface Appointment {
  id: number;
  patientName: string;
  time: string;
  date: string;
  type: string;
}

// Prescription type
export interface Prescription {
  patientName: string;
  date: string;
  doctorName: string;
  medications: string[];
  instructions: string;
  followUp: string;
}

// Mock Patients
export const mockPatients: Patient[] = [
  {
    id: 1,
    name: "John Smith",
    age: 45,
    diagnosis: "Hypertension",
    history: "Previous heart condition, family history of diabetes",
    symptoms: "Chest pain, shortness of breath",
    lastVisit: "2024-06-10",
    phone: "+1-555-0123",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    age: 32,
    diagnosis: "Migraine",
    history: "Chronic headaches, stress-related symptoms",
    symptoms: "Severe headache, nausea, light sensitivity",
    lastVisit: "2024-06-12",
    phone: "+1-555-0124",
  },
];

// Mock Appointments
export const mockAppointments: Appointment[] = [
  {
    id: 1,
    patientName: "Alice Brown",
    time: "10:00 AM",
    date: "2024-06-15",
    type: "Consultation",
  },
  {
    id: 2,
    patientName: "Bob Davis",
    time: "2:30 PM",
    date: "2024-06-15",
    type: "Follow-up",
  },
];