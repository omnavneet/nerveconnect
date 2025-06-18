"use client"
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
} from "lucide-react"

interface Patient {
  id: string
  name: string
  age: number
  phone: string
  email: string
  address: string
  createdAt: string
  userId: string
  diseases?: string[]
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
  const [appointmentData, setAppointmentData] = useState<Partial<Appointment>>(
    {}
  )
  const [selectedPatientId, setSelectedPatientId] = useState("")

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
  }

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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Stethoscope className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              Doctor Dashboard
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Patients
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {patients.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Appointments
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {appointments.length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Today's Schedule
                </p>
                <p className="text-3xl font-bold text-slate-900">8</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Patients Section */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Patients
                  </h2>
                </div>
                <button
                  onClick={() => setShowAddPatientModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
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
                      className="animate-pulse bg-slate-200 h-16 rounded-lg"
                    ></div>
                  ))}
                </div>
              ) : patients.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No patients yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patients.map((patient) => (
                    <div
                      key={patient.id}
                      className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800">
                            {patient.name}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-slate-600">
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
                                    : disease.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Appointments Section */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Appointments
                  </h2>
                </div>
                <button
                  onClick={() => setShowAddAppointmentModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
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
                      className="animate-pulse bg-slate-200 h-16 rounded-lg"
                    ></div>
                  ))}
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No appointments yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800">
                            {appointment.diagnosis}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-slate-600">
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
                                  { hour: "2-digit", minute: "2-digit" }
                                )}
                              </span>
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">
                            {appointment.symptoms}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 text-black">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-200">
              <h3 className="text-xl font-semibold text-slate-800 flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Add New Patient</span>
              </h3>
              <button
                onClick={() => setShowAddPatientModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>
            <form onSubmit={submitPatient} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Age
                </label>
                <input
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Address
                </label>
                <input
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Diseases (Optional)
                </label>
                <input
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter diseases separated by commas"
                  value={diseasesInput}
                  onChange={(e) => setDiseasesInput(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors duration-200"
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

      {/* Add Appointment Modal */}
      {showAddAppointmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <form
            onSubmit={submitAppointment}
            className="bg-white w-full max-w-xl rounded-lg p-6 shadow-lg space-y-4 text-black"
          >
            <h2 className="text-xl font-semibold mb-2">New Appointment</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date & Time
              </label>
              <input
                type="datetime-local"
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
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
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Patient
              </label>
              <select
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                required
              >
                <option value="">Choose a patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.age})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Diagnosis
              </label>
              <input
                type="text"
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
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
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Symptoms
              </label>
              <textarea
                className="w-full border border-slate-300 rounded-lg px-3 py-2 resize-none"
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Temperature (°F)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Heart Rate (BPM)
                </label>
                <input
                  type="number"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
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
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Blood Pressure
              </label>
              <input
                type="text"
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
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
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Instructions (Optional)
              </label>
              <textarea
                className="w-full border border-slate-300 rounded-lg px-3 py-2 resize-none"
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
                onClick={() => setShowAddAppointmentModal(false)}
                className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
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

export default EnhancedDoctorDashboard
