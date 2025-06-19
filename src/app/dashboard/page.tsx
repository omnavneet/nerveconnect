'use client';
import React, { useEffect, useState } from "react";
import {
  Plus,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  Clock,
  X,
  Heart,
  Thermometer,
  Activity,
  Bell,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Zap,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Edit3,
  Trash2,
  Download,
  Upload,
  BarChart3,
  Settings,
  Star,
  MessageSquare,
  FileText,
  Users,
  Calendar as CalendarIcon,
  PieChart,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowRight,
  Bookmark,
  Archive,
  MoreVertical,
  Printer,
  Share2,
  Filter as FilterIcon,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Moon,
  Sun,
  Globe,
  Shield,
  Zap as ZapIcon
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
  userId: string;
  diseases?: Array<string | { id: string; name: string; patientId: string }>;
  priority?: 'high' | 'medium' | 'low';
  status?: 'active' | 'inactive';
  lastVisit?: string;
  nextAppointment?: string;
  avatar?: string;
  gender?: 'male' | 'female' | 'other';
  bloodType?: string;
  allergies?: string[];
  emergencyContact?: string;
  insurance?: string;
}

interface Appointment {
  id: string;
  date: string;
  diagnosis: string;
  symptoms: string;
  temperature?: number;
  bloodPressure?: string;
  heartRate?: number;
  oxygenSaturation?: number;
  instructions?: string;
  followUpInDays?: number;
  patientId: string;
  status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  priority?: 'high' | 'medium' | 'low';
  duration?: number;
  notes?: string;
  prescriptions?: string[];
  aiAnalysis?: {
    summary: string;
    judgment: string;
    reason: string;
    recommendations?: string[];
    riskLevel?: 'low' | 'medium' | 'high';
    confidence?: number;
  };
}

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  completedToday: number;
  pendingAppointments: number;
  criticalPatients: number;
  satisfactionRate: number;
  averageWaitTime: number;
  revenueToday: number;
}

const EnhancedDoctorDashboard: React.FC = () => {
  // Existing state
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [newPatientData, setNewPatientData] = useState<Partial<Patient>>({});
  const [diseasesInput, setDiseasesInput] = useState("");
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  const [appointmentData, setAppointmentData] = useState<Partial<Appointment>>({});
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<(Appointment & { patient: Patient }) | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [AIAnalysis, setAIAnalysis] = useState<{
    summary: string;
    judgment: string;
    reason: string;
    recommendations?: string[];
    riskLevel?: 'low' | 'medium' | 'high';
    confidence?: number;
  } | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [count, setCount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      message: 'New patient added successfully',
      type: 'success',
      timestamp: new Date(),
      read: false,
    },
    {
      id: '2',
      message: 'Appointment scheduled for tomorrow',
      type: 'info',
      timestamp: new Date(Date.now() - 300000),
      read: false,
    },
  ]);

  // New enhanced state
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'priority'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'patients' | 'appointments' | 'analytics'>('overview');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    completedToday: 0,
    pendingAppointments: 0,
    criticalPatients: 0,
    satisfactionRate: 85,
    averageWaitTime: 12,
    revenueToday: 1250
  });
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [filterDate, setFilterDate] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [recentActivity, setRecentActivity] = useState([
    { id: '1', action: 'Patient added', time: '2 minutes ago', type: 'create' },
    { id: '2', action: 'Appointment completed', time: '15 minutes ago', type: 'complete' },
    { id: '3', action: 'AI analysis generated', time: '1 hour ago', type: 'analysis' },
  ]);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API calls with mock data
    const mockPatients: Patient[] = [
      {
        id: '1',
        name: 'John Doe',
        age: 35,
        phone: '+1-555-0123',
        email: 'john.doe@email.com',
        address: '123 Main St, City, State',
        createdAt: new Date().toISOString(),
        userId: 'user1',
        priority: 'high',
        status: 'active',
        gender: 'male',
        bloodType: 'O+',
        allergies: ['Penicillin', 'Shellfish'],
        diseases: ['Hypertension', 'Diabetes'],
        lastVisit: '2024-01-15',
        emergencyContact: '+1-555-0124',
        insurance: 'Blue Cross Blue Shield'
      },
      {
        id: '2',
        name: 'Jane Smith',
        age: 28,
        phone: '+1-555-0125',
        email: 'jane.smith@email.com',
        address: '456 Oak Ave, City, State',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        userId: 'user1',
        priority: 'medium',
        status: 'active',
        gender: 'female',
        bloodType: 'A+',
        allergies: ['Latex'],
        diseases: ['Asthma'],
        lastVisit: '2024-01-10',
        emergencyContact: '+1-555-0126',
        insurance: 'Aetna'
      }
    ];

    const mockAppointments: Appointment[] = [
      {
        id: '1',
        date: new Date().toISOString(),
        diagnosis: 'Routine Checkup',
        symptoms: 'General wellness check',
        temperature: 98.6,
        bloodPressure: '120/80',
        heartRate: 72,
        oxygenSaturation: 98,
        instructions: 'Continue current medications',
        patientId: '1',
        status: 'completed',
        priority: 'medium',
        duration: 30,
        prescriptions: ['Lisinopril 10mg daily']
      },
      {
        id: '2',
        date: new Date(Date.now() + 3600000).toISOString(),
        diagnosis: 'Follow-up Visit',
        symptoms: 'Shortness of breath',
        patientId: '2',
        status: 'scheduled',
        priority: 'high',
        duration: 45
      }
    ];

    setPatients(mockPatients);
    setAppointments(mockAppointments);
    setDashboardStats({
      ...dashboardStats,
      totalPatients: mockPatients.length,
      todayAppointments: mockAppointments.filter(a => 
        new Date(a.date).toDateString() === new Date().toDateString()
      ).length,
      completedToday: mockAppointments.filter(a => 
        new Date(a.date).toDateString() === new Date().toDateString() && a.status === 'completed'
      ).length,
      pendingAppointments: mockAppointments.filter(a => a.status === 'scheduled').length,
      criticalPatients: mockPatients.filter(p => p.priority === 'high').length
    });
    setLoading(false);
  }, []);

  // Existing functions (preserved)
  const handleAppointmentClick = (appointment: Appointment & { patient: Patient }) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const getAllPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/patient", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      setPatients(data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching patients");
      setLoading(false);
    }
  };

  const getAllAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/appointment", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      setAppointments(data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching appointments");
      setLoading(false);
    }
  };

  const submitPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    const diseasesArray = diseasesInput
      ? diseasesInput
          .split(",")
          .map((d) => ({ name: d.trim() }))
          .filter((d) => d.name)
      : [];

    const payload = {
      name: newPatientData.name || "",
      age: Number(newPatientData.age) || 0,
      phone: newPatientData.phone || "",
      email: newPatientData.email || "",
      address: newPatientData.address || "",
      diseases: diseasesArray,
      priority: newPatientData.priority || 'medium',
      gender: newPatientData.gender || 'other',
      bloodType: newPatientData.bloodType || '',
      emergencyContact: newPatientData.emergencyContact || '',
      insurance: newPatientData.insurance || ''
    };

    try {
      const res = await fetch("/api/patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return console.error(data.error);
      
      const newPatient = { ...data.patient, status: 'active', createdAt: new Date().toISOString() };
      setPatients((prev) => [newPatient, ...prev]);
      setNewPatientData({});
      setDiseasesInput("");
      setShowAddPatientModal(false);

      const notification = {
        id: Date.now().toString(),
        message: `New patient ${data.patient.name} added successfully`,
        type: 'success',
        timestamp: new Date(),
        read: false,
      };
      setNotifications((prev) => [notification, ...prev]);
    } catch (error) {
      console.error('Error adding patient:', error);
    }
  };

  const submitAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      date: appointmentData.date,
      diagnosis: appointmentData.diagnosis || "",
      symptoms: appointmentData.symptoms || "",
      temperature: Number(appointmentData.temperature) || null,
      bloodPressure: appointmentData.bloodPressure || null,
      heartRate: Number(appointmentData.heartRate) || null,
      oxygenSaturation: Number(appointmentData.oxygenSaturation) || null,
      instructions: appointmentData.instructions || null,
      followUpInDays: Number(appointmentData.followUpInDays) || null,
      patientId: selectedPatientId,
      status: appointmentData.status || 'scheduled',
      priority: appointmentData.priority || 'medium',
      duration: appointmentData.duration || 30
    };

    try {
      const res = await fetch("/api/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return console.error(data.error);
      
      setAppointments((prev) => [data.appointment, ...prev]);
      setAppointmentData({});
      setSelectedPatientId("");
      setShowAddAppointmentModal(false);

      const notification = {
        id: Date.now().toString(),
        message: `New appointment scheduled for ${new Date(payload.date).toLocaleDateString()}`,
        type: 'info',
        timestamp: new Date(),
        read: false,
      };
      setNotifications((prev) => [notification, ...prev]);
    } catch (error) {
      console.error('Error adding appointment:', error);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    // Simulate logout - in real app this would redirect
    console.log("Logout successful");
  };

  const getCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/current", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      setUserName(data.username || "Smith");
    } catch (error) {
      setUserName("Smith"); // Default for demo
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  const aianalysis = async (appointment: Appointment & { patient: Patient }) => {
    try {
      // Simulate AI analysis
      const mockAnalysis = {
        summary: `Patient ${appointment.patient.name} shows stable vital signs with normal temperature and heart rate.`,
        judgment: appointment.temperature && appointment.temperature > 99.5 ? "Attention Required" : "Normal",
        reason: "All vital signs are within normal ranges. Continue monitoring.",
        recommendations: [
          "Continue current medication regimen",
          "Schedule follow-up in 2 weeks",
          "Monitor blood pressure regularly"
        ],
        riskLevel: 'low' as const,
        confidence: 92
      };

      setAIAnalysis(mockAnalysis);

      const notification = {
        id: Date.now().toString(),
        message: `AI analysis generated for ${appointment.patient.name}`,
        type: 'info',
        timestamp: new Date(),
        read: false,
      };
      setNotifications((prev) => [notification, ...prev]);
    } catch (error) {
      console.error("AI Analysis Error:", error);
    }
  };

  // New enhanced functions
  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setShowEditPatientModal(true);
  };

  const handleDeletePatient = async (patientId: string) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      setPatients(prev => prev.filter(p => p.id !== patientId));
      const notification = {
        id: Date.now().toString(),
        message: 'Patient deleted successfully',
        type: 'success',
        timestamp: new Date(),
        read: false,
      };
      setNotifications(prev => [notification, ...prev]);
    }
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on:`, selectedItems);
    setSelectedItems([]);
    setShowBulkActions(false);
  };

  const exportData = (format: 'csv' | 'pdf' | 'json') => {
    console.log(`Exporting data as ${format}`);
    setShowExportModal(false);
  };

  // Filter functions
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.diseases && patient.diseases.some((d) =>
        typeof d === 'string'
          ? d.toLowerCase().includes(searchTerm.toLowerCase())
          : d.name.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || patient.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch = appointment.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.symptoms.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = filterDate === 'all' || 
      (filterDate === 'today' && new Date(appointment.date).toDateString() === new Date().toDateString()) ||
      (filterDate === 'week' && new Date(appointment.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (filterDate === 'month' && new Date(appointment.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesDate;
  });

  // Notification functions
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  // Status and priority color functions
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
    return 'text-gray-700';
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Enhanced Header */}
      <header className={`${
        darkMode ? 'bg-gray-800/90' : 'bg-white/90'
      } backdrop-blur-xl shadow-2xl border-b ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      } sticky top-0 z-50 transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl transform transition-transform hover:scale-110 shadow-lg">
                <Stethoscope className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Doctor Dashboard
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Intelligent Healthcare Management
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">Live</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <div className="relative">
                <button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className={`p-3 ${
                    darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  } transition-all duration-200 relative rounded-xl`}
                  aria-label="Quick Actions"
                >
                  <ZapIcon className="h-6 w-6" />
                </button>
                {showQuickActions && (
                  <div className={`absolute right-0 mt-2 w-56 ${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  } rounded-xl shadow-2xl border z-50 py-2`}>
                    <button
                      onClick={() => {
                        setShowAddPatientModal(true);
                        setShowQuickActions(false);
                      }}
                      className={`w-full px-4 py-3 text-left ${
                        darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-900'
                      } transition-colors flex items-center space-x-3`}
                    >
                      <User className="h-4 w-4" />
                      <span>Add Patient</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowAddAppointmentModal(true);
                        setShowQuickActions(false);
                      }}
                      className={`w-full px-4 py-3 text-left ${
                        darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-900'
                      } transition-colors flex items-center space-x-3`}
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Schedule Appointment</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowExportModal(true);
                        setShowQuickActions(false);
                      }}
                      className={`w-full px-4 py-3 text-left ${
                        darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-900'
                      } transition-colors flex items-center space-x-3`}
                    >
                      <Download className="h-4 w-4" />
                      <span>Export Data</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 ${
                  darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                } transition-all duration-200 rounded-xl`}
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-3 ${
                    darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  } transition-all duration-200 relative rounded-xl`}
                  aria-label="Notifications"
                >
                  <Bell className="h-6 w-6" />
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs animate-bounce font-bold">
                      {notifications.filter((n) => !n.read).length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className={`absolute right-0 mt-2 w-96 ${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  } rounded-xl shadow-2xl border z-50 animate-in slide-in-from-top-2 duration-200`}>
                    <div className={`p-4 border-b ${
                      darkMode ? 'border-gray-700' : 'border-gray-200'
                    } flex justify-between items-center`}>
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Notifications
                      </h3>
                      <button
                        onClick={clearAllNotifications}
                        className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className={`p-6 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => markNotificationAsRead(notification.id)}
                            className={`p-4 border-b ${
                              darkMode ? 'border-gray-700' : 'border-gray-200'
                            } cursor-pointer transition-colors ${
                              !notification.read 
                                ? darkMode 
                                  ? 'bg-blue-900/20 hover:bg-blue-900/30'
                                  : 'bg-blue-50 hover:bg-blue-100'
                                : darkMode
                                  ? 'hover:bg-gray-700'
                                  : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`flex-shrink-0 p-2 rounded-full ${
                                notification.type === 'success'
                                  ? 'bg-green-100 text-green-600'
                                  : notification.type === 'error'
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-blue-100 text-blue-600'
                              }`}>
                                {notification.type === 'success' ? (
                                  <CheckCircle className="h-5 w-5" />
                                ) : notification.type === 'error' ? (
                                  <AlertCircle className="h-5 w-5" />
                                ) : (
                                  <Bell className="h-5 w-5" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${
                                  darkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {notification.message}
                                </p>
                                <p className={`text-xs ${
                                  darkMode ? 'text-gray-400' : 'text-gray-500'
                                } mt-1`}>
                                  {notification.timestamp.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="flex-shrink-0">
                                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="relative">
                <button
                  className={`flex items-center space-x-2 p-2 rounded-xl ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  } transition-colors duration-200`}
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {userName ? userName.charAt(0) : 'D'}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className={`text-sm font-medium ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Dr. {userName || 'Smith'}
                    </p>
                    <p className={`text-xs ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Cardiologist
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className={`flex space-x-1 p-1 rounded-xl ${
            darkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            {['overview', 'patients', 'appointments', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab as any)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedTab === tab
                    ? darkMode
                      ? 'bg-gray-700 text-white shadow-md'
                      : 'bg-white text-gray-900 shadow-md'
                    : darkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Content */}
        {selectedTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Total Patients',
                  value: dashboardStats.totalPatients,
                  icon: <Users className="h-6 w-6" />,
                  change: '+12%',
                  trend: 'up',
                  color: 'bg-blue-100 text-blue-600'
                },
                {
                  title: 'Today Appointments',
                  value: dashboardStats.todayAppointments,
                  icon: <Calendar className="h-6 w-6" />,
                  change: '+3',
                  trend: 'up',
                  color: 'bg-purple-100 text-purple-600'
                },
                {
                  title: 'Completed Today',
                  value: dashboardStats.completedToday,
                  icon: <CheckCircle className="h-6 w-6" />,
                  change: dashboardStats.completedToday > 0 ? '+1' : '0',
                  trend: dashboardStats.completedToday > 0 ? 'up' : 'neutral',
                  color: 'bg-green-100 text-green-600'
                },
                {
                  title: 'Critical Patients',
                  value: dashboardStats.criticalPatients,
                  icon: <AlertCircle className="h-6 w-6" />,
                  change: dashboardStats.criticalPatients > 0 ? '+1' : '0',
                  trend: dashboardStats.criticalPatients > 0 ? 'up' : 'neutral',
                  color: 'bg-red-100 text-red-600'
                }
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`rounded-2xl p-6 shadow-md transition-all duration-300 hover:shadow-lg ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-full ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <div className={`flex items-center text-sm font-medium ${
                      stat.trend === 'up'
                        ? 'text-green-600'
                        : stat.trend === 'down'
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}>
                      {stat.change}
                      {stat.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 ml-1" />
                      ) : stat.trend === 'down' ? (
                        <TrendingUp className="h-4 w-4 ml-1 transform rotate-180" />
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-6">
                    <h3 className={`text-lg font-medium ${
                      darkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {stat.title}
                    </h3>
                    <p className={`text-3xl font-bold mt-1 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity and Upcoming Appointments */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <div className={`lg:col-span-1 rounded-2xl p-6 shadow-md ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-lg font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Recent Activity
                  </h2>
                  <button
                    className={`p-2 rounded-full ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className={`flex items-start space-x-3 p-3 rounded-lg ${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      } transition-colors duration-200`}
                    >
                      <div className={`flex-shrink-0 p-2 rounded-full ${
                        activity.type === 'create'
                          ? 'bg-blue-100 text-blue-600'
                          : activity.type === 'complete'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-purple-100 text-purple-600'
                      }`}>
                        {activity.type === 'create' ? (
                          <User className="h-5 w-5" />
                        ) : activity.type === 'complete' ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Activity className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {activity.action}
                        </p>
                        <p className={`text-xs ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        } mt-1`}>
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Appointments */}
              <div className={`lg:col-span-2 rounded-2xl p-6 shadow-md ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-lg font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Upcoming Appointments
                  </h2>
                  <button
                    onClick={() => setShowAddAppointmentModal(true)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
                      darkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } transition-colors duration-200`}
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Appointment</span>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className={`px-6 py-3 text-left text-xs font-medium ${
                            darkMode ? 'text-gray-300' : 'text-gray-500'
                          } uppercase tracking-wider`}
                        >
                          Patient
                        </th>
                        <th
                          scope="col"
                          className={`px-6 py-3 text-left text-xs font-medium ${
                            darkMode ? 'text-gray-300' : 'text-gray-500'
                          } uppercase tracking-wider`}
                        >
                          Time
                        </th>
                        <th
                          scope="col"
                          className={`px-6 py-3 text-left text-xs font-medium ${
                            darkMode ? 'text-gray-300' : 'text-gray-500'
                          } uppercase tracking-wider`}
                        >
                          Diagnosis
                        </th>
                        <th
                          scope="col"
                          className={`px-6 py-3 text-left text-xs font-medium ${
                            darkMode ? 'text-gray-300' : 'text-gray-500'
                          } uppercase tracking-wider`}
                        >
                          Priority
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${
                      darkMode ? 'divide-gray-700' : 'divide-gray-200'
                    }`}>
                      {appointments
                        .filter((a) => a.status === 'scheduled')
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .slice(0, 5)
                        .map((appointment) => {
                          const patient = patients.find((p) => p.id === appointment.patientId);
                          return (
                            <tr
                              key={appointment.id}
                              className={`${
                                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                              } transition-colors duration-150 cursor-pointer`}
                              onClick={() => handleAppointmentClick({ ...appointment, patient: patient! })}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                    {patient?.name?.charAt(0) || 'P'}
                                  </div>
                                  <div className="ml-4">
                                    <div className={`text-sm font-medium ${
                                      darkMode ? 'text-white' : 'text-gray-900'
                                    }`}>
                                      {patient?.name || 'Unknown Patient'}
                                    </div>
                                    <div className={`text-sm ${
                                      darkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                      {patient?.age || 'N/A'} years
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`text-sm ${
                                  darkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {new Date(appointment.date).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                                <div className={`text-sm ${
                                  darkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  {new Date(appointment.date).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`text-sm ${
                                  darkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {appointment.diagnosis || 'N/A'}
                                </div>
                                <div className={`text-sm ${
                                  darkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  {appointment.symptoms?.split(',').slice(0, 2).join(', ') || 'No symptoms'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  appointment.priority === 'high'
                                    ? 'bg-red-100 text-red-800'
                                    : appointment.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {appointment.priority || 'medium'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle action
                                  }}
                                  className={`${
                                    darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'
                                  }`}
                                >
                                  Details
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {selectedTab === 'patients' && (
          <div className="space-y-6">
            {/* Patients Header with Search and Actions */}
            <div className={`rounded-2xl p-6 shadow-md ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex-1 max-w-md">
                  <div className={`relative rounded-lg ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className={`h-5 w-5 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                    </div>
                    <input
                      type="text"
                      placeholder="Search patients..."
                      className={`block w-full pl-10 pr-3 py-2 border border-transparent ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
                      darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                    } transition-colors duration-200`}
                  >
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                  </button>
                  <button
                    onClick={() => setShowAddPatientModal(true)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
                      darkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } transition-colors duration-200`}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Patient</span>
                  </button>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className={`mt-4 p-4 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Status
                      </label>
                      <select
                        className={`block w-full pl-3 pr-10 py-2 text-base ${
                          darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'
                        } border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg`}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                      >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Priority
                      </label>
                      <select
                        className={`block w-full pl-3 pr-10 py-2 text-base ${
                          darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'
                        } border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg`}
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value as any)}
                      >
                        <option value="all">All Priorities</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        View Mode
                      </label>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded-lg ${
                            viewMode === 'grid'
                              ? darkMode
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-600 text-white'
                              : darkMode
                                ? 'bg-gray-600 text-gray-300'
                                : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          <Grid className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-2 rounded-lg ${
                            viewMode === 'list'
                              ? darkMode
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-600 text-white'
                              : darkMode
                                ? 'bg-gray-600 text-gray-300'
                                : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          <List className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Patients List/Grid */}
            {viewMode === 'list' ? (
              <div className={`rounded-2xl overflow-hidden shadow-md ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className={`${
                      darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className={`h-4 w-4 rounded ${
                                darkMode
                                  ? 'bg-gray-600 border-gray-500 text-blue-500'
                                  : 'border-gray-300 text-blue-600'
                              } focus:ring-blue-500`}
                              checked={selectedItems.length === filteredPatients.length && filteredPatients.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedItems(filteredPatients.map(p => p.id));
                                } else {
                                  setSelectedItems([]);
                                }
                              }}
                            />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className={`px-6 py-3 text-left text-xs font-medium ${
                            darkMode ? 'text-gray-300' : 'text-gray-500'
                          } uppercase tracking-wider`}
                        >
                          <button
                            className="flex items-center"
                            onClick={() => {
                              if (sortBy === 'name') {
                                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                              } else {
                                setSortBy('name');
                                setSortOrder('asc');
                              }
                            }}
                          >
                            Patient
                            {sortBy === 'name' && (
                              sortOrder === 'asc' ? (
                                <ChevronUp className="ml-1 h-4 w-4" />
                              ) : (
                                <ChevronDown className="ml-1 h-4 w-4" />
                              )
                            )}
                          </button>
                        </th>
                        <th
                          scope="col"
                          className={`px-6 py-3 text-left text-xs font-medium ${
                            darkMode ? 'text-gray-300' : 'text-gray-500'
                          } uppercase tracking-wider`}
                        >
                          Contact
                        </th>
                        <th
                          scope="col"
                          className={`px-6 py-3 text-left text-xs font-medium ${
                            darkMode ? 'text-gray-300' : 'text-gray-500'
                          } uppercase tracking-wider`}
                        >
                          <button
                            className="flex items-center"
                            onClick={() => {
                              if (sortBy === 'priority') {
                                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                              } else {
                                setSortBy('priority');
                                setSortOrder('asc');
                              }
                            }}
                          >
                            Priority
                            {sortBy === 'priority' && (
                              sortOrder === 'asc' ? (
                                <ChevronUp className="ml-1 h-4 w-4" />
                              ) : (
                                <ChevronDown className="ml-1 h-4 w-4" />
                              )
                            )}
                          </button>
                        </th>
                        <th
                          scope="col"
                          className={`px-6 py-3 text-left text-xs font-medium ${
                            darkMode ? 'text-gray-300' : 'text-gray-500'
                          } uppercase tracking-wider`}
                        >
                          Status
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${
                      darkMode ? 'divide-gray-700' : 'divide-gray-200'
                    }`}>
                      {filteredPatients
                        .sort((a, b) => {
                          if (sortBy === 'name') {
                            return sortOrder === 'asc'
                              ? a.name.localeCompare(b.name)
                              : b.name.localeCompare(a.name);
                          } else if (sortBy === 'priority') {
                            const priorityOrder = { high: 3, medium: 2, low: 1 };
                            return sortOrder === 'asc'
                              ? (priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium'])
                              : (priorityOrder[b.priority || 'medium'] - priorityOrder[a.priority || 'medium']);
                          }
                          return 0;
                        })
                        .map((patient) => (
                          <tr
                            key={patient.id}
                            className={`${
                              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                            } transition-colors duration-150`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                className={`h-4 w-4 rounded ${
                                  darkMode
                                    ? 'bg-gray-600 border-gray-500 text-blue-500'
                                    : 'border-gray-300 text-blue-600'
                                } focus:ring-blue-500`}
                                checked={selectedItems.includes(patient.id)}
                                onChange={() => toggleItemSelection(patient.id)}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                  {patient.name.charAt(0)}
                                </div>
                                <div className="ml-4">
                                  <div className={`text-sm font-medium ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                  }`}>
                                    {patient.name}
                                  </div>
                                  <div className={`text-sm ${
                                    darkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    {patient.age} years • {patient.gender}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm ${
                                darkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {patient.phone}
                              </div>
                              <div className={`text-sm ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {patient.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                patient.priority === 'high'
                                  ? 'bg-red-100 text-red-800'
                                  : patient.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {patient.priority || 'medium'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                patient.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {patient.status || 'active'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleEditPatient(patient)}
                                  className={`${
                                    darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'
                                  }`}
                                >
                                  <Edit3 className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDeletePatient(patient.id)}
                                  className={`${
                                    darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'
                                  }`}
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => {
                                    const patientAppointments = appointments.filter(a => a.patientId === patient.id);
                                    if (patientAppointments.length > 0) {
                                      handleAppointmentClick({
                                        ...patientAppointments[0],
                                        patient
                                      });
                                    }
                                  }}
                                  className={`${
                                    darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-900'
                                  }`}
                                >
                                  <Eye className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              // Grid View
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`rounded-2xl p-6 shadow-md transition-all duration-300 hover:shadow-lg ${
                      darkMode ? 'bg-gray-800' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className={`text-lg font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {patient.name}
                          </h3>
                          <p className={`text-sm ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {patient.age} years • {patient.gender}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          patient.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : patient.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {patient.priority || 'medium'}
                        </span>
                      </div>
                    </div>
                    <div className={`space-y-3 mt-4 ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 flex-shrink-0" />
                        <span>{patient.phone}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 flex-shrink-0" />
                        <span className="truncate">{patient.email}</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <span className="truncate">{patient.address}</span>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        patient.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {patient.status || 'active'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditPatient(patient)}
                          className={`p-2 rounded-full ${
                            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}
                        >
                          <Edit3 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeletePatient(patient.id)}
                          className={`p-2 rounded-full ${
                            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Appointments Tab */}
        {selectedTab === 'appointments' && (
          <div className="space-y-6">
            {/* Appointments Header with Search and Actions */}
            <div className={`rounded-2xl p-6 shadow-md ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex-1 max-w-md">
                  <div className={`relative rounded-lg ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className={`h-5 w-5 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                    </div>
                    <input
                      type="text"
                      placeholder="Search appointments..."
                      className={`block w-full pl-10 pr-3 py-2 border border-transparent ${
                        darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
                      darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                    } transition-colors duration-200`}
                  >
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                  </button>
                  <button
                    onClick={() => setShowAddAppointmentModal(true)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
                      darkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } transition-colors duration-200`}
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Appointment</span>
                  </button>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className={`mt-4 p-4 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Date Range
                      </label>
                      <select
                        className={`block w-full pl-3 pr-10 py-2 text-base ${
                          darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'
                        } border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg`}
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value as any)}
                      >
                        <option value="all">All Dates</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Status
                      </label>
                      <select
                        className={`block w-full pl-3 pr-10 py-2 text-base ${
                          darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'
                        } border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg`}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                      >
                        <option value="all">All Statuses</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Sort By
                      </label>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSortBy('date');
                            setSortOrder('asc');
                          }}
                          className={`flex items-center px-3 py-1 rounded-lg text-sm ${
                            sortBy === 'date' && sortOrder === 'asc'
                              ? darkMode
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-600 text-white'
                              : darkMode
                                ? 'bg-gray-600 text-gray-300'
                                : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          <span>Date</span>
                          <SortAsc className="ml-1 h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSortBy('date');
                            setSortOrder('desc');
                          }}
                          className={`flex items-center px-3 py-1 rounded-lg text-sm ${
                            sortBy === 'date' && sortOrder === 'desc'
                              ? darkMode
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-600 text-white'
                              : darkMode
                                ? 'bg-gray-600 text-gray-300'
                                : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          <span>Date</span>
                          <SortDesc className="ml-1 h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Appointments List */}
            <div className={`rounded-2xl overflow-hidden shadow-md ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={`${
                    darkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className={`h-4 w-4 rounded ${
                              darkMode
                                ? 'bg-gray-600 border-gray-500 text-blue-500'
                                : 'border-gray-300 text-blue-600'
                            } focus:ring-blue-500`}
                            checked={selectedItems.length === filteredAppointments.length && filteredAppointments.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems(filteredAppointments.map(a => a.id));
                              } else {
                                setSelectedItems([]);
                              }
                            }}
                          />
                        </div>
                      </th>
                      <th
                        scope="col"
                        className={`px-6 py-3 text-left text-xs font-medium ${
                          darkMode ? 'text-gray-300' : 'text-gray-500'
                        } uppercase tracking-wider`}
                      >
                        Patient
                      </th>
                      <th
                        scope="col"
                        className={`px-6 py-3 text-left text-xs font-medium ${
                          darkMode ? 'text-gray-300' : 'text-gray-500'
                        } uppercase tracking-wider`}
                      >
                        Date & Time
                      </th>
                      <th
                        scope="col"
                        className={`px-6 py-3 text-left text-xs font-medium ${
                          darkMode ? 'text-gray-300' : 'text-gray-500'
                        } uppercase tracking-wider`}
                      >
                        Diagnosis
                      </th>
                      <th
                        scope="col"
                        className={`px-6 py-3 text-left text-xs font-medium ${
                          darkMode ? 'text-gray-300' : 'text-gray-500'
                        } uppercase tracking-wider`}
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className={`px-6 py-3 text-left text-xs font-medium ${
                          darkMode ? 'text-gray-300' : 'text-gray-500'
                        } uppercase tracking-wider`}
                      >
                        Priority
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    darkMode ? 'divide-gray-700' : 'divide-gray-200'
                  }`}>
                    {filteredAppointments
                      .sort((a, b) => {
                        if (sortBy === 'date') {
                          return sortOrder === 'asc'
                            ? new Date(a.date).getTime() - new Date(b.date).getTime()
                            : new Date(b.date).getTime() - new Date(a.date).getTime();
                        }
                        return 0;
                      })
                      .map((appointment) => {
                        const patient = patients.find((p) => p.id === appointment.patientId);
                        return (
                          <tr
                            key={appointment.id}
                            className={`${
                              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                            } transition-colors duration-150 cursor-pointer`}
                            onClick={() => handleAppointmentClick({ ...appointment, patient: patient! })}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                className={`h-4 w-4 rounded ${
                                  darkMode
                                    ? 'bg-gray-600 border-gray-500 text-blue-500'
                                    : 'border-gray-300 text-blue-600'
                                } focus:ring-blue-500`}
                                checked={selectedItems.includes(appointment.id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleItemSelection(appointment.id);
                                }}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                  {patient?.name?.charAt(0) || 'P'}
                                </div>
                                <div className="ml-4">
                                  <div className={`text-sm font-medium ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                  }`}>
                                    {patient?.name || 'Unknown Patient'}
                                  </div>
                                  <div className={`text-sm ${
                                    darkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    {patient?.age || 'N/A'} years
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm ${
                                darkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {new Date(appointment.date).toLocaleDateString()}
                              </div>
                              <div className={`text-sm ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {new Date(appointment.date).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className={`text-sm ${
                                darkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {appointment.diagnosis || 'N/A'}
                              </div>
                              <div className={`text-sm ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {appointment.symptoms?.split(',').slice(0, 2).join(', ') || 'No symptoms'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                getStatusColor(appointment.status || 'scheduled')
                              }`}>
                                {appointment.status || 'scheduled'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                getPriorityColor(appointment.priority || 'medium')
                              }`}>
                                {appointment.priority || 'medium'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle action
                                  }}
                                  className={`${
                                    darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'
                                  }`}
                                >
                                  <Edit3 className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle action
                                  }}
                                  className={`${
                                    darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'
                                  }`}
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {selectedTab === 'analytics' && (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Patient Satisfaction',
                  value: `${dashboardStats.satisfactionRate}%`,
                  icon: <Star className="h-6 w-6" />,
                  change: '+5%',
                  trend: 'up',
                  color: 'bg-yellow-100 text-yellow-600'
                },
                {
                  title: 'Avg. Wait Time',
                  value: `${dashboardStats.averageWaitTime} mins`,
                  icon: <Clock className="h-6 w-6" />,
                  change: '-2 mins',
                  trend: 'down',
                  color: 'bg-blue-100 text-blue-600'
                },
                {
                  title: 'Revenue Today',
                  value: `$${dashboardStats.revenueToday}`,
                  icon: <BarChart3 className="h-6 w-6" />,
                  change: '+$120',
                  trend: 'up',
                  color: 'bg-green-100 text-green-600'
                },
                {
                  title: 'Pending Appointments',
                  value: dashboardStats.pendingAppointments,
                  icon: <Calendar className="h-6 w-6" />,
                  change: '+3',
                  trend: 'up',
                  color: 'bg-purple-100 text-purple-600'
                }
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`rounded-2xl p-6 shadow-md transition-all duration-300 hover:shadow-lg ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-full ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <div className={`flex items-center text-sm font-medium ${
                      stat.trend === 'up'
                        ? 'text-green-600'
                        : stat.trend === 'down'
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}>
                      {stat.change}
                      {stat.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 ml-1" />
                      ) : stat.trend === 'down' ? (
                        <TrendingUp className="h-4 w-4 ml-1 transform rotate-180" />
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-6">
                    <h3 className={`text-lg font-medium ${
                      darkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {stat.title}
                    </h3>
                    <p className={`text-3xl font-bold mt-1 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Appointments Chart */}
              <div className={`rounded-2xl p-6 shadow-md ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-lg font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Appointments Trend
                  </h2>
                  <select
                    className={`text-sm rounded-lg px-3 py-1 ${
                      darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                    } border-0 focus:ring-2 focus:ring-blue-500`}
                  >
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Last 90 Days</option>
                  </select>
                </div>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className={`text-lg ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Appointments chart will be displayed here
                  </p>
                </div>
              </div>

              {/* Patient Demographics */}
              <div className={`rounded-2xl p-6 shadow-md ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-lg font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Patient Demographics
                  </h2>
                  <select
                    className={`text-sm rounded-lg px-3 py-1 ${
                      darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                    } border-0 focus:ring-2 focus:ring-blue-500`}
                  >
                    <option>By Age</option>
                    <option>By Gender</option>
                    <option>By Condition</option>
                  </select>
                </div>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className={`text-lg ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Demographics chart will be displayed here
                  </p>
                </div>
              </div>
            </div>

            {/* Patient Conditions */}
            <div className={`rounded-2xl p-6 shadow-md ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-lg font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Common Conditions
                </h2>
                <button
                  className={`text-sm font-medium ${
                    darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  View All
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { condition: 'Hypertension', count: 42, trend: 'up' },
                  { condition: 'Diabetes', count: 28, trend: 'stable' },
                  { condition: 'Asthma', count: 19, trend: 'down' },
                  { condition: 'Arthritis', count: 15, trend: 'up' }
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {item.condition}
                      </h3>
                      {item.trend === 'up' ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : item.trend === 'down' ? (
                        <TrendingUp className="h-5 w-5 text-red-600 transform rotate-180" />
                      ) : (
                        <Activity className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <p className={`text-2xl font-bold mt-2 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {item.count}
                    </p>
                    <p className={`text-xs mt-1 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Patients
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-xl w-full max-w-md ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`p-6 border-b ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-medium ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Add New Patient
                </h3>
                <button
                  onClick={() => setShowAddPatientModal(false)}
                  className={`p-1 rounded-full ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <form onSubmit={submitPatient}>
              <div className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    className={`block w-full px-3 py-2 border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    value={newPatientData.name || ''}
                    onChange={(e) => setNewPatientData({ ...newPatientData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Age
                    </label>
                    <input
                      type="number"
                      className={`block w-full px-3 py-2 border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      value={newPatientData.age || ''}
                      onChange={(e) => setNewPatientData({ ...newPatientData, age: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Gender
                    </label>
                    <select
                      className={`block w-full px-3 py-2 border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      value={newPatientData.gender || ''}
                      onChange={(e) => setNewPatientData({ ...newPatientData, gender: e.target.value as any })}
                      required
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className={`block w-full px-3 py-2 border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    value={newPatientData.phone || ''}
                    onChange={(e) => setNewPatientData({ ...newPatientData, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Email
                  </label>
                  <input
                    type="email"
                    className={`block w-full px-3 py-2 border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    value={newPatientData.email || ''}
                    onChange={(e) => setNewPatientData({ ...newPatientData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Address
                  </label>
                  <input
                    type="text"
                    className={`block w-full px-3 py-2 border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    value={newPatientData.address || ''}
                    onChange={(e) => setNewPatientData({ ...newPatientData, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Known Diseases (comma separated)
                  </label>
                  <input
                    type="text"
                    className={`block w-full px-3 py-2 border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    value={diseasesInput}
                    onChange={(e) => setDiseasesInput(e.target.value)}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Priority
                  </label>
                  <select
                    className={`block w-full px-3 py-2 border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    value={newPatientData.priority || 'medium'}
                    onChange={(e) => setNewPatientData({ ...newPatientData, priority: e.target.value as any })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className={`p-6 border-t ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              } flex justify-end space-x-3`}>
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Appointment Modal */}
      {showAddAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-xl w-full max-w-md ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`p-6 border-b ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-medium ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Schedule Appointment
                </h3>
                <button
                  onClick={() => setShowAddAppointmentModal(false)}
                  className={`p-1 rounded-full ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <form onSubmit={submitAppointment}>
              <div className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Patient
                  </label>
                  <select
                    className={`block w-full px-3 py-2 border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    required
                  >
                    <option value="">Select Patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} ({patient.age} years)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className={`block w-full px-3 py-2 border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    value={appointmentData.date || ''}
                    onChange={(e) => setAppointmentData({ ...appointmentData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Diagnosis
                  </label>
                  <input
                    type="text"
                    className={`block w-full px-3 py-2 border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    value={appointmentData.diagnosis || ''}
                    onChange={(e) => setAppointmentData({ ...appointmentData, diagnosis: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Symptoms
                  </label>
                  <textarea
                    className={`block w-full px-3 py-2 border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    rows={3}
                    value={appointmentData.symptoms || ''}
                    onChange={(e) => setAppointmentData({ ...appointmentData, symptoms: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Priority
                    </label>
                    <select
                      className={`block w-full px-3 py-2 border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      value={appointmentData.priority || 'medium'}
                      onChange={(e) => setAppointmentData({ ...appointmentData, priority: e.target.value as any })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      className={`block w-full px-3 py-2 border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      value={appointmentData.duration || 30}
                      onChange={(e) => setAppointmentData({ ...appointmentData, duration: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
              <div className={`p-6 border-t ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              } flex justify-end space-x-3`}>
                <button
                  type="button"
                  onClick={() => setShowAddAppointmentModal(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-xl w-full max-w-2xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`p-6 border-b ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            } flex items-center justify-between`}>
              <h3 className={`text-lg font-medium ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Appointment Details
              </h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    aianalysis(selectedAppointment);
                  }}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium ${
                    darkMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  <Activity className="h-4 w-4" />
                  <span>AI Analysis</span>
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className={`p-1 rounded-full ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className={`p-4 rounded-lg ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {selectedAppointment.patient.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className={`font-medium ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {selectedAppointment.patient.name}
                        </h4>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {selectedAppointment.patient.age} years • {selectedAppointment.patient.gender}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Phone
                        </p>
                        <p className={`mt-1 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {selectedAppointment.patient.phone}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Email
                        </p>
                        <p className={`mt-1 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {selectedAppointment.patient.email || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Blood Type
                        </p>
                        <p className={`mt-1 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {selectedAppointment.patient.bloodType || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Insurance
                        </p>
                        <p className={`mt-1 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {selectedAppointment.patient.insurance || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className={`font-medium ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Appointment Information
                    </h4>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Date & Time
                        </p>
                        <p className={`mt-1 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {new Date(selectedAppointment.date).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Status
                        </p>
                        <p className="mt-1">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            getStatusColor(selectedAppointment.status || 'scheduled')
                          }`}>
                            {selectedAppointment.status || 'scheduled'}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Priority
                        </p>
                        <p className="mt-1">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            getPriorityColor(selectedAppointment.priority || 'medium')
                          }`}>
                            {selectedAppointment.priority || 'medium'}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Duration
                        </p>
                        <p className={`mt-1 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {selectedAppointment.duration || 30} mins
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className={`font-medium ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Medical Information
                    </h4>
                    <div className="mt-4 space-y-4">
                      <div>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Diagnosis
                        </p>
                        <p className={`mt-1 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {selectedAppointment.diagnosis || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Symptoms
                        </p>
                        <p className={`mt-1 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {selectedAppointment.symptoms || 'N/A'}
                        </p>
                      </div>
                      {selectedAppointment.prescriptions && selectedAppointment.prescriptions.length > 0 && (
                        <div>
                          <p className={`text-sm ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Prescriptions
                          </p>
                          <ul className={`mt-1 list-disc list-inside ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {selectedAppointment.prescriptions.map((prescription, index) => (
                              <li key={index}>{prescription}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedAppointment.instructions && (
                        <div>
                          <p className={`text-sm ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Instructions
                          </p>
                          <p className={`mt-1 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {selectedAppointment.instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className={`p-4 rounded-lg ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <h4 className={`font-medium ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Vital Signs
                    </h4>
                    <div className="mt-4 space-y-4">
                      {selectedAppointment.temperature && (
                        <div className="flex items-center space-x-3">
                          <Thermometer className={`h-6 w-6 ${getVitalColor('temperature', selectedAppointment.temperature)}`} />
                          <div>
                            <p className={`text-sm ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              Temperature
                            </p>
                            <p className={`${getVitalColor('temperature', selectedAppointment.temperature)} font-medium`}>
                              {selectedAppointment.temperature}°F
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedAppointment.bloodPressure && (
                        <div className="flex items-center space-x-3">
                          <Activity className={`h-6 w-6 ${getVitalColor('bloodPressure', selectedAppointment.bloodPressure)}`} />
                          <div>
                            <p className={`text-sm ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              Blood Pressure
                            </p>
                            <p className={`${getVitalColor('bloodPressure', selectedAppointment.bloodPressure)} font-medium`}>
                              {selectedAppointment.bloodPressure}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedAppointment.heartRate && (
                        <div className="flex items-center space-x-3">
                          <Heart className={`h-6 w-6 ${getVitalColor('heartRate', selectedAppointment.heartRate)}`} />
                          <div>
                            <p className={`text-sm ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              Heart Rate
                            </p>
                            <p className={`${getVitalColor('heartRate', selectedAppointment.heartRate)} font-medium`}>
                              {selectedAppointment.heartRate} bpm
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedAppointment.oxygenSaturation && (
                        <div className="flex items-center space-x-3">
                          <Activity className={`h-6 w-6 ${getVitalColor('oxygenSaturation', selectedAppointment.oxygenSaturation)}`} />
                          <div>
                            <p className={`text-sm ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              Oxygen Saturation
                            </p>
                            <p className={`${getVitalColor('oxygenSaturation', selectedAppointment.oxygenSaturation)} font-medium`}>
                              {selectedAppointment.oxygenSaturation}%
                            </p>
                          </div>
                        </div>
                      )}
                      {(!selectedAppointment.temperature && !selectedAppointment.bloodPressure && !selectedAppointment.heartRate && !selectedAppointment.oxygenSaturation) && (
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        } italic`}>
                          No vital signs recorded
                        </p>
                      )}
                    </div>
                  </div>

                  {AIAnalysis && (
                    <div className={`mt-6 p-4 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          AI Analysis
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          AIAnalysis.riskLevel === 'high'
                            ? 'bg-red-100 text-red-800'
                            : AIAnalysis.riskLevel === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {AIAnalysis.riskLevel || 'low'} risk
                        </span>
                      </div>
                      <div className="mt-4 space-y-4">
                        <div>
                          <p className={`text-sm ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Summary
                          </p>
                          <p className={`mt-1 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {AIAnalysis.summary}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Clinical Judgment
                          </p>
                          <p className={`mt-1 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {AIAnalysis.judgment}
                          </p>
                        </div>
                        {AIAnalysis.recommendations && AIAnalysis.recommendations.length > 0 && (
                          <div>
                            <p className={`text-sm ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              Recommendations
                            </p>
                            <ul className={`mt-1 list-disc list-inside ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {AIAnalysis.recommendations.map((recommendation, index) => (
                                <li key={index}>{recommendation}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="pt-2 border-t border-gray-300">
                          <p className={`text-xs ${
                            darkMode ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            AI Confidence: {AIAnalysis.confidence}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className={`p-6 border-t ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            } flex justify-end space-x-3`}>
              <button
                onClick={() => setShowDetailsModal(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Handle complete appointment
                  setShowDetailsModal(false);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white"
              >
                Complete Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {showEditPatientModal && editingPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-xl w-full max-w-md ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`p-6 border-b ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-medium ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Edit Patient
                </h3>
                <button
                  onClick={() => setShowEditPatientModal(false)}
                  className={`p-1 rounded-full ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              // Handle update patient
              setShowEditPatientModal(false);
            }}>
              <div className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    className={`block w-full px-3 py-2 border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    value={editingPatient.name}
                    onChange={(e) => setEditingPatient({ ...editingPatient, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Age
                    </label>
                    <input
                      type="number"
                      className={`block w-full px-3 py-2 border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      value={editingPatient.age}
                      onChange={(e) => setEditingPatient({ ...editingPatient, age: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Gender
                    </label>
                    <select
                      className={`block w-full px-3 py-2 border ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      value={editingPatient.gender || ''}
                      onChange={(e) => setEditingPatient({ ...editingPatient, gender: e.target.value as any })}
                      required
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className={`block w-full px-3 py-2 border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    value={editingPatient.phone}
                    onChange={(e) => setEditingPatient({ ...editingPatient, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Email
                  </label>
                  <input
                    type="email"
                    className={`block w-full px-3 py-2 border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    value={editingPatient.email}
                    onChange={(e) => setEditingPatient({ ...editingPatient, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Address
                  </label>
                  <input
                    type="text"
                    className={`block w-full px-3 py-2 border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    value={editingPatient.address}
                    onChange={(e) => setEditingPatient({ ...editingPatient, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Blood Type
                  </label>
                  <input
                    type="text"
                    className={`block w-full px-3 py-2 border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    value={editingPatient.bloodType || ''}
                    onChange={(e) => setEditingPatient({ ...editingPatient, bloodType: e.target.value })}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Allergies
                  </label>
                  <input
                    type="text"
                    className={`block w-full px-3 py-2 border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    value={editingPatient.allergies?.join(', ') || ''}
                    onChange={(e) => setEditingPatient({ ...editingPatient, allergies: e.target.value.split(',').map(a => a.trim()) })}
                  />
                </div>
              </div>
              <div className={`p-6 border-t ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              } flex justify-end space-x-3`}>
                <button
                  type="button"
                  onClick={() => setShowEditPatientModal(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Data Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-xl w-full max-w-md ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`p-6 border-b ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-medium ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Export Data
                </h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className={`p-1 rounded-full ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Data Type
                </label>
                <select
                  className={`block w-full px-3 py-2 border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option>Patients</option>
                  <option>Appointments</option>
                  <option>Medical Records</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => exportData('csv')}
                    className={`p-3 rounded-lg flex flex-col items-center ${
                      darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <FileText className="h-6 w-6 mb-1" />
                    <span className="text-xs">CSV</span>
                  </button>
                  <button
                    onClick={() => exportData('pdf')}
                    className={`p-3 rounded-lg flex flex-col items-center ${
                      darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <FileText className="h-6 w-6 mb-1" />
                    <span className="text-xs">PDF</span>
                  </button>
                  <button
                    onClick={() => exportData('json')}
                    className={`p-3 rounded-lg flex flex-col items-center ${
                      darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <FileText className="h-6 w-6 mb-1" />
                    <span className="text-xs">JSON</span>
                  </button>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    className={`block w-full px-3 py-2 border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  />
                  <input
                    type="date"
                    className={`block w-full px-3 py-2 border ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  />
                </div>
              </div>
            </div>
            <div className={`p-6 border-t ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            } flex justify-end space-x-3`}>
              <button
                onClick={() => setShowExportModal(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle export
                  setShowExportModal(false);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedDoctorDashboard;