"use client";

import { useState } from "react";
import styles from "./page.module.css"; // Import CSS module

export default function Home() {
  const [appointments, setAppointments] = useState([]);
  const [doctorName, setDoctorName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [formData, setFormData] = useState({
    PatientName: "",
    AadharNumber: "",
    TimeSlot: "09:00-10:00",
    TypeOfMeet: "IP",
    Status: "U",  // Assuming the status is 'Completed' by default, adjust as needed
    Doctor: "",
  });

  // States to manage which content is visible
  const [showAppointments, setShowAppointments] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [showAppointmentsTitle, setShowAppointmentsTitle] = useState(true); // Controls visibility of "All Appointments" title

  const fetchAllAppointments = async () => {
    try {
      const response = await fetch("/api/sheets");
      const data = await response.json();
      setAppointments(data);

      // Show all appointments and hide other sections
      setShowAppointments(true);
      setDoctorName("");
      setSpecialization("");
      setShowForm(false);
      setShowDoctorDropdown(false);
    } catch (error) {
      console.error("Error fetching all appointments:", error);
    }
  };

  const fetchDoctorAvailability = async (doctor) => {
    try {
      const response = await fetch(`/api/sheets?doctor=${doctor}`);
      const data = await response.json();
      setAppointments(data);
      const [docName, spec] = doctor.split(':');
      setDoctorName(docName.trim()); // Set the selected doctor's name
      setSpecialization(spec.trim()); // Set the selected doctor's specialization

      // Show doctor availability and hide other sections
      setShowAppointments(true);
      setShowForm(false);
      setShowDoctorDropdown(false);
    } catch (error) {
      console.error("Error fetching doctor availability:", error);
    }
  };

  const handleBookAppointmentClick = () => {
    // Hide all other sections except the appointment form
    setShowAppointments(false);
    setShowForm(true);
    setShowDoctorDropdown(false);
    setDoctorName("");
    setSpecialization("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      // Construct the PatientName field in the required format
      const patientData = `{{{${formData.PatientName}:${formData.AadharNumber}}:${formData.TypeOfMeet}}:${formData.Status}}`;

      const response = await fetch("/api/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          PatientName: patientData, 
          TimeSlot: formData.TimeSlot, 
          Doctor: formData.Doctor 
        }),
      });

      const result = await response.json();

      if (!response.ok)
        throw new Error(result.error || "Failed to add appointment");

      alert("Appointment booked successfully");
      setShowForm(false); // Hide the form after successful submission
    } catch (error) {
      console.error("Error booking appointment:", error.message);
      alert(`Error: ${error.message}`);
    }
  };

  const parsePatientData = (data) => {
    const regex = /{{{(.+):(.+)}:(IP|V)}:(C|U|A)}/;
    const match = data.match(regex);
    if (match) {
      return {
        name: match[1],
        aadhar: match[2],
        typeOfMeet: match[3],
        status: match[4],
      };
    }
    return { name: "N/A", aadhar: "N/A", typeOfMeet: "N/A", status: "N/A" };
  };

  const typeOfMeetMapping = {
    IP: "In Person",
    V: "Virtual",
  };

  const statusMapping = {
    C: "Completed",
    U: "Unattended",
    A: "Absent",
  };

  const timeSlots = [
    "09:00-10:00",
    "10:00-11:00",
    "11:00-12:00",
    "12:00-13:00",
    "13:00-14:00",
    "14:00-15:00",
    "15:00-16:00",
    "16:00-17:00"
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Vaidya Web Portal</h1>

      {/* Buttons */}
      <div className={styles.buttonContainer}>
        <button onClick={handleBookAppointmentClick} className={styles.button}>
          Book Appointment
        </button>
        <button onClick={fetchAllAppointments} className={styles.button}>
          See All Scheduled Appointments
        </button>
        <button
          onClick={() => {
            setShowDoctorDropdown(true); // Show doctor availability dropdown
            setShowAppointments(false); // Hide appointments table
            setShowForm(false); // Hide form, if you want
            setShowAppointmentsTitle(false);
          }}
          className={styles.button}
        >
          See Doctor Availability
        </button>
      </div>

      {/* Dropdown for selecting a doctor */}
      {showDoctorDropdown && (
        <div className={styles.inputField2}>
          <select
            onChange={(e) => {
              fetchDoctorAvailability(e.target.value);
              setShowDoctorDropdown(false); // Close dropdown after selection
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Select Doctor
            </option>
            <option value="Dr. A:cardiac">Dr. A - Cardiac</option>
            <option value="Dr. B:Nuero">Dr. B - Nuero</option>
            <option value="Dr. C:Gynac">Dr. C - Gynac</option>
          </select>
        </div>
      )}

      {/* Doctor's Schedule */}
      {showAppointments && doctorName && specialization && (
        <div className={styles.doctorSchedule}>
          <h2 className={styles.doctorTitle}>{`${doctorName}'s Schedule - ${specialization}`}</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Aadhar No.</th>
                <th>Type of Meet</th>
                <th>Time Slot</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment, index) => {
                const patientData = parsePatientData(appointment.PatientName);
                return (
                  <tr key={index}>
                    <td>{patientData.name}</td>
                    <td>{patientData.aadhar}</td>
                    <td>{typeOfMeetMapping[patientData.typeOfMeet] || "N/A"}</td>
                    <td>{appointment.TimeSlot}</td>
                    <td>{statusMapping[patientData.status] || "N/A"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* All Appointments */}
      {showAppointments && !doctorName && (
        <div className={styles.doctorSchedule}>
          <h2 className={styles.doctorTitle}>All Appointments</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Aadhar No.</th>
                <th>Type of Meet</th>
                <th>Time Slot</th>
                <th>Doctor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment, index) => {
                const patientData = parsePatientData(appointment.PatientName);
                return (
                  <tr key={index}>
                    <td>{patientData.name}</td>
                    <td>{patientData.aadhar}</td>
                    <td>{typeOfMeetMapping[patientData.typeOfMeet] || "N/A"}</td>
                    <td>{appointment.TimeSlot}</td>
                    <td>{appointment.Doctor}</td>
                    <td>{statusMapping[patientData.status] || "N/A"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Book Appointment Form */}
      {showForm && (
        <div className={styles.formContainer}>
          <h2>Book Appointment</h2>
          <form onSubmit={handleFormSubmit}>
            <div className={styles.inputField}>
              <label>Patient Name: </label>
              <input
                type="text"
                name="PatientName"
                value={formData.PatientName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.inputField}>
              <label>Aadhar Number: </label>
              <input
                type="text"
                name="AadharNumber"
                value={formData.AadharNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.inputField}>
              <label>Time Slot: </label>
              <select
                name="TimeSlot"
                value={formData.TimeSlot}
                onChange={handleInputChange}
                required
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.inputField}>
              <label>Type of Meet: </label>
              <select
                name="TypeOfMeet"
                value={formData.TypeOfMeet}
                onChange={handleInputChange}
                required
              >
                <option value="IP">In Person</option>
                <option value="V">Virtual</option>
              </select>
            </div>
            <div className={styles.inputField}>
              <label>Doctor: </label>
              <select
                name="Doctor"
                value={formData.Doctor}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Doctor</option>
                <option value="Dr. A:cardiac">Dr. A - Cardiac</option>
                <option value="Dr. B:Nuero">Dr. B - Nuero</option>
                <option value="Dr. C:Gynac">Dr. C - Gynac</option>
              </select>
            </div>
            <div className={styles.inputField}>
              <button type="submit">Submit</button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
