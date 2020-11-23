<template>
<div class="EditDataSection">

  <div class="alert alert-danger" v-for="elem of updateErrors" v-if="updateResult === DATA_ERR_CODE && updateErrors.length"><i class="fa fa-exclamation-triangle mr-3"></i>
    {{elem}}
  </div>

  <div class="alert alert-success results-alert" v-if="!updateErrors.length && updateResult === SUCCESS_CODE">
    <i class="fa fa-check mr-3"></i><strong>Success</strong>:
    Changes have been saved successfully. Return to
    <router-link class="alert-link no-underline" :to="{name: dataListComponentName}">{{dataListComponentTitle}}
    </router-link>
    page
  </div>


  <div class="card shadow mb-4">
    <div class="card-header py-3">
      <h6 class="m-0 font-weight-bold text-primary">Create Record</h6>
    </div>
    <div class="card-body">

      <form id="storeservice-create-form" enctype="multipart/form-data">

        <div class="form-row">
          <div class="form-group col">
            <label for="title">Title</label>
            <input type="text" id="title" name="title" class="form-control" v-model="doc.title" required>
          </div>
          <div class="form-group col">
            <label for="title">Color</label>
            <input type="color" id="color" name="color" class="form-control" v-model="doc.color" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col">
            <label for="icon">Icon</label>
            <div class="d-flex">
              <div class="mr-3">
                <img id="icon-img" v-bind:src="'/static/images/noimage.png'">
              </div>
              <div>
                <input type="file" id="icon" name="icon" @change="fileOnChange" class="form-control">
              </div>
            </div>
          </div>
        </div>

        <button type="submit" class="btn btn-primary btn-md btn-block">
          <span class="icon text-white-50 pr-1">
            <i class="fas fa-check"></i>
          </span>
          <span class="text">{{getStr('create')}}</span>
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
      componentName: 'CreateStoreService',
      componentTitle: 'Create Store Service',
      componentApiUrlPath: '/stores/services',
      dataListComponentName: 'StoreServices',
      dataListComponentTitle: 'Store Services',
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
        onfocusin: function(element) {
          $(element).valid();
        },
        onfocusout: function(element) {
          $(element).valid();
        },
        rules: {},
        submitHandler: function() {
          app.submitForm();
          return false;
        },
        invalidHandler: function(form, validator) {
          app.updateResult = app.DATA_ERR_CODE;
        }
      });

    },
    fileOnChange(event) {
      const app = this;

      let imgElement = document.getElementById('icon-img');

      if (event.target.files.length > 0) {
          app.selectedLogoFile = event.target.files[0];
    
          let reader = new FileReader();
    
          imgElement.title = app.selectedLogoFile.name;
    
          reader.onload = function(event) {
            imgElement.src = event.target.result;
          };
    
          reader.readAsDataURL(app.selectedLogoFile);
      } else {
          imgElement.src = '/static/images/noimage.png';
      }
    },
    submitForm() {
      this.showLoadingBar();
      this.createRecord(this.doc);
    },
    createRecord(body) {
      const app = this;

      function onResponse(err) {

        app.hideLoadingBar();

        if (err) {

          if (err.response.status === 404) return app.$router.push({
            name: app.dataListComponentName
          });
          app.updateResult = app.DATA_ERR_CODE;
          app.updateErrors = err.response.data.errors;

        } else {
          app.updateResult = app.SUCCESS_CODE;
          app.updateErrors = [];
        }

        app.scrollToTop();
      }

      let formData = new FormData(document.getElementById('storeservice-create-form'));

      if (app.selectedLogoFile) {
        formData.delete('icon');
        formData.append('icon', app.selectedLogoFile);
      }

      app.$http
        .post(
          `${app.componentApiUrlPath}`, formData, {
            withCredentials: true
          })
        .then(onResponse())
        .catch(onResponse);
    },
  },
  created() {},
  mounted() {
    this.setupDoms()
  },
}
</script>

<style>
input[type="file"].form-control {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  height: auto;
}

#icon-img {
  width: 100%;
  max-width: 120px;
}
</style>
