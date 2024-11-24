<template>
  <div>
    <button @click="goToLogin">Login</button>
    <button @click="goToRegister">Register</button>
  </div>
</template>

<script setup>
const goToLogin = () => {
  this.$router.push('/login')
};

const goToRegister = () => {
  this.$router.push('/register')
};
</script>

<style>

</style>