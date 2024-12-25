<template>
  <div class="d-flex flex-column align-items-center justify-content-center vh-100 text-center content">
    <h1 class="title">Login</h1>
    <p>Welcome back! Please login to your account</p>
    <div class="user-type-selection">
      <b-button @click="selectUserType('patient')" class="textButton">Patient</b-button>
      <b-button @click="selectUserType('dentist')" class="textButton">Dentist</b-button>
    </div>
    <form @submit.prevent="login" class="mt-3 d-flex flex-column w-30">
      <label for="email">Email:</label>
      <input type="email" v-model="email" required/>

      <label for="password">Password:</label>
      <input type="password" v-model="password" required/>

      <button class="button" type="submit">Login</button>
    </form>
    <p>Are you an admin?
      <b-button variant="link" @click="goToAdminPanel" class="login-button">Go here</b-button>
    </p>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
import mqtt from 'mqtt';

export default {
  name: 'Login',
  data() {
    return {
      userType: 'patient',
      email: '',
      password: '',
      message: '',
      mqttClient: null
    };
  },
  methods: {
    // Set the user type
    selectUserType(type) {
      this.userType = type;
      this.message = `You are logging in as a ${type}`;
    },
    goToAdminPanel() {
      this.$router.push("/admin-panel");
    },
    // Set up the MQTT client
    setupMqttClient() {
      this.mqttClient = mqtt.connect('ws://localhost:8080');
      this.mqttClient.on('connect', () => {
        this.mqttClient.subscribe('patients/get/login/response');
        this.mqttClient.subscribe('dentists/get/login/response');
      });

      this.mqttClient.on('message', (topic, message) => {
        const response = JSON.parse(message.toString());
        if (!this.isValidResponse(response)) {
          console.error('Invalid response format:', response);
          return;
        }
        if (topic === 'patients/get/login/response') {
          if (response.status === 'success') {
            localStorage.setItem('patientId', response.patient._id);
            this.$router.push('/patient_main');
          } else {
            this.message = `Error: ${response.message}`;
          }
        } else if (topic === 'dentists/get/login/response') {
          if (response.status === 'success') {
            localStorage.setItem('dentistId', response.dentist._id);
            this.$router.push(`/dentist/${response.dentist._id}/managing`);
          } else {
            this.message = `Error: ${response.message}`;
          }
        }
      });
    },
    // Connect to the MQTT broker and subscribe to the topics to login
    async login() {
      const payload = {
        email: this.email,
        password: this.password
      };
      if (this.userType === 'patient') {
        this.mqttClient.publish('patients/get/login', JSON.stringify(payload));
      } else if (this.userType === 'dentist') {
        this.mqttClient.publish('dentists/get/login', JSON.stringify(payload));
      }
    },
    // Validate the response format
    isValidResponse(response) {
      if (typeof response !== 'object' || response === null) return false;
      if (!('status' in response)) return false;
      if (response.status === 'success') {
        if ('patient' in response && typeof response.patient !== 'object') return false;
        if ('dentist' in response && typeof response.dentist !== 'object') return false;
      }
      return true;
    }
  },
  mounted() {
    this.setupMqttClient();
  },
  beforeDestroy() {
    if (this.mqttClient) {
      this.mqttClient.unsubscribe('patients/get/login/response');
      this.mqttClient.unsubscribe('dentists/get/login/response');
      this.mqttClient.end();
    }
  }
}
</script>

<style scoped>
p {
  color: #7E7E7E;
}

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
