<template>
  <footer class="sticky-footer bg-white">
    <div class="container my-auto">
      <div class="copyright text-center my-auto">
        <span>Copyright &copy; {{appName}} {{currentYear}}</span>
      </div>
    </div>
  </footer>
</template>

<script>
    export default {
        name: "Footer",
      data(){
          return {
            currentYear: new Date().getFullYear()
          };
      }
    }
</script>

<style>

</style>
