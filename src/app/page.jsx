'use client';

import { useState } from 'react';
import styles from './page.module.css'; // Import CSS module

export default function Home() {
  const [appointments, setAppointments] = useState([]);
  const [doctorName, setDoctorName] = useState('');
  const [formData, setFormData] = useState({
    PatientName: '',
    AppointmentDate: '',
    Doctor: '',
    Status: 'Pending',
  });

  // States to manage which content is visible
  const [showAppointments, setShowAppointments] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [showAppointmentsTitle, setShowAppointmentsTitle] = useState(true); // Controls visibility of "All Appointments" title


  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/sheets');
      const data = await response.json();
      setAppointments(data);
      
      // Hide other sections and show appointments
      setShowAppointments(true);
      setDoctorName(false);
      setShowForm(false);
      setShowDoctorDropdown(false); 
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchDoctorAvailability = async (doctor) => {
    try {
      const response = await fetch(`/api/sheets?doctor=${doctor}`);
      const data = await response.json();
      setAppointments(data);
      setDoctorName(doctor); // Set the selected doctor's name
      
      // Hide other sections and show the doctor availability
      setShowAppointments(true);
      setShowForm(false);
      setShowDoctorDropdown(false);
    } catch (error) {
      console.error('Error fetching doctor availability:', error);
    }
  };

  const handleBookAppointmentClick = () => {
    // Hide all other sections except the appointment form
    setShowAppointments(false);
    setShowForm(true);
    setShowDoctorDropdown(false);
    setDoctorName(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to add appointment');

      alert('Appointment booked successfully');
      setShowForm(false); // Hide the form after successful submission
    } catch (error) {
      console.error('Error booking appointment:', error.message);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Vaidya Web Portal</h1>

      {/* Buttons */}
      <div className={styles.buttonContainer}>
        <button onClick={handleBookAppointmentClick} className={styles.button}>
          Book Appointment
        </button>
        <button onClick={fetchAppointments} className={styles.button}>
          See All Scheduled Appointments
        </button>
        <button onClick={() => {
    setShowDoctorDropdown(true); // Show doctor availability dropdown
    setShowAppointments(false);  // Hide appointments table
    setShowForm(false);          // Hide form, if you want
    setShowAppointmentsTitle(false);
  }} className={styles.button}>
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
            <option value="" disabled>Select Doctor</option>
            <option value="Dr. A">Dr. A</option>
            <option value="Dr. B">Dr. B</option>
            <option value="Dr. C">Dr. C</option>
          </select>
        </div>
      )}

      {/* Doctor's Schedule */}
      {showAppointments && doctorName && (
        <div className={styles.doctorSchedule}>
          <h2 className={styles.doctorTitle}>{`${doctorName}'s Schedule`}</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment, index) => (
                <tr key={index}>
                  <td>{appointment.PatientName || 'N/A'}</td>
                  <td>{appointment.AppointmentDate || 'N/A'}</td>
                  <td>{appointment.Status || 'N/A'}</td>
                </tr>
              ))}
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
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment, index) => (
                <tr key={index}>
                  <td>{appointment.PatientName || 'N/A'}</td>
                  <td>{appointment.AppointmentDate || 'N/A'}</td>
                  <td>{appointment.Status || 'N/A'}</td>
                </tr>
              ))}
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
              <label>Appointment Date: </label>
              <input
                type="date"
                name="AppointmentDate"
                value={formData.AppointmentDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.inputField}>
              <label>Doctor: </label>
              <select name="Doctor" value={formData.Doctor} onChange={handleInputChange} required>
                <option value="">Select Doctor</option>
                <option value="Dr. A">Dr. A</option>
                <option value="Dr. B">Dr. B</option>
                <option value="Dr. C">Dr. C</option>
              </select>
            </div>
            <div className={styles.inputField}>
              <button type="submit">Submit</button>
              <button type="button" onClick={() => setShowForm(false)} className={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
