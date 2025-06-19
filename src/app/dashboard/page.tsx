'use client';
import React, { useEffect, useState } from "react"
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
  Settings,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Zap,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  FileText,
  Users
} from "lucide-react"
import { useRouter } from "next/navigation"

interface Patient {
  id: string
  name: string
  age: number
  phone: string
  email: string
  address: string
  createdAt: string
  userId: string
  diseases?: Array<string | { id: string; name: string; patientId: string }>
}

interface Appointment {
  id: string
  date: string
  diagnosis: string
  symptoms: string
  temperature?: number
  bloodPressure?: string
  heartRate?: number
  oxygenSaturation?: number
  instructions?: string
  followUpInDays?: number
  patientId: string
  aiAnalysis?: {
    summary: string
    judgment: string
    reason: string
  }
}

const EnhancedDoctorDashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showAddPatientModal, setShowAddPatientModal] = useState(false)
  const [newPatientData, setNewPatientData] = useState<Partial<Patient>>({})
  const [diseasesInput, setDiseasesInput] = useState("")

  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false)
  const [appointmentData, setAppointmentData] = useState<Partial<Appointment>>({})
  const [selectedPatientId, setSelectedPatientId] = useState("")

  const [selectedAppointment, setSelectedAppointment] = useState<(Appointment & { patient: Patient }) | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [AIAnalysis, setAIAnalysis] = useState<{
    summary: string
    judgment: string
    reason: string
  } | null>(null)

  const [userName, setUserName] = useState<string | null>(null)
  const [count, setCount] = useState<number>(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      message: 'New patient added successfully',
      type: 'success',
      timestamp: new Date(),
      read: false
    },
    {
      id: '2',
      message: 'Appointment scheduled for tomorrow',
      type: 'info',
      timestamp: new Date(Date.now() - 300000),
      read: false
    }
  ])

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment)
    setShowDetailsModal(true)
  }

  const router = useRouter()

  // Fetch all patients
  const getAllPatients = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/patient", {
        method: "GET",
        credentials: "include",
      })
      const data = await res.json()
      setPatients(data)
      setLoading(false)
    } catch (err) {
      setError("Error fetching patients")
      setLoading(false)
    }
  }

  // Fetch all appointments
  const getAllAppointments = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/appointment", {
        method: "GET",
        credentials: "include",
      })
      const data = await res.json()
      setAppointments(data)
      setLoading(false)
    } catch (err) {
      setError("Error fetching appointments")
      setLoading(false)
    }
  }

  useEffect(() => {
    getAllPatients()
    getAllAppointments()
  }, [])

  // New Patient Function
  const submitPatient = async (e: React.FormEvent) => {
    e.preventDefault()
    const diseasesArray = diseasesInput
      ? diseasesInput
          .split(",")
          .map((d) => ({ name: d.trim() }))
          .filter((d) => d.name)
      : []

    const payload = {
      name: newPatientData.name || "",
      age: Number(newPatientData.age) || 0,
      phone: newPatientData.phone || "",
      email: newPatientData.email || "",
      address: newPatientData.address || "",
      diseases: diseasesArray,
    }

    const res = await fetch("/api/patient", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) return console.error(data.error)
    setPatients((prev) => [data.patient, ...prev])
    setNewPatientData({})
    setDiseasesInput("")
    setShowAddPatientModal(false)
    
    // Add notification
    const notification = {
      id: Date.now().toString(),
      message: `New patient ${data.patient.name} added`,
      type: 'success',
      timestamp: new Date(),
      read: false
    }
    setNotifications(prev => [notification, ...prev])
  }

  // New Appointment Function
  const submitAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
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
    }

    const res = await fetch("/api/appointment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) return console.error(data.error)
    setAppointments((prev) => [data.appointment, ...prev])
    setAppointmentData({})
    setSelectedPatientId("")
    setShowAddAppointmentModal(false)
    
    // Add notification
    const notification = {
      id: Date.now().toString(),
      message: `New appointment scheduled for ${new Date(payload.date).toLocaleDateString()}`,
      type: 'info',
      timestamp: new Date(),
      read: false
    }
    setNotifications(prev => [notification, ...prev])
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/signin")
  }

  // Get current username
  const getCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/current", {
        method: "GET",
        credentials: "include",
      })
      const data = await res.json()
      setUserName(data.username)
    } catch (error) {
      console.error("Error fetching current user:", error)
    }
  }

  useEffect(() => {
    getCurrentUser()
  }, [])

  // Fetch today's appointment count
  useEffect(() => {
    const fetchTodayCount = async () => {
      try {
        const res = await fetch("/api/appointment/today", {
          method: "GET",
          credentials: "include",
        })
        const data = await res.json()
        setCount(data.count || 0)
      } catch (error) {
        console.error("Error fetching today's appointments:", error)
      }
    }

    fetchTodayCount()
  }, [])

  // AI Analysis Function
  const aianalysis = async (appointment: Appointment & { patient: Patient }) => {
    try {
      const res = await fetch(`/api/ai_analysis`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ appointment }),
        headers: {
          "Content-Type": "application/json",
        },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "AI analysis failed")

      console.log("AI Analysis Result:", data.result)
      console.log("Appointment ID:", appointment.id)

      await fetch("/api/appointment/aiAnalysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: appointment.id,
          aiAnalysis: data.result,
        }),
      })

      setAIAnalysis(data.result)
      
      // Add notification
      const notification = {
        id: Date.now().toString(),
        message: `AI analysis generated for ${appointment.patient.name}`,
        type: 'info',
        timestamp: new Date(),
        read: false
      }
      setNotifications(prev => [notification, ...prev])
    } catch (error) {
      console.error("AI Analysis Error:", error)
    }
  }

  // Filter functions
  const filteredPatients = patients.filter(patient => {
    return patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           patient.diseases && patient.diseases.some(d => 
             typeof d === 'string' ? 
             d.toLowerCase().includes(searchTerm.toLowerCase()) : 
             d.name.toLowerCase().includes(searchTerm.toLowerCase())
           )
  })

  const filteredAppointments = appointments.filter(appointment => {
    return appointment.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
           appointment.symptoms.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Notification functions
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ))
  }

  const clearAllNotifications = () => {
    setNotifications([])
    setShowNotifications(false)
  }

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getVitalColor = (vital: string, value: number | string) => {
    if (vital === 'heartRate' && typeof value === 'number') {
      if (value < 60 || value > 100) return 'text-red-600'
      return 'text-green-600'
    }
    if (vital === 'temperature' && typeof value === 'number') {
      if (value > 99.5) return 'text-red-600'
      return 'text-green-600'
    }
    if (vital === 'oxygenSaturation' && typeof value === 'number') {
      if (value < 95) return 'text-red-600'
      return 'text-green-600'
    }
    return 'text-black-700'
  }

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
                <p className="text-sm text-gray-900">Intelligent Healthcare Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-900 hover:text-blue-600 transition-colors relative"
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
                        <div className="p-4 text-center text-gray-900">
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
                                <p className="text-xs text-gray-900 mt-1">
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

                <span className="text-gray-900 font-medium">Dr. {userName}</span>
                <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                Logout
              </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900">Total Patients</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{patients.length}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>{patients.length > 0 ? Math.round(patients.length / 10 * 100) : 0}% from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900">Total Appointments</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{appointments.length}</h3>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-600">
              <Clock className="h-4 w-4 mr-1" />
              <span>{count} scheduled today</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900">Completed Today</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length}</h3>
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

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600" />
              <input
                type="text"
                placeholder="Search patients and appointments..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 focus:text-gray-900 placeholder-gray-900 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-5 w-5 text-gray-900" />
                <span className="text-gray-900">Filters</span>
                {showFilters ? (
                  <ChevronUp className="h-5 w-5 text-gray-900" />
                ) : (
                <ChevronDown className="h-5 w-5 text-gray-900" />
                )}
              </button>
            </div>
          </div>
          
          {showFilters && (
  <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
    <style>
      {`
        select {
          color: #1F2937; /* text-gray-900 for selected value */
        }
        select option {
          color: #1F2937; /* text-gray-900 for dropdown options */
        }
        select:invalid {
          color: #9CA3AF; /* text-gray-400 as fallback for placeholder-like state */
        }
        select option:checked {
          color: #1F2937; /* Ensure checked option is dark */
        }
      `}
    </style>
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-1">Status</label>
      <select
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="all">All Statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
    
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-1">Date Range</label>
      <select
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="all">All Time</option>
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
      </select>
    </div>
    
    <div className="flex items-end">
      <button
        onClick={() => setShowFilters(false)}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Reset Filters
      </button>
    </div>
  </div>
)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Patients Section */}
          <section className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Patients
                  </h2>
                </div>
                <button
                  onClick={() => setShowAddPatientModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all shadow-md hover:shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Patient</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse bg-gray-200 h-16 rounded-lg"
                    ></div>
                  ))}
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-900">No patients found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                      onClick={() => {
                        const patientAppointments = appointments.filter(a => a.patientId === patient.id)
                        if (patientAppointments.length > 0) {
                          setSelectedAppointment({
                            ...patientAppointments[0],
                            patient
                          })
                          setShowDetailsModal(true)
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {patient.name}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-900">
                            <span className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{patient.age} years</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{patient.email}</span>
                            </span>
                          </div>
                          {patient.diseases && patient.diseases.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {patient.diseases.map((disease, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full"
                                >
                                  {typeof disease === "string"
                                    ? disease
                                    : (disease as any).name ||
                                      "Unknown Disease"}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-900">
                          {new Date(patient.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Appointments Section */}
          <section className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Appointments
                  </h2>
                </div>
                <button
                  onClick={() => setShowAddAppointmentModal(true)}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all shadow-md hover:shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Appointment</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse bg-gray-200 h-16 rounded-lg"
                    ></div>
                  ))}
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-900">No appointments found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAppointments.map((appointment) => {
                    const patient = patients.find(p => p.id === appointment.patientId)
                    return (
                      <div
                        key={appointment.id}
                        onClick={() => handleAppointmentClick({...appointment, patient})}
                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {appointment.diagnosis}
                            </h3>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-900">
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {new Date(
                                    appointment.date
                                  ).toLocaleDateString()}
                                </span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {new Date(appointment.date).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </span>
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 mt-1">
                              {appointment.symptoms}
                            </p>
                            {patient && (
                              <div className="mt-2 flex items-center">
                                <User className="h-3 w-3 text-gray-600 mr-1" />
                                <span className="text-xs text-gray-900">{patient.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold text-gray-900 pr-10">
                {selectedAppointment.diagnosis}
              </h2>
              <p className="text-sm text-gray-900 mt-1">
                Medical Record Details
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Patient Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Name:
                    </span>
                    <p className="text-gray-800">
                      {selectedAppointment.patient.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Age:
                    </span>
                    <p className="text-gray-800">
                      {selectedAppointment.patient.age} years
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Email:
                    </span>
                    <p className="text-gray-800">
                      {selectedAppointment.patient.email}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Phone:
                    </span>
                    <p className="text-gray-800">
                      {selectedAppointment.patient.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Appointment Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Date & Time:
                    </span>
                    <p className="text-gray-800">
                      {new Date(selectedAppointment.date).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Symptoms:
                    </span>
                    <p className="text-gray-800">
                      {selectedAppointment.symptoms}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Instructions:
                    </span>
                    <p className="text-gray-800">
                      {selectedAppointment.instructions || "None provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Vital Signs */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Vital Signs
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <span className="text-xs font-medium text-gray-900 uppercase tracking-wide">
                      Blood Pressure
                    </span>
                    <p className={`text-lg font-semibold ${getVitalColor('bloodPressure', selectedAppointment.bloodPressure || '')}`}>
                      {selectedAppointment.bloodPressure || "N/A"}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <span className="text-xs font-medium text-gray-900 uppercase tracking-wide">
                      Heart Rate
                    </span>
                    <p className={`text-lg font-semibold ${getVitalColor('heartRate', selectedAppointment.heartRate || 0)}`}>
                      {selectedAppointment.heartRate || "N/A"} bpm
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <span className="text-xs font-medium text-gray-900 uppercase tracking-wide">
                      Oxygen Saturation
                    </span>
                    <p className={`text-lg font-semibold ${getVitalColor('oxygenSaturation', selectedAppointment.oxygenSaturation || 0)}`}>
                      {selectedAppointment.oxygenSaturation || "N/A"}%
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <span className="text-xs font-medium text-gray-900 uppercase tracking-wide">
                      Temperature
                    </span>
                    <p className={`text-lg font-semibold ${getVitalColor('temperature', selectedAppointment.temperature || 0)}`}>
                      {selectedAppointment.temperature || "N/A"}°F
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Analysis Section */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  AI Analysis
                </h3>

                <div className="space-y-3">
                  <button
                    onClick={() => aianalysis(selectedAppointment)}
                    className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    Generate AI Analysis
                  </button>

                  {selectedAppointment.aiAnalysis ? (
                    <div className="bg-white rounded-lg p-4 border border-gray-200 text-gray-800 space-y-2">
                      <div>
                        <span className="font-semibold">Summary:</span>{" "}
                        {selectedAppointment.aiAnalysis.summary}
                      </div>
                      <div>
                        <span className="font-semibold">Judgment:</span>{" "}
                        <span
                          className={`font-medium px-2 py-1 rounded-md ${
                            selectedAppointment.aiAnalysis.judgment === "Normal"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {selectedAppointment.aiAnalysis.judgment}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold">Reason:</span>{" "}
                        {selectedAppointment.aiAnalysis.reason}
                      </div>
                    </div>
                  ) : AIAnalysis ? (
                    <div className="bg-white rounded-lg p-4 border border-gray-200 text-gray-800 space-y-2">
                      <div>
                        <span className="font-semibold">Summary:</span>{" "}
                        {AIAnalysis.summary}
                      </div>
                      <div>
                        <span className="font-semibold">Judgment:</span>{" "}
                        <span
                          className={`font-medium px-2 py-1 rounded-md ${
                            AIAnalysis.judgment === "Normal"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {AIAnalysis.judgment}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold">Reason:</span>{" "}
                        {AIAnalysis.reason}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-4 border border-gray-200 min-h-[60px] flex items-center justify-center text-gray-900 text-sm">
                      AI analysis will appear here
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {showAddPatientModal && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl w-full max-w-md shadow-xl relative max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <User className="h-5 w-5 text-blue-600" />
          <span>Add New Patient</span>
        </h3>
        <button
          onClick={() => setShowAddPatientModal(false)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      <form onSubmit={submitPatient} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Full Name
          </label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-900 text-gray-900"
            placeholder="Enter patient name"
            value={newPatientData.name || ""}
            onChange={(e) =>
              setNewPatientData({
                ...newPatientData,
                name: e.target.value,
              })
            }
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Age
          </label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-900 text-gray-900"
            type="number"
            placeholder="Enter age"
            value={newPatientData.age || ""}
            onChange={(e) =>
              setNewPatientData({
                ...newPatientData,
                age: Number(e.target.value),
              })
            }
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Phone Number
          </label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-900 text-gray-900"
            placeholder="Enter phone number"
            value={newPatientData.phone || ""}
            onChange={(e) =>
              setNewPatientData({
                ...newPatientData,
                phone: e.target.value,
              })
            }
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Email Address
          </label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-900 text-gray-900"
            type="email"
            placeholder="Enter email address"
            value={newPatientData.email || ""}
            onChange={(e) =>
              setNewPatientData({
                ...newPatientData,
                email: e.target.value,
              })
            }
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Address
          </label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-900 text-gray-900"
            placeholder="Enter address"
            value={newPatientData.address || ""}
            onChange={(e) =>
              setNewPatientData({
                ...newPatientData,
                address: e.target.value,
              })
            }
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Diseases (Optional)
          </label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-900 text-gray-900"
            placeholder="Enter diseases separated by commas"
            value={diseasesInput}
            onChange={(e) => setDiseasesInput(e.target.value)}
          />
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => setShowAddPatientModal(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            Save Patient
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {showAddAppointmentModal && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <form
      onSubmit={(e) => {
        e.preventDefault();
        console.log("Form submitted:", appointmentData);
        submitAppointment(e);
      }}
      className="bg-white w-full max-w-xl rounded-lg p-6 shadow-lg space-y-4"
    >
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <h2 className="text-xl font-semibold text-gray-900">New Appointment</h2>
        <button
          onClick={() => {
            console.log("Cancel clicked");
            setShowAddAppointmentModal(false);
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Date & Time
        </label>
        <input
          type="datetime-local"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-900 text-gray-900"
          value={appointmentData.date || ""}
          onChange={(e) =>
            setAppointmentData({
              ...appointmentData,
              date: e.target.value,
            })
          }
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Select Patient
        </label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          required
        >
          <option value="">Choose a patient</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id} className="text-gray-900">
              {p.name} ({p.age})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Diagnosis
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-900 text-gray-900"
          value={appointmentData.diagnosis || ""}
          onChange={(e) =>
            setAppointmentData({
              ...appointmentData,
              diagnosis: e.target.value,
            })
          }
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Symptoms
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-900 text-gray-900"
          rows={3}
          value={appointmentData.symptoms || ""}
          onChange={(e) =>
            setAppointmentData({
              ...appointmentData,
              symptoms: e.target.value,
            })
          }
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Temperature (°F)
          </label>
          <input
            type="number"
            step="0.1"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-900 text-gray-900"
            placeholder="98.6"
            value={appointmentData.temperature || ""}
            onChange={(e) =>
              setAppointmentData({
                ...appointmentData,
                temperature: Number(e.target.value),
              })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Heart Rate (BPM)
          </label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-900 text-gray-900"
            placeholder="72"
            value={appointmentData.heartRate || ""}
            onChange={(e) =>
              setAppointmentData({
                ...appointmentData,
                heartRate: Number(e.target.value),
              })
            }
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Oxygen Saturation (%)
        </label>
        <input
          type="number"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-900 text-gray-900"
          placeholder="95"
          value={appointmentData.oxygenSaturation || ""}
          onChange={(e) =>
            setAppointmentData({
              ...appointmentData,
              oxygenSaturation: Number(e.target.value),
            })
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Blood Pressure
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-900 text-gray-900"
          placeholder="120/80"
          value={appointmentData.bloodPressure || ""}
          onChange={(e) =>
            setAppointmentData({
              ...appointmentData,
              bloodPressure: e.target.value,
            })
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Instructions (Optional)
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-900 text-gray-900"
          rows={2}
          placeholder="Any special instructions or notes"
          value={appointmentData.instructions || ""}
          onChange={(e) =>
            setAppointmentData({
              ...appointmentData,
              instructions: e.target.value,
            })
          }
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => {
            console.log("Cancel clicked");
            setShowAddAppointmentModal(false);
          }}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
        >
          Save Appointment
        </button>
      </div>
    </form>
  </div>
)}
    </div>
  )
}

export default EnhancedDoctorDashboard;
