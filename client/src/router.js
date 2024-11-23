import { createRouter, createWebHistory } from 'vue-router'
import appointmentBooking from './views/patient/appointmentBooking.vue'
import Register from './views/patient/registration.vue'
import Login from './views/patient/login.vue'

const routes = [
  { path: '/booking', name: 'appointmentBooking', component: appointmentBooking },
  { path: '/registration', name: 'Register', component: Register },
  { path: '/login', name: 'Login', component: Login }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
