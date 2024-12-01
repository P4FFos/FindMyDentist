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
      <div id="map">here should be map</div>
      <p>Click markers to see what dentist it is!</p>
      <p>Book an appointment by selecting dentist form the sidebar</p>
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
      client: null
    };
  },
  methods: {
    // Setup the MQTT client
    setupMqttClient() {
      this.mqttClient = mqtt.connect('ws://test.mosquitto.org:8080/mqtt');
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
      }).catch(error => console.error('Error loading Google Maps:', error));
    },
  },
  mounted() {
    this.setupMqttClient();
    this.fetchDentist();
    this.initMap();
  },
};
</script>

<style scoped>
.page {
  display: flex;
}

.sidebar {
  width: 250px;
  padding: 20px;
  background-color: #f8f9fa;
}

.main {
  flex: 1;
  padding: 20px;
}

#map {
  width: 100%;
  height: 600px;
}
</style>
