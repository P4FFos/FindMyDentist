<template>
  <div>
    <button @click="goToLogin">Login</button>
    <button @click="goToRegister">Register</button>
  </div>
</template>

<script setup>
import {useRouter} from 'vue-router';

const router = useRouter();

// Redirect to the login page
const goToLogin = () => {
  router.push('/login');
};

// Redirect to the registration page
const goToRegister = () => {
  router.push('/register');
};
</script>

<style>

</style>