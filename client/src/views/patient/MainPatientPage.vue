<template>
    <div class="page">
      <div class="hamburgerMenu" v-if="isSmallScreen" @click="toggleNavBar">
        <h1>☰</h1>
      </div>
      <div :class="['sidebar', { 'sidebar-visible': isNavVisible, 'sidebar-hidden': isSmallScreen && !isNavVisible }]"
      v-if="isNavVisible || !isSmallScreen">
        <h2>Dentists</h2>
        <ul>
          <li v-for="dentist in dentists" :key="dentist.id" class="dentist-item">
            <div class="dentist-card">
              <router-link
                style="text-decoration: none; color: inherit;"
                :to="{ name: 'Booking Page', params: { dentistId: dentist._id } }">
                <p> Dentist: {{ dentist.firstName }} {{ dentist.lastName }}</p>
              </router-link>
            </div>
          </li>
        </ul>
      </div>
      <div class="main d-flex flex-column align-items-center justify-content-center vh-100 text-center content" :class="{ 'hiddenContent': isSmallScreen && isNavVisible }">
        <h1>Find a Dentist</h1>
        <div id="map" class="map-placeholder">
          <p>Map will be displayed here</p>
        </div>
        <p>Click markers to see what dentist it is!</p>
        <p>Book an appointment by selecting a dentist from the sidebar</p>
      </div>
    </div>
  </template>

<script>
import mqtt from 'mqtt';
import {Loader} from "@googlemaps/js-api-loader"

export default {
  data() {
    return {
      dentists: [],
      map: null,
      mqttClient: null,
      isSmallScreen: false,
      isNavVisible: false
    };
  },
  methods: {
    toggleNavBar() {
      if (this.isSmallScreen) {
        this.isNavVisible = !this.isNavVisible
      }
    },
    handleResize() {
      this.isSmallScreen = window.innerWidth <= 768
      if (!this.isSmallScreen) {
        this.isNavVisible = true
      } else {
        this.isNavVisible = false
      }
    },
    // Set up the MQTT client
    setupMqttClient() {
      this.mqttClient = mqtt.connect('ws://localhost:8080');
      this.mqttClient.on('connect', () => {
        console.log('MQTT connected');
        this.mqttClient.subscribe('dentists/get/all/response');
      });

      this.mqttClient.on('message', (topic, message) => {
        try {
          const response = JSON.parse(message.toString());
          if (topic === 'dentists/get/all/response' && response.status === 'success') {
            this.dentists = response.dentists;
            this.initMarkers();
          }
        } catch (error) {
          console.error('Error handling MQTT message:', error);
        }
      });
    },
    // Fetch all dentists
    async fetchDentist() {
      this.mqttClient.publish('dentists/get/all', JSON.stringify('fetch all dentists'), (err) => {
        if (err) {
          console.error('Publish error:', err);
        }
      });
    },
    // Create a marker on the map
    createMarker(latitude, longitude, dentistName) {
      const marker = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: this.map,
        icon: '../../src/assets/toothMarkerIcon.svg',
      });
      const infoWindow = new google.maps.InfoWindow({
        content: `<h3>${dentistName}</h3>`,
      });
      marker.addListener('click', () => infoWindow.open(this.map, marker));
    },
    // Initialize markers on the map
    initMarkers() {
      console.log('Initializing markers:', this.dentists);
      this.dentists.forEach(dentist => {
        this.createMarker(dentist.location.latitude, dentist.location.longitude, `${dentist.firstName} ${dentist.secondName}`);
      });
    },
    // Initialize the map
    initMap() {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_MAP_API_KEY,
        version: "weekly",
      });
      loader.load().then(() => {
        this.map = new google.maps.Map(document.getElementById("map"), {
          center: { lat: 57.7089, lng: 11.9746 },
          zoom: 13,
        });

      if(this.isSmallScreen){
        this.map = new google.maps.Map(document.getElementById("map"), {
          center: { lat: 57.7089, lng: 11.9746 },
          zoom: 12,
        });
      }
      }).catch(error => console.error('Error loading Google Maps:', error));
    },
  },
  mounted() {
    this.setupMqttClient();
    this.fetchDentist();
    this.initMap();
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.mqttClient) {
      this.mqttClient.unsubscribe('dentists/get/all/response');
      this.mqttClient.end();
    }
  }
};
</script>

<style scoped>
.page {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
.sidebar {
  width: 250px;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}
.hamburgerMenu {
  display: none;
}
.sidebar h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}
.sidebar ul {
  list-style: none;
  padding: 0;
}
.sidebar li {
    width: 100%;
}
.dentist-item {
  margin-bottom: 10px;
}
.dentist-card {
  padding: 10px;
  background-color: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  transition: box-shadow 0.3s ease;
}
.dentist-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
#map {
  width: 100%;
  height: 600px;
}
@media (max-width: 767px) {
  .sidebar {
    width: 100%;
  }
  .sidebar.is-collapsed {
    transform: translateX(-100%);
  }
  .sidebar h2 {
   margin-top: 2rem;
  }
  .main {
    margin-left: 0;
    padding-left: 10px;
  }
  .hiddenContent {
    display: none;
  }
  .hamburgerMenu {
    display: block;
    position: fixed;
    top: 10px;
    left: 10px;
    z-index: 1000;
  }
  .sidebar {
    position: fixed;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    z-index: 999;
  }
}
</style>
