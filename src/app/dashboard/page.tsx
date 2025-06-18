'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, User, Calendar, Stethoscope, Brain, Settings, Bell, Search, Plus, Edit3, Save, X, Clock, AlertCircle, CheckCircle, Star, TrendingUp, Activity, Heart, Thermometer, Users, FileText, Phone, Mail, MapPin, Filter, ChevronDown, ChevronUp, Zap, Eye, EyeOff } from 'lucide-react';

// Types
interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  address: string;
  diagnosis: string;
  symptoms: string;
  history: string;
  lastVisit: string;
  priority: 'high' | 'medium' | 'low';
  status: 'waiting' | 'in-progress' | 'completed';
  vitals?: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    oxygenSaturation: number;
  };
}

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  symptoms?: string;
  notes?: string;
  duration: number;
}

interface Prescription {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  doctorName: string;
  medications: string[];
  instructions: string;
  followUp: string;
  aiGenerated: boolean;
  doctorModified: boolean;
  confidence: number;
}

interface VoiceBooking {
  isListening: boolean;
  transcript: string;
  isProcessing: boolean;
}

interface DoctorPreferences {
  [diagnosis: string]: {
    medications: { [med: string]: number };
    totalPrescriptions: number;
  };
}

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

// Mock data
const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'John Doe',
    age: 45,
    phone: '+1234567890',
    email: 'john.doe@email.com',
    address: '123 Main St, City, State',
    diagnosis: 'Hypertension',
    symptoms: 'High blood pressure, headaches, dizziness',
    history: 'Family history of cardiovascular disease',
    lastVisit: '2024-06-10',
    priority: 'high',
    status: 'waiting',
    vitals: {
      bloodPressure: '140/90',
      heartRate: 85,
      temperature: 98.6,
      oxygenSaturation: 98
    }
  },
  {
    id: '2',
    name: 'Jane Smith',
    age: 32,
    phone: '+1234567891',
    email: 'jane.smith@email.com',
    address: '456 Oak Ave, City, State',
    diagnosis: 'Migraine',
    symptoms: 'Severe headaches, nausea, light sensitivity',
    history: 'Chronic migraines for 5 years',
    lastVisit: '2024-06-15',
    priority: 'medium',
    status: 'waiting',
    vitals: {
      bloodPressure: '120/80',
      heartRate: 72,
      temperature: 99.1,
      oxygenSaturation: 99
    }
  },
  {
    id: '3',
    name: 'Bob Johnson',
    age: 28,
    phone: '+1234567892',
    email: 'bob.johnson@email.com',
    address: '789 Pine Rd, City, State',
    diagnosis: 'Common Cold',
    symptoms: 'Runny nose, cough, fever',
    history: 'No significant medical history',
    lastVisit: '2024-06-17',
    priority: 'low',
    status: 'completed',
    vitals: {
      bloodPressure: '118/75',
      heartRate: 68,
      temperature: 100.2,
      oxygenSaturation: 97
    }
  },
  {
    id: '4',
    name: 'Alice Brown',
    age: 55,
    phone: '+1234567893',
    email: 'alice.brown@email.com',
    address: '321 Elm St, City, State',
    diagnosis: 'Diabetes Type 2',
    symptoms: 'Frequent urination, excessive thirst, fatigue',
    history: 'Diagnosed 3 years ago, family history of diabetes',
    lastVisit: '2024-06-16',
    priority: 'high',
    status: 'in-progress',
    vitals: {
      bloodPressure: '135/85',
      heartRate: 78,
      temperature: 98.4,
      oxygenSaturation: 98
    }
  }
];

const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientName: 'John Doe',
    patientId: '1',
    date: '2024-06-17',
    time: '10:00 AM',
    type: 'Follow-up',
    status: 'scheduled',
    symptoms: 'Chest pain, shortness of breath',
    duration: 30
  },
  {
    id: '2',
    patientName: 'Jane Smith',
    patientId: '2',
    date: '2024-06-17',
    time: '11:30 AM',
    type: 'Consultation',
    status: 'in-progress',
    duration: 45
  },
  {
    id: '3',
    patientName: 'Bob Johnson',
    patientId: '3',
    date: '2024-06-17',
    time: '2:00 PM',
    type: 'Check-up',
    status: 'completed',
    duration: 20
  },
  {
    id: '4',
    patientName: 'Alice Brown',
    patientId: '4',
    date: '2024-06-17',
    time: '3:30 PM',
    type: 'Follow-up',
    status: 'scheduled',
    symptoms: 'Blood sugar monitoring',
    duration: 25
  }
];

// Animation variants
const slideInFromLeft = {
  initial: { x: -100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
};

const slideInFromRight = {
  initial: { x: 100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
};

const fadeInUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.4, ease: "easeOut" }
};

const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.3, ease: "easeOut" }
};

// Custom hooks created
const useAnimatedNumber = (target: number, duration: number = 1000) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCurrent(target);
        clearInterval(timer);
      } else {
        setCurrent(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration]);

  return current;
};

const EnhancedDoctorDashboard: React.FC = () => {
  // State management
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'appointments' | 'voice-booking' | 'analytics'>('dashboard');
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [isEditingPrescription, setIsEditingPrescription] = useState(false);
  const [editedPrescription, setEditedPrescription] = useState<Prescription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isGeneratingPrescription, setIsGeneratingPrescription] = useState(false);
  const [showPatientDetails, setShowPatientDetails] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      message: 'New appointment booked for John Doe',
      type: 'info',
      timestamp: new Date(),
      read: false
    },
    {
      id: '2',
      message: 'Lab results ready for Jane Smith',
      type: 'success',
      timestamp: new Date(Date.now() - 300000),
      read: false
    },
    {
      id: '3',
      message: 'High priority patient waiting',
      type: 'warning',
      timestamp: new Date(Date.now() - 600000),
      read: true
    }
  ]);
  
  // Voice booking state
  const [voiceBooking, setVoiceBooking] = useState<VoiceBooking>({
    isListening: false,
    transcript: '',
    isProcessing: false
  });
  
  // Doctor preferences for learning (mock data)
  const [doctorPreferences, setDoctorPreferences] = useState<DoctorPreferences>({
    'Hypertension': {
      medications: {
        'Lisinopril 10mg': 15,
        'Amlodipine 5mg': 12,
        'Losartan 50mg': 8
      },
      totalPrescriptions: 35
    },
    'Migraine': {
      medications: {
        'Sumatriptan 50mg': 10,
        'Propranolol 40mg': 8,
        'Topiramate 25mg': 6
      },
      totalPrescriptions: 24
    },
    'Diabetes Type 2': {
      medications: {
        'Metformin 500mg': 20,
        'Glipizide 5mg': 15,
        'Insulin Glargine': 10
      },
      totalPrescriptions: 45
    }
  });

  // Animated counters
  const animatedPatientsCount = useAnimatedNumber(patients.length);
  const animatedAppointmentsCount = useAnimatedNumber(appointments.length);
  const animatedCompletedCount = useAnimatedNumber(appointments.filter(a => a.status === 'completed').length);

  // Refs
  const speechRecognitionRef = useRef<any>(null);

  // Voice recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      speechRecognitionRef.current = new SpeechRecognition();
      speechRecognitionRef.current.continuous = true;
      speechRecognitionRef.current.interimResults = true;
      speechRecognitionRef.current.lang = 'en-US';

      speechRecognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        
        setVoiceBooking(prev => ({ ...prev, transcript }));
      };

      speechRecognitionRef.current.onend = () => {
        setVoiceBooking(prev => ({ ...prev, isListening: false }));
      };
    }
  }, []);

  // Auto-refresh notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new notifications
      if (Math.random() > 0.8) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          message: 'New patient checked in',
          type: 'info',
          timestamp: new Date(),
          read: false
        };
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // AI Prescription Generation with Learning
  const generateAIPrescription = (patient: Patient, currentSymptoms: string = ''): Prescription => {
    const symptoms = currentSymptoms || patient.symptoms;
    const diagnosis = patient.diagnosis;
    
    // Base prescriptions
    const basePrescriptions: { [key: string]: any } = {
      'Hypertension': {
        medications: ['Lisinopril 10mg - Once daily', 'Amlodipine 5mg - Once daily'],
        instructions: 'Take with food. Monitor blood pressure daily. Avoid excessive salt intake.',
        followUp: '2 weeks',
      },
      'Migraine': {
        medications: ['Sumatriptan 50mg - As needed', 'Propranolol 40mg - Twice daily'],
        instructions: 'Take sumatriptan at onset of headache. Avoid triggers. Stay hydrated.',
        followUp: '1 month',
      },
      'Common Cold': {
        medications: ['Paracetamol 500mg - Every 6 hours', 'Cetirizine 10mg - Once daily'],
        instructions: 'Rest well. Increase fluid intake. Use humidifier if available.',
        followUp: '1 week if symptoms persist',
      },
      'Diabetes Type 2': {
        medications: ['Metformin 500mg - Twice daily', 'Glipizide 5mg - Once daily'],
        instructions: 'Take with meals. Monitor blood glucose levels. Follow diabetic diet.',
        followUp: '3 months',
      }
    };

    // Apply doctor's learning preferences
    let medications = basePrescriptions[diagnosis]?.medications || ['Consult specialist'];
    let confidence = 0.7;

    if (doctorPreferences[diagnosis]) {
      const prefs = doctorPreferences[diagnosis];
      const topMeds = Object.entries(prefs.medications)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([med, count]) => {
          const frequency = count / prefs.totalPrescriptions;
          confidence = Math.max(confidence, frequency);
          return `${med} - ${frequency > 0.5 ? 'Once daily' : 'As needed'}`;
        });
      
      if (topMeds.length > 0) {
        medications = topMeds;
        confidence = Math.min(confidence + 0.2, 0.95);
      }
    }

    return {
      id: Date.now().toString(),
      patientName: patient.name,
      patientId: patient.id,
      date: new Date().toLocaleDateString(),
      doctorName: 'Dr. Smith',
      medications,
      instructions: basePrescriptions[diagnosis]?.instructions || 'Follow general guidelines',
      followUp: basePrescriptions[diagnosis]?.followUp || '1 week',
      aiGenerated: true,
      doctorModified: false,
      confidence: Math.round(confidence * 100)
    };
  };

  // Handle prescription generation with animation
  const handleGeneratePrescription = async (patient: Patient, symptoms?: string) => {
    setIsGeneratingPrescription(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newPrescription = generateAIPrescription(patient, symptoms);
    setPrescription(newPrescription);
    setIsEditingPrescription(false);
    setIsGeneratingPrescription(false);
    
    // Add success notification
    const successNotification: Notification = {
      id: Date.now().toString(),
      message: `AI prescription generated for ${patient.name}`,
      type: 'success',
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [successNotification, ...prev]);
  };

  // Handle prescription editing
  const handleEditPrescription = () => {
    if (prescription) {
      setEditedPrescription({ ...prescription });
      setIsEditingPrescription(true);
    }
  };

  // Handle prescription save
  const handleSavePrescription = () => {
    if (editedPrescription) {
      const updatedPrescription = {
        ...editedPrescription,
        doctorModified: true,
        confidence: Math.max(editedPrescription.confidence - 10, 60)
      };
      setPrescription(updatedPrescription);
      
      // Update doctor preferences for learning
      const diagnosis = selectedPatient?.diagnosis;
      if (diagnosis) {
        setDoctorPreferences(prev => {
          const updated = { ...prev };
          if (!updated[diagnosis]) {
            updated[diagnosis] = { medications: {}, totalPrescriptions: 0 };
          }
          
          updatedPrescription.medications.forEach(med => {
            const medName = med.split(' - ')[0];
            updated[diagnosis].medications[medName] = (updated[diagnosis].medications[medName] || 0) + 1;
          });
          updated[diagnosis].totalPrescriptions += 1;
          
          return updated;
        });
      }
      
      setIsEditingPrescription(false);
      
      // Add notification
      const notification: Notification = {
        id: Date.now().toString(),
        message: 'Prescription updated and learned',
        type: 'success',
        timestamp: new Date(),
        read: false
      };
      setNotifications(prev => [notification, ...prev]);
    }
  };

  // Voice booking functions
  const startVoiceBooking = () => {
    if (speechRecognitionRef.current) {
      setVoiceBooking(prev => ({ ...prev, isListening: true, transcript: '' }));
      speechRecognitionRef.current.start();
    }
  };

  const stopVoiceBooking = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setVoiceBooking(prev => ({ ...prev, isListening: false }));
    }
  };

  const processVoiceBooking = async () => {
    setVoiceBooking(prev => ({ ...prev, isProcessing: true }));
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      patientName: 'New Patient',
      patientId: 'new',
      date: new Date().toISOString().split('T')[0],
      time: '3:00 PM',
      type: 'Consultation',
      status: 'scheduled',
      symptoms: 'Extracted from voice input',
      duration: 30
    };
    
    setAppointments(prev => [...prev, newAppointment]);
    setVoiceBooking({ isListening: false, transcript: '', isProcessing: false });
    
    const notification: Notification = {
      id: Date.now().toString(),
      message: 'New appointment booked via voice',
      type: 'success',
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setActiveTab('appointments');
  };

  // Filter functions
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || patient.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Notification functions
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVitalColor = (vital: string, value: number | string) => {
    if (vital === 'heartRate' && typeof value === 'number') {
      if (value < 60 || value > 100) return 'text-red-600';
      return 'text-green-600';
    }
    if (vital === 'temperature' && typeof value === 'number') {
      if (value > 99.5) return 'text-red-600';
      return 'text-green-600';
    }
    if (vital === 'oxygenSaturation' && typeof value === 'number') {
      if (value < 95) return 'text-red-600';
      return 'text-green-600';
    }
    return 'text-black-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg transform transition-transform hover:scale-110">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Doctor Dashboard
                </h1>
                <p className="text-sm text-gray-600">Intelligent Healthcare Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors relative"
                >
                  <Bell className="h-6 w-6" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs animate-pulse">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      <button
                        onClick={clearAllNotifications}
                        className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => markNotificationAsRead(notification.id)}
                            className={`p-4 border-b border-gray-500 cursor-pointer transition-colors ${
                              !notification.read ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                notification.type === 'success' ? 'bg-green-500' :
                                notification.type === 'warning' ? 'bg-yellow-500' :
                                notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                              }`} />
                              <div className="flex-1">
                                <p className="text-sm text-gray-900">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {notification.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center transition-transform hover:scale-110">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="text-gray-700 font-medium">Dr. Smith</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/60 backdrop-blur-sm border-b border-gray-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'patients', label: 'Patients', icon: User },
              { id: 'appointments', label: 'Appointments', icon: Calendar },
              { id: 'voice-booking', label: 'Voice Booking', icon: Mic },
              { id: 'analytics', label: 'Analytics', icon: Brain }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-300 border-b-2 relative overflow-hidden ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                      : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50/30'
                  }`}
                >
                  <Icon className={`h-4 w-4 transition-transform ${activeTab === tab.id ? 'scale-110' : ''}`} />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 animate-in slide-in-from-left duration-300" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 focus:text-gray-900 placeholder-gray-400 dark:text-white dark:placeholder-gray-400 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-3">
              {activeTab === 'patients' && (
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="h-5 w-5 text-gray-600" />
                  <span>Filters</span>
                  {showFilters ? (
                    <ChevronUp className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  )}
                </button>
              )}
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg">
                <Plus className="h-5 w-5" />
                <span>
                  {activeTab === 'patients' && 'Add Patient'}
                  {activeTab === 'appointments' && 'New Appointment'}
                  {activeTab === 'voice-booking' && 'New Booking'}
                </span>
              </button>
            </div>
          </div>
          
          {showFilters && activeTab === 'patients' && (
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="waiting">Waiting</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilterPriority('all');
                    setFilterStatus('all');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">Total Patients</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{animatedPatientsCount}</h3>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>12% from last month</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">Today's Appointments</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{animatedAppointmentsCount}</h3>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-blue-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>3 remaining today</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">Completed Today</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{animatedCompletedCount}</h3>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-yellow-600">
                  <Activity className="h-4 w-4 mr-1" />
                  <span>85% satisfaction rate</span>
                </div>
              </div>
            </div>
            
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {appointments.slice(0, 3).map(appointment => (
                  <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{appointment.patientName}</h3>
                        <p className="text-sm text-gray-500 mt-1">{appointment.type} • {appointment.time}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.replace('-', ' ')}
                      </div>
                    </div>
                    {appointment.symptoms && (
                      <div className="mt-3 flex items-start">
                        <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 mr-1.5" />
                        <p className="text-sm text-gray-600">{appointment.symptoms}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 text-center">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                  View all appointments
                </button>
              </div>
            </div>
            
            {/* High Priority Patients */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">High Priority Patients</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {patients.filter(p => p.priority === 'high').slice(0, 3).map(patient => (
                  <div 
                    key={patient.id} 
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedPatient(patient);
                      setShowPatientDetails(true);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{patient.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{patient.diagnosis}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(patient.priority)}`}>
                        {patient.priority}
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 text-gray-500 mr-1.5" />
                        <span className={`text-sm ${getVitalColor('heartRate', patient.vitals?.heartRate || 0)}`}>
                          HR: {patient.vitals?.heartRate} bpm
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Thermometer className="h-4 w-4 text-gray-500 mr-1.5" />
                        <span className={`text-sm ${getVitalColor('temperature', patient.vitals?.temperature || 0)}`}>
                          Temp: {patient.vitals?.temperature}°F
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 text-center">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                  View all patients
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Patient Records</h2>
              <div className="flex space-x-3">
                <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Users className="h-5 w-5 text-gray-600" />
                  <span>Groups</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <span>Reports</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diagnosis
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Visit
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.map((patient) => (
                    <tr 
                      key={patient.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setShowPatientDetails(true);
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                            <div className="text-sm text-gray-500">{patient.age} years</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient.diagnosis}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{patient.symptoms}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(patient.lastVisit).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(patient.priority)}`}>
                          {patient.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          patient.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                          patient.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {patient.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGeneratePrescription(patient);
                          }}
                        >
                          Prescribe
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Phone className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Previous
                </button>
                <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredPatients.length}</span> of{' '}
                    <span className="font-medium">{patients.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <span className="sr-only">Previous</span>
                      <ChevronUp className="h-5 w-5" />
                    </button>
                    <button
                      aria-current="page"
                      className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                    >
                      1
                    </button>
                    <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                      2
                    </button>
                    <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                      3
                    </button>
                    <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <span className="sr-only">Next</span>
                      <ChevronDown className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">Scheduled</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">
                      {appointments.filter(a => a.status === 'scheduled').length}
                    </h3>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">In Progress</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">
                      {appointments.filter(a => a.status === 'in-progress').length}
                    </h3>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">Completed</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">
                      {appointments.filter(a => a.status === 'completed').length}
                    </h3>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Today's Appointments</h2>
                <div className="flex space-x-3">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <span>Calendar View</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAppointments.map((appointment) => (
                      <tr 
                        key={appointment.id} 
                        className="hover:bg-gray-50 transition-colors"
                        onClick={() => setSelectedAppointment(appointment)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{appointment.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                              {appointment.symptoms && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">{appointment.symptoms}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {appointment.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {appointment.duration} min
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                            {appointment.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            Start
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <Mail className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredAppointments.length}</span> of{' '}
                      <span className="font-medium">{appointments.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        <span className="sr-only">Previous</span>
                        <ChevronUp className="h-5 w-5" />
                      </button>
                      <button
                        aria-current="page"
                        className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                      >
                        1
                      </button>
                      <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                        2
                      </button>
                      <button className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                        3
                      </button>
                      <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        <span className="sr-only">Next</span>
                        <ChevronDown className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Voice Booking Tab */}
        {activeTab === 'voice-booking' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Voice Appointment Booking</h2>
              <p className="mt-1 text-sm text-gray-500">
                Use voice commands to quickly book new appointments. The AI will transcribe and process your request.
              </p>
            </div>
            
            <div className="p-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-gray-200">
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                    <div className={`h-24 w-24 rounded-full flex items-center justify-center transition-all ${
                      voiceBooking.isListening 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse' 
                        : 'bg-gray-200'
                    }`}>
                      {voiceBooking.isListening ? (
                        <Mic className="h-10 w-10 text-white" />
                      ) : (
                        <MicOff className="h-10 w-10 text-gray-600" />
                      )}
                    </div>
                    {voiceBooking.isListening && (
                      <div className="absolute -top-2 -right-2 bg-red-500 rounded-full w-8 h-8 flex items-center justify-center text-white text-xs font-bold animate-ping">
                        LIVE
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      {voiceBooking.isListening ? 'Listening...' : 'Ready to book'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {voiceBooking.isListening 
                        ? 'Speak clearly to book an appointment' 
                        : 'Click the microphone to start voice booking'}
                    </p>
                  </div>
                  
                  <div className="w-full max-w-md bg-white rounded-lg p-4 border border-gray-200 min-h-32">
                    {voiceBooking.transcript ? (
                      <p className="text-gray-700">{voiceBooking.transcript}</p>
                    ) : (
                      <p className="text-gray-400 italic">Transcript will appear here...</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-4">
                    {!voiceBooking.isListening ? (
                      <button
                        onClick={startVoiceBooking}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                      >
                        <Mic className="h-5 w-5" />
                        <span>Start Recording</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={stopVoiceBooking}
                          className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
                        >
                          <MicOff className="h-5 w-5" />
                          <span>Stop Recording</span>
                        </button>
                        <button
                          onClick={processVoiceBooking}
                          disabled={voiceBooking.isProcessing || !voiceBooking.transcript}
                          className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg ${
                            voiceBooking.isProcessing || !voiceBooking.transcript
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {voiceBooking.isProcessing ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="h-5 w-5" />
                              <span>Process Booking</span>
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Example Commands</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-500">
                    <p className="text-sm font-medium text-gray-900">"Book an appointment for John Doe tomorrow at 2 PM"</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-500">
                    <p className="text-sm font-medium text-gray-900">"Schedule a follow-up for Jane Smith next Monday at 10:30 AM"</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-500">
                    <p className="text-sm font-medium text-gray-900">"Create a new patient Alice Brown with symptoms of headache and nausea"</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-500">
                    <p className="text-sm font-medium text-gray-900">"Reschedule Bob Johnson's appointment from today to Friday at 11 AM"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-500">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Common Diagnoses</h3>
                <div className="space-y-4">
                  {Object.entries(doctorPreferences).map(([diagnosis, data]) => (
                    <div key={diagnosis} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">{diagnosis}</span>
                        <span className="text-xs text-gray-500">{data.totalPrescriptions} prescriptions</span>
                      </div>
                      <div className="w-full bg-gray-500 rounded-full h-2.5">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full" 
                          style={{ width: `${(data.totalPrescriptions / 50) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(data.medications)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 3)
                          .map(([med, count]) => (
                            <span key={med} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {med} ({Math.round((count / data.totalPrescriptions) * 100)}%)
                            </span>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Prescription Confidence</h3>
                <div className="h-64 flex items-center justify-center">
                  <div className="relative w-40 h-40">
                    <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
                    <div 
                      className="absolute inset-0 rounded-full border-8 border-transparent border-t-blue-500 border-r-purple-500 animate-spin"
                      style={{ animationDuration: '3s' }}
                    ></div>
                    <div className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        87%
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 text-center mt-4">
                  AI prescription accuracy based on your historical preferences
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Priority Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-red-800">High Priority</span>
                    <span className="text-xs text-red-600">
                      {patients.filter(p => p.priority === 'high').length} patients
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full bg-red-200 rounded-full">
                    <div 
                      className="h-2 bg-red-500 rounded-full" 
                      style={{ width: `${(patients.filter(p => p.priority === 'high').length / patients.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-yellow-800">Medium Priority</span>
                    <span className="text-xs text-yellow-600">
                      {patients.filter(p => p.priority === 'medium').length} patients
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full bg-yellow-200 rounded-full">
                    <div 
                      className="h-2 bg-yellow-500 rounded-full" 
                      style={{ width: `${(patients.filter(p => p.priority === 'medium').length / patients.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-green-800">Low Priority</span>
                    <span className="text-xs text-green-600">
                      {patients.filter(p => p.priority === 'low').length} patients
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full bg-green-200 rounded-full">
                    <div 
                      className="h-2 bg-green-500 rounded-full" 
                      style={{ width: `${(patients.filter(p => p.priority === 'low').length / patients.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Appointment Types</h3>
              <div className="h-64">
                <div className="grid grid-cols-3 gap-4 h-full">
                  <div className="flex flex-col justify-end">
                    <div className="text-center text-sm text-gray-500 mb-1">Follow-up</div>
                    <div 
                      className="bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg mx-auto transition-all hover:opacity-90"
                      style={{ height: '70%', width: '60%' }}
                    ></div>
                    <div className="text-center text-sm font-medium mt-1">
                      {appointments.filter(a => a.type === 'Follow-up').length}
                    </div>
                  </div>
                  <div className="flex flex-col justify-end">
                    <div className="text-center text-sm text-gray-500 mb-1">Consultation</div>
                    <div 
                      className="bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-lg mx-auto transition-all hover:opacity-90"
                      style={{ height: '50%', width: '60%' }}
                    ></div>
                    <div className="text-center text-sm font-medium mt-1">
                      {appointments.filter(a => a.type === 'Consultation').length}
                    </div>
                  </div>
                  <div className="flex flex-col justify-end">
                    <div className="text-center text-sm text-gray-500 mb-1">Check-up</div>
                    <div 
                      className="bg-gradient-to-t from-green-500 to-green-300 rounded-t-lg mx-auto transition-all hover:opacity-90"
                      style={{ height: '30%', width: '60%' }}
                    ></div>
                    <div className="text-center text-sm font-medium mt-1">
                      {appointments.filter(a => a.type === 'Check-up').length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Patient Details Modal */}
{showPatientDetails && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-semibold text-gray-900">{selectedPatient.name}'s Details</h2>
              <button 
                onClick={() => setShowPatientDetails(false)}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Personal Information */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="text-gray-900">{selectedPatient.age} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-900">{selectedPatient.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900">{selectedPatient.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-gray-900">{selectedPatient.address}</p>
                    </div>
                  </div>
                </div>
                
                {/* Medical Information */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Diagnosis</p>
                      <p className="text-gray-900">{selectedPatient.diagnosis}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Symptoms</p>
                      <p className="text-gray-900">{selectedPatient.symptoms}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Medical History</p>
                      <p className="text-gray-900">{selectedPatient.history}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Visit</p>
                      <p className="text-gray-900">{new Date(selectedPatient.lastVisit).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                {/* Vital Signs */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Vital Signs</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Blood Pressure</p>
                      <p className={`font-medium ${selectedPatient.vitals?.bloodPressure === '140/90' ? 'text-red-600' : 'text-gray-900'}`}>
                        {selectedPatient.vitals?.bloodPressure || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Heart Rate</p>
                      <p className={`font-medium ${getVitalColor('heartRate', selectedPatient.vitals?.heartRate || 0)}`}>
                        {selectedPatient.vitals?.heartRate || 'N/A'} bpm
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Temperature</p>
                      <p className={`font-medium ${getVitalColor('temperature', selectedPatient.vitals?.temperature || 0)}`}>
                        {selectedPatient.vitals?.temperature || 'N/A'}°F
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Oxygen Saturation</p>
                      <p className={`font-medium ${getVitalColor('oxygenSaturation', selectedPatient.vitals?.oxygenSaturation || 0)}`}>
                        {selectedPatient.vitals?.oxygenSaturation || 'N/A'}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Prescription Section */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h3 className="font-medium text-gray-900">Prescription</h3>
                  <div className="flex space-x-3">
                    {prescription ? (
                      <>
                        <button
                          onClick={handleEditPrescription}
                          className="flex items-center space-x-1 px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setIsEditingPrescription(false)}
                          className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm hover:from-blue-700 hover:to-purple-700 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleGeneratePrescription(selectedPatient)}
                        disabled={isGeneratingPrescription}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                          isGeneratingPrescription
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                        }`}
                      >
                        {isGeneratingPrescription ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4" />
                            <span>Generate AI Prescription</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                
                {isEditingPrescription && editedPrescription ? (
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Medications</label>
                      <textarea
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        value={editedPrescription.medications.join('\n')}
                        onChange={(e) => setEditedPrescription({
                          ...editedPrescription,
                          medications: e.target.value.split('\n')
                        })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                      <textarea
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        value={editedPrescription.instructions}
                        onChange={(e) => setEditedPrescription({
                          ...editedPrescription,
                          instructions: e.target.value
                        })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up</label>
                      <input
  type="text"
  placeholder={`Search ${activeTab}...`}
  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 focus:text-gray-900 placeholder-gray-400 dark:text-white dark:placeholder-gray-400 dark:bg-gray-800 transition-all"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        onClick={() => setIsEditingPrescription(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSavePrescription}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                      >
                        Save Prescription
                      </button>
                    </div>
                  </div>
                ) : prescription ? (
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">Medications</h4>
                        <ul className="mt-2 space-y-1">
                          {prescription.medications.map((med, index) => (
                            <li key={index} className="text-gray-700">{med}</li>
                          ))}
                        </ul>
                      </div>
                      {prescription.aiGenerated && (
                        <div className="flex items-center space-x-1 bg-blue-50 text-blue-800 px-2 py-1 rounded-full text-xs">
                          <span>AI Generated</span>
                          {prescription.doctorModified && (
                            <span className="text-yellow-600">(Modified)</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900">Instructions</h4>
                      <p className="mt-2 text-gray-700">{prescription.instructions}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900">Follow-up</h4>
                      <p className="mt-2 text-gray-700">{prescription.followUp}</p>
                    </div>
                    
                    {prescription.aiGenerated && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">AI Confidence:</span>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full" 
                              style={{ width: `${prescription.confidence}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{prescription.confidence}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No prescription generated yet. Click "Generate AI Prescription" to create one.
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowPatientDetails(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors">
                  Schedule Follow-up
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedDoctorDashboard;