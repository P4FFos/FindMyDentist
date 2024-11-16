import { createRouter, createWebHistory } from 'vue-router'
import appointmentBooking from './views/appointmentBooking.vue'

const routes = [
  { path: '/', name: 'appointmentBooking', component: appointmentBooking }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
