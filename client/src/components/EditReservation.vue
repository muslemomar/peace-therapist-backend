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
      <h6 class="m-0 font-weight-bold text-primary">Edit Record</h6>
    </div>
    <div class="card-body">

      <form id="reservation-edit-form">

        <div class="form-row">
          <div class="form-group col">
            <h5 class="text-primary">RESERVATION</h5>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group col-12 col-md-4">
            <label class="font-weight-bold text-dark">DATE TIME</label>
            <div>{{this.convertTsToDate(doc.reservationDate)}}</div>
          </div>
          <div class="form-group col-12 col-md-4">
            <label class="font-weight-bold text-dark">Brand</label>
            <div>{{doc.itemBrand}}</div>
          </div>
          <div class="form-group col-12 col-md-4">
            <label class="font-weight-bold text-dark">Price</label>
            <div>{{doc.price}}</div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group col-4">
            <label class="font-weight-bold text-dark">Reservation Notes</label>
            <div>{{doc.notes}}</div>
          </div>
          <div class="form-group col-12 col-md-4">
            <label class="font-weight-bold text-dark">RESERVATION STATUS</label>
            <div>
                <select class="form-control" name="status" @change="statusOnChange" required>
                    <option
                        v-for="item of reservationStatuses"
                        v-bind:value="item"
                        v-bind:selected="doc.status === item"
                    >{{item}}</option>
                </select>
            </div>
          </div>
          <div class="form-group col-12 col-md-4" v-if="this.isFormStatusRejected">
            <label class="font-weight-bold text-dark">REJECTION REASON</label>
            <textarea class="form-control" name="rejectionReason" v-bind:value="doc.rejectionReason" required>
                {{doc.rejectionReason}}
            </textarea>
          </div>
        </div>

        <hr class="mt-2 mb-4">

        <div class="form-row">
          <div class="form-group col">
            <h5 class="text-primary">USER</h5>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group col-12 col-md-4">
            <label class="font-weight-bold text-dark">Name</label>
            <div>{{userData.nickName}}</div>
          </div>
          <div class="form-group col-12 col-md-4">
            <label class="font-weight-bold text-dark">Email</label>
            <div>{{userData.email}}</div>
          </div>
          <div class="form-group col-12 col-md-4">
            <label class="font-weight-bold text-dark">Phone Number</label>
            <div>{{userData.phoneNumber}}</div>
          </div>
        </div>

        <hr class="mt-2 mb-4">

        <div class="form-row">
          <div class="form-group col">
            <h5 class="text-primary">STORE</h5>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group col-12 col-md-4">
            <label class="font-weight-bold text-dark">Store Name</label>
            <div>{{storeData.title}}</div>
          </div>
          <div class="form-group col-12 col-md-8">
            <label class="font-weight-bold text-dark">Store Address</label>
            <div>{{storeData.fullAddress}}</div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group col-12 col-md-4">
            <label class="font-weight-bold text-dark">Owner Name</label>
            <div>{{storeOwnerData.nickName}}</div>
          </div>
          <div class="form-group col-12 col-md-4">
            <label class="font-weight-bold text-dark">Owner Email</label>
            <div>{{storeOwnerData.email}}</div>
          </div>
          <div class="form-group col-12 col-md-4">
            <label class="font-weight-bold text-dark">Owner Phone Number</label>
            <div>{{storeOwnerData.phoneNumber}}</div>
          </div>
        </div>

        <hr class="mt-2 mb-4">

        <div class="form-row">
          <div class="form-group col">
            <h5 class="text-primary">SERVICE</h5>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group col-12 col-md-4">
            <label class="font-weight-bold text-dark">Icon</label>
            <div><img class="reservation-image" v-bind:src="serviceData.icon" @error="imgOnError"></div>
          </div>
          <div class="form-group col-12 col-md-4">
            <label class="font-weight-bold text-dark">Title</label>
            <div>{{serviceData.title}}</div>
          </div>
          <div class="form-group col-12 col-md-4">
            <label class="font-weight-bold text-dark">Color</label>
            <div>{{serviceData.color}}</div>
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
      componentName: 'EditReservation',
      componentTitle: 'Edit Reservation',
      componentApiUrlPath: '/reservations',
      dataListComponentName: 'EditReservation',
      dataListComponentTitle: 'Edit Reservation',
      doc: {},
      serviceData: {},
      userData: {},
      storeData: {},
      storeOwnerData: {},
      validator: null,
      updateResult: this.NULL_CODE,
      reservationStatuses: [
        'REQUEST_SENT',
        'RESERVATION_REJECTED',
        'WAITING_ITEM_DELIVERY',
        'REPAIR_IN_PROGRESS',
        'WAITING_FOR_PAYMENT',
        'COMPLETED'
    ],
    isFormStatusRejected: false,
      updateErrors: []
    };
  },
  methods: {
    statusOnChange(event) {
        const value = $('select[name="status"]').val();
        
        if (value === 'RESERVATION_REJECTED') {
            this.isFormStatusRejected = true;
        } else {
            this.isFormStatusRejected = false;
        }
    },
    logoOnError(event) {
      event.target.src = '/static/images/noimage.png';
    },
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
    imgOnError(event) {
      event.target.src = '/static/images/noimage.png';
    },
    getRecordById(id) {
      const app = this;

      function onResponse(err, data) {

        app.hideLoadingBar();

        if (err) {
          if (err.response.status === 404) {
            app.$router.push({
              name: app.dataListComponentName
            });
          }
        } else {
          app.doc = data;
          app.serviceData = data.service;
          app.userData = data.user;
          app.storeData = data.store;
          app.storeOwnerData = data.storeOwner;
          
          if (data.status === 'RESERVATION_REJECTED') {
              app.isFormStatusRejected = true;
          }
        }

      }

      app.$http
        .get(
          `${app.componentApiUrlPath}/${id}`, {
            withCredentials: true
          }
        )
        .then((res) => onResponse(null, res.data.data))
        .catch(onResponse);
    },
    submitForm() {

      this.showLoadingBar();

      this.updateRecordById(this.doc._id, this.doc);
    },
    updateRecordById(id, body) {
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
      
      const formData = new FormData(document.getElementById('reservation-edit-form'));

      let operation = 'updateStatus';
      let data = {};
      
      if (formData.get('status') === 'RESERVATION_REJECTED') {
          operation = 'reject';
          data = {
              'rejectionReason': formData.get('rejectionReason') || app.doc.rejectionReason || ''
          };
      } else {
          data = {
              status: formData.get('status')
          };
      }

      app.$http
        .post(
          `${app.componentApiUrlPath}/${id}/${operation}`, data, {
            withCredentials: true
          })
        .then(onResponse())
        .catch(onResponse);
    },
  },
  created() {
    this.showLoadingBar();
    this.getRecordById(this.$route.params.id);
  },
  mounted() {
    this.setupDoms();
  },
}
</script>

<style>
input[type="file"].form-control {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  height: auto;
}

.reservation-image {
  width: 100%;
  max-width: 120px;
}
</style>
