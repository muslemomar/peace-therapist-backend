<template>

  <div class="login">

    <!---->
    <div class="container">

      <div class="login-form-row row align-items-center">

        <div class="col-10 offset-1 col-sm-8 offset-sm-2 col-md-6 offset-md-4 col-lg-4 offset-lg-4">

          <div class="alert alert-danger" v-for="error in errors.all()" role="alert">{{error}}</div>

          <div class="card">

            <div class="card-body">

              <img src="../../static/images/logo.png" class="img-fluid login-logo mb-4 center-img" alt="logo">

              <form method="post" class="mb-3">

                <div class="form-group">

                  <input type="text" class="form-control" :placeholder="getStr('username_placeholder')"
                         data-vv-validate-on="none" required v-validate="'required'" name="username" v-model="username">

                </div>
                <div class="form-group">

                  <input type="password" class="form-control" required :placeholder="getStr('pass_placeholder')" v-validate="'required'"
                         name="password" v-model="password" autocomplete=""
                         data-vv-validate-on="none"/>

                </div>

                <button class="btn btn-primary btn-block text-uppercase" @click.prevent="login" type="submit">{{getStr('login')}}
                </button>

              </form>

            </div>

          </div> <!-- Card -->

        </div>

      </div>     <!-- login-form -->

    </div>

  </div> <!-- Login -->

</template>

<script>

  export default {
    name: 'Login',
    data() {
      return {
        username: null,
        password: null,
      }
    },
    methods: {
      login() {
        this.$validator.errors.clear();
        this.$validator.validateAll().then((valid) => {
          if (valid) {

            this.$http.post('/auth/login', {
              username: this.username,
              password: this.password
            }, {withCredentials: true}).then((res) => {

              let user = JSON.stringify(res.data.data);
              localStorage.setItem('user',user);
              this.$emit('authenticate', true);
              this.setCurrentUser(user);

              this.$router.push({name: 'Dashboard'});

            }).catch((e) => {

              e.response.data.errors.forEach((err) => {
                this.$validator.errors.add({msg: err});
              });

            });

          }
        });
      }
    },
  }
</script>

<style>

  .login {
    background: #258ee8; /* fallback for old browsers */
    background: -webkit-linear-gradient(right, #258ee8, #00a1e8);
    background: -moz-linear-gradient(right, #258ee8, #00A1E8);
    background: -o-linear-gradient(right, #258ee8, #00A1E8);
    background: linear-gradient(to left, #258ee8, #00A1E8);
    font-family: "Roboto", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .login .login-form-row {
    height: 100vh;
  }

  .center-img {
    display: block;
    margin-left: auto;
    margin-right: auto;
  }


</style>
