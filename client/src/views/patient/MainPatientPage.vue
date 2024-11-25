<template>
    <div class="page">
      <div class="sidebar">
        <ul>
          <li v-for="dentist in dentists" :key="dentist.id">
            <div class="dentist-card">
                <router-link
                    style="text-decoration: none"
                    :to="{ name: 'Booking Page', params: { dentistId: dentist._id } }">
                    <p> - Dentist: {{ dentist.firstName }} {{ dentist.secondName }}</p>
                </router-link>
            </div>
          </li>
        </ul>
      </div>
      <div class="main">
        <h1>Find a Dentist</h1>
      </div>
    </div>
  </template>
  <script>
  import { Api } from '../../Api.js'

    export default {
        data() {
          return {
            dentists: []
          };
        },
        methods: {
            async fetchDentist() {
                try {
                  const response = await Api.get('/v1/dentists')
                  this.dentists = response.data
                } catch (error) {
                    this.message = `Error: ${error}`
                }
            }
        },
        mounted() {
            this.fetchDentist()
        }
    }
  </script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 250px;
  background-color: #f8f9fa;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.dentist-card {
  background-color: #ffffff;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.dentist-card:hover {
  background-color: #e0e0e0;
}
</style>
