<template>
  <div>
    <button @click="goToLogin">Login</button>
    <button @click="goToRegister">Register</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToLogin = () => {
  router.push('/login');
};

const goToRegister = () => {
  router.push('/register');
};
</script>

<style>

</style>