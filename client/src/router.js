import { createRouter, createWebHistory } from 'vue-router'
import AppointmentBooking from './views/patient/AppointmentBookingPage.vue'
import Register from './views/RegistrationPage.vue'
import Login from './views/LoginPage.vue'
import StartPage from "./views/StartPage.vue";
import  MainPatientPage from "./views/patient/MainPatientPage.vue";
import TimeslotsManagement from './views/dentist/TimeslotsManagementPage.vue';

const routes = [
  { path: '/', name: 'Start Page', component: StartPage },
  { path: '/dentist/:dentistId/booking', name: 'Booking Page', component: AppointmentBooking, props: true },
  { path: '/dentist/:dentistId/managing', name: 'Booking Managing Page', component: TimeslotsManagement },
  { path: '/patient_main', name: 'Patient Main Page', component: MainPatientPage },
  { path: '/register', name: 'Registration Page', component: Register },
  { path: '/login', name: 'Login Page', component: Login }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
