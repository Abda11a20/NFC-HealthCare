// ============================================================================
// API Routes Configuration
// All backend endpoints in one place — easy to audit and modify.
// Base URL is loaded from .env file (VITE_API_URL)
// ============================================================================

const API = {
    // ======================== AUTH ========================
    AUTH: {
        LOGIN_PATIENT:      '/auth/login/patient',       // POST { nationalId }
        LOGIN_STAFF:        '/auth/login',                // POST { email, password } — for doctor, admin, hospital admin, receptionist
        SIGNUP_PATIENT:     '/auth/signup/patient',       // POST { firstName, lastName, nationalId, gender, dateOfBirth, phoneNumber, address, emergencyContact, cardId }
        SIGNUP_DOCTOR:      '/auth/signup/doctor',        // POST { firstName, lastName, specialization, phoneNumber, password, email, hospitalId }
        PATIENT_PROFILE:    '/auth/patient/profile',      // GET  (token)
        DOCTOR_PROFILE:     '/auth/doctor/profile',       // GET  (token)
        PATIENT_UPDATE:     '/auth/patient/update',       // PUT  (token) { nationalId?, cardId?, ... }
        DOCTOR_UPDATE:      '/auth/doctor/update',        // PUT  (token) { firstName, lastName, specialization, phoneNumber }
        FORGET_PASSWORD:    '/auth/doctor/forget-password',// POST { email }
        RESET_PASSWORD:     '/auth/doctor/reset-password', // POST { email, otp, newPassword }
    },

    // ======================== ADMIN (Super Admin) ========================
    ADMIN: {
        CREATE_ADMIN:           '/admin/create-admin',           // POST { fullName, email, password, phoneNumber }
        CREATE_HOSPITAL_ADMIN:  '/admin/create-hospital-admin',  // POST { fullName, email, phoneNumber, password, hospitalId }
        GET_ALL_ADMINS:         '/admin/admins',                 // GET  (token)
        DELETE_ADMIN:           (id) => `/admin/admin/${id}`,    // DELETE (token)
    },

    // ======================== HOSPITAL ========================
    HOSPITAL: {
        CREATE:     '/hospital/create',                      // POST { name, address, phoneNumber, email, hotline, licenseNumber, departments[] }
        GET_ALL:    '/hospital/',                             // GET  (token)
        GET_BY_ID:  (id) => `/hospital/${id}`,               // GET  (token)
        UPDATE:     (id) => `/hospital/update/${id}`,        // PUT  (token)
        DELETE:     (id) => `/hospital/delete/${id}`,        // DELETE (token)
    },

    // ======================== ADMIN HOSPITAL ========================
    ADMIN_HOSPITAL: {
        PROFILE:                '/admin-hospital/profile',               // GET  (token)
        CREATE_RECEPTIONIST:    '/admin-hospital/create-receptionist/',   // POST { fullName, email, phoneNumber, password }
        GET_RECEPTIONISTS:      '/admin-hospital/receptionists',         // GET  (token)
        UPDATE_RECEPTIONIST:    (id) => `/admin-hospital/update/${id}`,  // PUT  (token) { fullName?, password? }
        DELETE_RECEPTIONIST:    (id) => `/admin-hospital/${id}`,         // DELETE (token)
    },

    // ======================== MEDICAL RECORD ========================
    MEDICAL_RECORD: {
        ADD:        '/medical-record/add',                   // POST (token)
        GET_ALL:    '/medical-record/',                      // GET  (token) — requires doctor/patient/admin token
        GET_BY_ID:  (id) => `/medical-record/${id}`,         // GET  (token)
        UPDATE:     (id) => `/medical-record/${id}`,         // PUT  (token)
        DELETE:     (id) => `/medical-record/${id}`,         // DELETE (token)
    },

    // ======================== RECEPTIONIST ========================
    RECEPTIONIST: {
        ASSIGN_PATIENT:     '/receptionist/assign-patient',                  // POST { doctorId, patientId }
        GET_DOCTOR_PATIENTS: (id) => `/receptionist/doctor/${id}/patients`,  // GET  (token)
    },
};

export default API;
