<template>
  <div class="EditDataSection">

    <div class="alert alert-danger" v-for="elem of updateErrors"
         v-if="updateResult === DATA_ERR_CODE && updateErrors.length"><i
      class="fa fa-exclamation-triangle mr-3"></i>
      {{elem}}
    </div>

    <div class="alert alert-success results-alert"
         v-if="!updateErrors.length && updateResult === SUCCESS_CODE">
      <i class="fa fa-check mr-3"></i><strong>Success</strong>:
      Changes have been saved successfully. Return to
      <router-link class="alert-link no-underline" :to="{name: dataListComponentName}">{{dataListComponentTitle}}
      </router-link>
      page
    </div>


    <div class="card shadow mb-4">
      <div class="card-header py-3">
        <h6 class="m-0 font-weight-bold text-primary">Edit Record</h6>
      </div>
      <div class="card-body">

        <form>

          <div class="form-row">
            <div class="form-group col-6">
              <label for="email">Email address</label>
              <input type="email" class="form-control" disabled v-model="doc.email" id="email" aria-describedby="emailHelp"
                     placeholder="Enter email" name="email">
            </div>
          </div>

          <div class="form-row">

            <div class="form-group col">
              <span class="d-block mb-2">Doctor Verified</span>
              <label class="switch">
                <input type="checkbox" v-model="doc.isDoctorVerified">
                <span class="slider round"></span>
              </label>
            </div>

          </div>


          <button type="submit" class="btn btn-primary btn-md btn-block">
                    <span class="icon text-white-50 pr-1">
                      <i class="fas fa-check"></i>
                    </span>
            <span class="text">{{getStr('save')}}</span>
          </button>

        </form>

      </div>
    </div>

  </div>
</template>

<script>
    export default {
        name: this.componentName,
        data() {
            return {
                componentName: 'EditDoctor',
                componentTitle: 'Edit Doctor',
                componentApiUrlPath: '/doctors',
                dataListComponentName: 'Doctors',
                dataListComponentTitle: 'Doctors',
                doc: {},
                validator: null,
                updateResult: this.NULL_CODE,
                updateErrors: []
            };
        },
        methods: {
            setupDoms() {
                const app = this;

                this.validator = $('.EditDataSection form').validate({
                    onfocusin: function (element) {
                        $(element).valid();
                    },
                    onfocusout: function (element) {
                        $(element).valid();
                    },
                    rules: {},
                    submitHandler: function () {
                        app.submitForm();
                        return false;
                    },
                    invalidHandler: function (form, validator) {
                        app.updateResult = app.DATA_ERR_CODE;
                    }
                });

            },
            getRecordById(id) {
                const app = this;

                function onResponse(err, data) {

                    app.hideLoadingBar();

                    if (err) {
                        if (err.response.status === 404) {
                            app.$router.push({name: app.dataListComponentName});
                        }
                    } else {
                        app.doc = data;
                    }

                }

                app.$http
                    .get(
                        `${app.componentApiUrlPath}/${id}`,
                        {withCredentials: true}
                    )
                    .then((res) => onResponse(null, res.data.data))
                    .catch(onResponse);
            },
            submitForm() {

                this.showLoadingBar();

                this.updateRecordById(this.doc._id, {
                    ...this.doc,
                    userType: 'Doctor'
                });
            },
            updateRecordById(id, body) {
                const app = this;

                function onResponse(err) {

                    app.hideLoadingBar();

                    if (err) {

                        if (err.response.status === 404) return app.$router.push({name: app.dataListComponentName});
                        app.updateResult = app.DATA_ERR_CODE;
                        app.updateErrors = err.response.data.errors;

                    } else {
                        app.updateResult = app.SUCCESS_CODE;
                        app.updateErrors = [];
                    }

                    app.scrollToTop();
                }

                app.$http
                    .patch(
                        `${app.componentApiUrlPath}/${id}`,
                        app._.pick(body, ['isDoctorVerified', 'userType']),
                        {withCredentials: true})
                    .then(onResponse())
                    .catch(onResponse);
            },
        },
        created() {
            this.showLoadingBar();
            this.getRecordById(this.$route.params.id);
        },
        mounted() {
            this.setupDoms()
        },
    }
</script>

<style>
</style>
