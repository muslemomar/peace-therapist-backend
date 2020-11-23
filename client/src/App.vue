<template>
  <div id="app">

    <div id="wrapper" v-if="authenticated">
      <!--<div id="wrapper" v-if="!$route.meta.hideNavigation">-->

      <Sidebar/>

      <!-- Content Wrapper -->
      <div id="content-wrapper" class="d-flex flex-column">

        <!-- Main Content -->
        <div id="content">

          <Navbar @logout="logout"/>

          <!-- Begin Page Content -->
          <div class="container-fluid" ref="containerFluid">
            <!-- Multiple router-view -->

            <router-view @authenticate="authenticate" @setLoaderVisibility="setLoaderVisibility"></router-view>

            <!-- Router-View -->

          </div>
          <!-- /.container-fluid -->

        </div>
        <!-- End of Main Content -->

        <Footer/>

      </div>
      <!-- End of Content Wrapper -->

      <!-- Scroll to Top Button-->
      <a class="scroll-to-top rounded" href="#page-top">
        <i class="fas fa-angle-up"></i>
      </a>

    </div>

    <router-view name="login" v-else @authenticate="authenticate"></router-view>

  </div>
</template>

<script>
  import Vue from 'vue';
  import Sidebar from '@/components/Sidebar';
  import Navbar from '@/components/Navbar';
  import Footer from '@/components/Footer';
  import Loading from 'vue-loading-overlay';
  import 'vue-loading-overlay/dist/vue-loading.css';

  Vue.use(Loading);
  Vue.component('vue-multiselect', window.VueMultiselect.default);

  export default {
    name: 'App',
    data() {
      return {
        authenticated: false,
        loader: null
      }
    },
    methods: {
      authenticate(data) {
        this.authenticated = data;
      },
      logout() {
        localStorage.removeItem('user');
        this.authenticated = false;
        this.$router.push({name: 'Login'});
      },
      setLoaderVisibility(visibility) {
        if (visibility) {
          return this.loader = this.$loading.show({
            container: this.$refs.containerFluid,
            canCancel: false,
            color: '#1aa57c',
            loader: 'bars',
            onCancel: this.onCancel,
          });
        }
        this.loader.hide();
      },
    },
    created() {

      const app = this;
      this.$http.interceptors.response.use(undefined, function (err) {
        return new Promise(function (resolve, reject) {
          if (err.response && err.response.status === 401 && err.config && !err.config.__isRetryRequest) {
            app.logout();
          }
          throw err;
        });
      });

      $.fn.dataTable.ext.errMode = function (settings,techNote, message) {
        if (settings.jqXHR.status === 401) {
          app.logout();
        } else {
          alert(message);
        }
      };

    },
    beforeMount() {
      this.authenticated = !!localStorage.getItem('user');
    },
    mounted() {
    },
    components: {
      Sidebar,
      Navbar,
      Footer
    }
  }

</script>

<style>

</style>
