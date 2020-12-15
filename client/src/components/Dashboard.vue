<template>

<div class="dashboard">

  <!-- Page Heading -->
  <div class="d-sm-flex align-items-center justify-content-between mb-4">
    <h1 class="h3 mb-0 text-gray-800">{{getStr('dashboard_title')}}</h1>
  </div>

  <!-- Content Row -->
  <div class="row">

    <div class="col-xl-3 col-md-6 mb-4" >
      <div class="card border-left-warning shadow h-100 py-2">
        <div class="card-body">
          <div class="row no-gutters align-items-center">
            <div class="col mr-2">
              <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">Registered Users</div>
              <div class="h5 mb-0 font-weight-bold text-gray-800">{{res.userCount}}</div>
            </div>
            <div class="col-auto">
              <i class="fas fa-users fa-2x text-gray-300"></i>
            </div>
          </div>
        </div>
      </div>
    </div>


  </div>

</div>

</template>

<script>
  export default {
    name: "Dashboard",
    data() {
      return {
        res: {},
      };
    },
    methods: {
      getData() {
        this.$http.get('/dashboard',{ withCredentials: true }).then((res) => {
          this.res = res.data.data;

          this.hideLoadingBar();

        }).catch((err) => {
          this.hideLoadingBar();

        })
      },
    },
    created:function() {
      this.showLoadingBar();
      this.getData();
    },
    mounted() {}
  }
</script>

<style>

</style>
