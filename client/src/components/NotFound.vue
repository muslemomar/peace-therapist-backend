<template>
  <div class="text-center">
    <div class="error mx-auto" data-text="404">404</div>
    <p class="lead text-gray-800 mb-5">Page Not Found</p>
    <p class="text-gray-500 mb-0">The requested page does not exist....</p>
    <router-link :to="{name: 'Dashboard'}" >← Back to Dashboard</router-link>
  </div>
</template>

<script>
    export default {
        name: "NotFound"
    }
</script>

<style scoped>

</style>
