import { createRouter, createWebHistory } from 'vue-router'
import AppointmentBooking from './views/patient/AppointmentBookingPage.vue'
import Register from './views/RegistrationPage.vue'
import Login from './views/LoginPage.vue'
import StartPage from "./views/StartPage.vue";

const routes = [
  { path: '/', name: 'Start Page', component: StartPage },
  { path: '/booking', name: 'Booking Page', component: AppointmentBooking },
  { path: '/register', name: 'Registration Page', component: Register },
  { path: '/login', name: 'Login Page', component: Login }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
