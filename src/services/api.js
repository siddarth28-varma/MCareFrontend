const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Cannot reach the MediCare API at ${API_BASE}. Start Spring Boot and check its MySQL connection.`);
    }
    throw error;
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.detail || payload.message || `Request failed (${response.status})`);
  }
  if (response.status === 204) return null;
  return response.json();
}

const json = (method, body) => ({ method, body: JSON.stringify(body) });

export const api = {
  login: (data) => request('/auth/login', json('POST', data)),
  register: (data) => request('/auth/register', json('POST', data)),
  doctors: (specialization = '') => request(`/doctors${specialization ? `?specialization=${encodeURIComponent(specialization)}` : ''}`),
  doctor: (id) => request(`/doctors/${id}`),
  doctorForUser: (id) => request(`/doctors/by-user/${id}`),
  patientForUser: (id) => request(`/patients/by-user/${id}`),
  patient: (id) => request(`/patients/${id}`),
  patients: () => request('/patients'),
  updatePatient: (id, data) => request(`/patients/${id}`, json('PUT', data)),
  slots: (doctorId, date) => request(`/doctors/${doctorId}/availability?date=${date}`),
  appointments: () => request('/appointments'),
  patientAppointments: (id) => request(`/appointments/patient/${id}`),
  doctorAppointments: (id) => request(`/appointments/doctor/${id}`),
  book: (data) => request('/appointments', json('POST', data)),
  cancel: (id) => request(`/appointments/${id}/cancel`, { method: 'PATCH' }),
  complete: (id) => request(`/appointments/${id}/complete`, { method: 'PATCH' }),
  consultation: (id) => request(`/appointments/${id}/consultation`),
  saveConsultation: (id, data) => request(`/appointments/${id}/consultation`, json('PUT', data)),
  addDoctor: (data) => request('/doctors', json('POST', data)),
  updateDoctor: (id, data) => request(`/doctors/${id}`, json('PUT', data)),
  deleteDoctor: (id) => request(`/doctors/${id}`, { method: 'DELETE' }),
  summary: () => request('/admin/summary'),
};
