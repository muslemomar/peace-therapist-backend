// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VeeValidate from 'vee-validate';
import axios from 'axios';
import moment from 'moment';
import VueLodash from 'vue-lodash'
import VueSelectImage from 'vue-select-image'
import ToggleButton from 'vue-js-toggle-button'
import _ from 'lodash'

/*
* Constants
* */
const strings = require('./strings/strings-en');
const consts = require('./consts/generalConsts');

// window.Vue = Vue;
Vue.use(VeeValidate);
Vue.use(VueSelectImage);
Vue.use(ToggleButton);
Vue.prototype._ = _;
Vue.prototype.Vue = Vue;

var baseURL = process.env.NODE_ENV === 'development' ? process.env.API_URL : '/api/admin';

require('vue-select-image/dist/vue-select-image.css');

$.ajaxSetup({
  beforeSend: function (xhr, options) {
    options.url = baseURL + options.url;
  }
});

Vue.prototype.$http = axios.create({baseURL});
Vue.prototype.moment = moment;

Vue.config.productionTip = false;

String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

Vue.mixin({
  data: function () {
    return {
      NULL_CODE: -1,
      SUCCESS_CODE: 0,
      DATA_ERR_CODE: 1,
      OTHER_ERR_CODE: 2,
      BASE_URL: baseURL,
      currentUser: null,
      appName: 'Peace',
      consts: consts
    }
  },
  created() {
    this.currentUser = this.getCurrentUser();
  },
  methods: {
    capitalizeFirstLetter: function (str) {
      if (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      } else {
        return str;
      }
    },
    convertTsToDate: function (val) {
      return this.moment(val).isValid() ? this.moment(val).format('YYYY-MM-DD HH:mm:ss') : null;
    },
    selectRowById: function (table, id) {
      table.row(`#${id}`).show().select().draw(false);
    },
    scrollToTop: function () {
      $("html, body").animate({scrollTop: 0}, 600);
    },
    showLoadingBar: function () {
      this.$emit('setLoaderVisibility', true);
    },
    hideLoadingBar: function () {
      this.$emit('setLoaderVisibility', false);
    },
    getCurrentUser: function () {
      return JSON.parse(localStorage.getItem('user'));
    },
    isAdmin: function () {
      return this.getCurrentUser() && this.getCurrentUser().type === consts.USER_TYPES.Admin;
    },
    isDoctor: function () {
      return this.getCurrentUser() && this.getCurrentUser().type === consts.USER_TYPES.Doctor;
    },
    setCurrentUser: function (user) {
      this.currentUser = user;
    },
    getDataTableBody() {

    },
    getStr(str) {
      return strings[str];
    },
    getColumnIndexByName(array, name) {
      let isArray = Array.isArray(name);
      if (!isArray) {
        name = [name];
      }

      let indices = [];
      name.forEach((elem) => {
        indices.push(array.findIndex(i => i.name === elem));
      });
      return isArray ? indices : indices[0];
    },
    getImageColumnRendering: function (img, type, row) {

      const placeHolderImage = '/static/images/noimage.png';

      let image, thumb;
      image = thumb = placeHolderImage;

      if (img) {
        if (Array.isArray(img)) {

          if (!img.length) {
            img = [null];
          }

          let div = '<div class="row images-row">';

          img
            .map(elem => elem || placeHolderImage)
            .forEach(elem => {

              div +=
                `<div class="col px-0"><a class="fancybox-img" data-fancybox="gallery-${row._id + 'images'}" href="${elem}">` +
                `<img alt="" src="${elem}" alt="Responsive image" class="img-fluid">` +
                `</a></div>`
              ;
            });

          div += '</div>';
          return div;

        } else {
          if (typeof img === 'string') {
            image = thumb = img;
          } else {
            image = img.img;
            thumb = img.thumb;
          }
        }
      }

       return `<div class="col px-0"><a class="fancybox-img" data-fancybox="gallery-${row._id}" href="${image}">` +
        `<img alt="" src="${thumb}" alt="Responsive image" class="img-fluid img-thumbnail">` +
        `</a></div>`;

    },
    generateRandomId() {
      return Math.floor(Date.now() * Math.random());
    },
    objectToFormData(obj, form, namespace) {

      var fd = form || new FormData();
      var formKey;

      for (var property in obj) {
        if (obj.hasOwnProperty(property)) {

          if (namespace) {
            formKey = namespace + '[' + property + ']';
          } else {
            formKey = property;
          }

          // if the property is an object, but not a File,
          // use recursivity.
          if (typeof obj[property] === 'object' && !(obj[property] instanceof File)) {

            this.objectToFormData(obj[property], fd, property);

          } else {

            // if it's a string or a File object
            fd.append(formKey, obj[property]);
          }

        }
      }

      return fd;
    },
    parseDataTableColumns(array) {

      return array.map(col => {
        if (typeof col === 'string') {
          col = {data: col};
        }
        if (col.defaultContent == null) {
          col.defaultContent = 'N/A'
        }

        return {
          ...col,
          ...col.name == null && {name: col.data},
          ...(col.displayName == null && col.type !== 'html') && {
            displayName: col.data.split('_')
              .map(i => this.capitalizeFirstLetter(i))
              .reduce((total, val) => {
                return total + ' ' + val;
              })
          }
        }
      });
    },
    getCategories: function (path, query) {

      if (!this.isLoading) {
        this.showLoadingBar();
        this.isLoading = true;
      }

      this.$http.get(`${path}?q=` + query, {
        withCredentials: true,
      })
        .then((res) => {

          this.categories = res.data.data;

          this.hideLoadingBar();
          this.isLoading = false;
        })
        .catch((e) => {
          this.hideLoadingBar();
          this.isLoading = false;
          console.log(e);
        });

    },
    getStores: function (query) {

      if (!this.isLoading) {
        this.showLoadingBar();
        this.isLoading = true;
      }

      this.$http.get(`/stores/autoComplete?q=` + query, {
        withCredentials: true,
      })
        .then((res) => {

          this.stores = res.data.data;

          this.hideLoadingBar();
          this.isLoading = false;
        })
        .catch((e) => {
          this.hideLoadingBar();
          this.isLoading = false;
          console.log(e);
        });

    },
    getStoreCategories: function (query) {
      return this.getCategories('/stores/categories/autoComplete', query);
    },
    convertStringTimeToHoursMinutes(time) {
      if (time == null) return null;

      // without this, joi will throw "var must be a safe number" error
      let HH = time.slice(0, 2);
      let mm = time.slice(-2);

      return {
        HH: HH === '00' ? '0' : HH,
        mm: mm === '00' ? '0' : mm
      }
    }
  },
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  data: {
    input: '# hello'
  },
  router,
  components: {App},
  template: '<App/>',
});

