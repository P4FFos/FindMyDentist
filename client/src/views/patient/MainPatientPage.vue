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
  import { Api } from '../../Api.js'
  import { Loader } from "@googlemaps/js-api-loader"

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
            },
            async createMarker(map, latitude, longitude, dentist) {
              const marker = new google.maps.Marker({
                position: { lat: latitude, lng: longitude },
                map: map,
                title: "Dentist",
                icon: '../../src/assets/toothMarkerIcon.svg'
              })
              const infoWindow = new google.maps.InfoWindow({
                content: `<h3>${dentist}</h3>`
              })
              marker.addListener("click", () => {
                infoWindow.open(map, marker)
              })
            },
            async initMap() {
                var options = {
                    center: { lat: 57.7089, lng: 11.9746 },
                    zoom: 13,
                    disableDefaultUI: true,
                    styles: [
                      {
                        featureType: "all",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }],
                      },
                    ]
                }
                const map = new google.maps.Map(document.getElementById("map"), options)
                this.createMarker(map, 57.7089, 11.9746, 'Wally West')
            }
        },
        mounted() {
            this.fetchDentist()
            const loader = new Loader({
              apiKey: import.meta.env.VITE_MAP_API_KEY,
              version: "weekly",
              libraries: ["places"],
            })
            loader.load().then(() => {
                this.initMap()
            })
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
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

#map {
    background-color: #d3d3d3;
    width: 1000px;
    height: 700px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
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
