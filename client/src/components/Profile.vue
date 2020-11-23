<template>
  <div class="Profile">

    <div class="alert alert-success results-alert" v-if="updateResult === 0"><i class="fa fa-check mr-3"></i><strong>Success</strong>:
      Changes have been saved successfully. Return to
      <router-link class="alert-link no-underline" :to="{name: 'Dashboard'}">Dashboard</router-link>
      page
    </div>

    <div class="alert alert-danger" v-for="elem of updateErrors" v-if="updateErrors.length"><i
      class="fa fa-exclamation-triangle mr-3"></i>
      {{elem}}
    </div>


    <div class="card shadow mb-4">
      <div class="card-header py-3">
        <h6 class="m-0 font-weight-bold text-primary">Edit Profile</h6>
      </div>
      <div class="card-body">
        <form>

          <div class="form-group">
            <label for="fullName">Full Name</label>
            <input type="text" id="fullName" class="form-control"
                   v-model="doc.fullName" required>
          </div>

          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" class="form-control"
                   v-model="doc.username" required>
          </div>


          <div class="form-row">

            <div class="form-group col">
              <label for="oldPassword">Old Password</label>
              <input type="password" class="form-control" name="oldPassword" id="oldPassword"
                     v-model="doc.oldPassword"
                     placeholder="Type to change">
            </div>

            <div class="form-group col">
              <label for="newPassword">New Password</label>
              <input type="password" class="form-control" name="newPassword" id="newPassword"
                     v-model="doc.newPassword"
                     placeholder="Type to change">
            </div>

          </div>

          <button type="submit" class="btn btn-primary btn-md btn-block">
                    <span class="icon text-white-50 pr-1">
                      <i class="fas fa-check"></i>
                    </span>
            <span class="text">Save</span>
          </button>

        </form>
      </div>
    </div>

  </div>
</template>

<script>
  export default {
    name: "Profile",
    data() {
      return {
        doc: {},
        validator: null,
        updateResult: -1,
        updateErrors: []
      };
    },
    methods: {
      setupDoms() {
        const app = this;

        this.validator = $('.Profile form').validate({
          onfocusin: function (element) {
            $(element).valid();
          },
          onfocusout: function (element) {
            $(element).valid();
          },
          rules: {},
          errorPlacement: function (err, element) {
            if (element.is(':radio')) {
              err.appendTo(element.parents('.form-group'))
            } else {
              err.insertAfter(element);
            }

          },
          submitHandler: function () {
            app.submitForm();
            return false;
          },
          invalidHandler: function (form, validator) {
            app.updateResult = 1;
          }
        });
      },
      getProfile() {
        this.$http.get('/profile',
          {withCredentials: true}).then((res) => {

          this.hideLoadingBar();
          this.doc = res.data.data;

        }).catch((err) => {
          this.hideLoadingBar();
        });
      },
      submitForm() {
        this.showLoadingBar();
        ['oldPassword', 'newPassword'].forEach(elem => {
          if (!this.doc[elem]) delete this.doc[elem]
        });
        this.updateProfile(this._.pick(this.doc, ['fullName', 'username', 'oldPassword', 'newPassword']));
      },
      updateProfile(body) {
        this.$http.patch('/profile', body,
          {withCredentials: true}).then((res) => {

          this.hideLoadingBar();
          this.updateResult = this.SUCCESS_CODE;
          this.updateErrors = [];
          this.scrollToTop();
        }).catch((err) => {
          this.hideLoadingBar();

          this.updateErrors = err.response.data.errors;
          this.updateResult = this.DATA_ERR_CODE;
          this.scrollToTop();
        })
      },
    },
    created() {
      this.showLoadingBar();
      this.getProfile();
    },
    mounted() {
      this.setupDoms();
    }
  }
</script>

<style>
</style>
