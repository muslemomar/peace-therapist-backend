<template>
  <div :class="componentName">

    <div class="alert alert-danger" v-for="elem of updateErrors" v-if="updateErrors.length"><i
      class="fa fa-exclamation-triangle mr-3"></i>
      {{elem}}
    </div>

    <div class="card shadow mb-4">
      <div class="card-header py-3">
        <h6 class="m-0 font-weight-bold text-primary">{{componentTitle}}</h6>
      </div>
      <div class="card-body">

        <form>

          <div class="form-row">
            <div class="form-group col-6">
              <label for="name" class="required">Name</label>
              <input type="text" id="name" name="name" class="form-control"
                     v-model="doc.name" required/>
            </div>

          </div>

          <button type="submit" class="btn btn-primary btn-md btn-block">
            <span class="icon text-white-50 pr-1">
                      <i class="fas fa-check"></i>
                    </span>
            <span class="text">Add</span>
          </button>

        </form>

      </div>
    </div>
  </div>
</template>

<script>
    const componentName = 'AddNGO';

    export default {
        name: componentName,
        components: {},
        data() {
            return {
                componentName: componentName,
                componentTitle: "Add NGO",
                componentApiUrlPath: `/ngos`,
                dataListComponentName: 'NGOs',
                doc: {},
                validator: null,
                updateErrors: []
            };
        },
        methods: {
            setupDoms() {
                const app = this;

                this.validator = $(`.${componentName} form`).validate({
                    onfocusin: function (element) {
                        $(element).valid();
                    },
                    onfocusout: function (element) {
                        $(element).valid();
                    },
                    rules: {},
                    errorPlacement: function (err, element) {
                        if (element.is(':radio')) {
                            err.appendTo(element.parents('.form-group'));
                            element.parents('.form-group').addClass('error')

                        } else {
                            err.insertAfter(element);
                        }

                    },

                    submitHandler: function () {
                        app.submitForm();
                        return false;
                    }
                });

            },
            submitForm() {
                this.createDoc(this.doc);
            },
            createDoc(body) {
                this.showLoadingBar();

                this.$http.post(this.componentApiUrlPath, body,
                    {withCredentials: true}).then((res) => {

                    this.hideLoadingBar();
                    this.$router.push({name: this.dataListComponentName, params: {id: res.data.data.id}});

                }).catch((err) => {
                    console.log(err);
                    this.hideLoadingBar();

                    this.updateErrors = err.response.data.errors;
                    this.scrollToTop();

                })
            },
        },
        mounted() {
            this.setupDoms()
        },
    }
</script>

<style>

</style>
