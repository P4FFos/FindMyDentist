<template>
  <div class="d-flex flex-column align-items-center justify-content-center vh-100 text-center ">
    <h1 class="title">Register</h1>
    <div class="user-type-selection">
      <b-button @click="selectUserType('patient')" class="textButton">Patient</b-button>
      <b-button @click="selectUserType('dentist')" class="textButton">Dentist</b-button>
    </div>
    <form @submit.prevent="register" class="mt-3 d-flex flex-column w-30">
      <label for="firstName">First Name:</label>
      <input type="text" v-model="firstName" required/>

      <label for="secondName">Second Name:</label>
      <input type="text" v-model="secondName" required/>

      <label for="email">Email:</label>
      <input type="email" v-model="email" required/>

      <label for="password">Password:</label>
      <input type="password" v-model="password" required/>

      <label v-if="userType === 'patient'" for="phone">Phone:</label>
      <input v-if="userType === 'patient'" type="text" v-model="phone" required/>

      <label v-if="userType === 'dentist'" for="latitude">Latitude:</label>
      <input v-if="userType === 'dentist'" type="text" v-model="latitude" required/>

      <label v-if="userType === 'dentist'" for="longitude">Longitude:</label>
      <input v-if="userType === 'dentist'" type="text" v-model="longitude" required/>

      <button class="button" type="submit">Register</button>
    </form>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
import mqtt from 'mqtt';

export default {
  name: 'Register',
  data() {
    return {
      userType: 'patient',
      firstName: '',
      secondName: '',
      email: '',
      phone: '',
      password: '',
      latitude: '',
      longitude: '',
      message: '',
      mqttClient: null
    };
  },
  methods: {
    // Set the user type
    selectUserType(type) {
      this.userType = type;
    },
    // Set up the MQTT client
    setupMqttClient() {
      this.mqttClient = mqtt.connect('ws://localhost:8080');
      this.mqttClient.on('connect', () => {
        this.mqttClient.subscribe('patients/create/response');
        this.mqttClient.subscribe('dentists/create/response');
      });

      this.mqttClient.on('message', (topic, message) => {
        const response = JSON.parse(message.toString());
        if (topic === 'patients/create/response') {
          if (response.status === 'success') {
            this.message = 'Registration successful!';
            this.$router.push('/login');
          } else {
            this.message = `Error: ${response.message}`;
          }
        } else if (topic === 'dentists/create/response') {
          if (response.status === 'success') {
            this.message = 'Registration successful!';
            this.$router.push('/login');
          } else {
            this.message = `Error: ${response.message}`;
          }
        }
      });
    },
    // Connect to the MQTT broker and publish the registration data
    async register() {
      const payload = {
        firstName: this.firstName,
        secondName: this.secondName,
        email: this.email,
        password: this.password
      };
      if (this.userType === 'patient') {
        payload.phone = this.phone;
        this.mqttClient.publish('patients/create', JSON.stringify(payload));
      } else if (this.userType === 'dentist') {
        payload.location = {
          latitude: this.latitude,
          longitude: this.longitude
        };
        this.mqttClient.publish('dentists/create', JSON.stringify(payload));
      }
    }
  },
  mounted() {
    this.setupMqttClient();
  },
  beforeDestroy() {
    if (this.mqttClient) {
      this.mqttClient.unsubscribe('patients/create/response');
      this.mqttClient.unsubscribe('dentists/create/response');
      this.mqttClient.end();
    }
  }
}
</script>

<style>
label {
  align-self: flex-start;
  font-weight: bold;
}

.user-type-selection {
  color: black;
}

.button {
  margin-top: 2rem;
}

.textButton:hover {
  background-color: #dbdbd9;
}

.w-30 {
  width: 28%;
}

@media (max-width: 767px) {
  .title {
    font-size: 3rem;
  }

  .w-30 {
    width: 70%;
  }
}
</style>
