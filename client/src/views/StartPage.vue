<template>
    <div class="d-flex flex-column align-items-center justify-content-center vh-100 text-center ">
      <h1 class="fw-bold">Find My Dentist</h1>
      <p class="text-muted">the best options for the best city</p>
      <div class="mt-3 d-flex flex-column">
        <button variant="primary" class="me-2" @click="goToRegister">Sign Up</button>
        <label >Already have an account? <b-button variant="link" @click="goToLogin">Log In</b-button></label>
      </div>
    </div>
</template>

<script>
  import { useRouter } from "vue-router";

  export default {
    setup() {
      const router = useRouter();

      const goToLogin = () => {
        router.push("/login");
      };

      const goToRegister = () => {
        router.push("/register");
      };

      return { goToLogin, goToRegister };
    },
  };
</script>

<style>
</style>
