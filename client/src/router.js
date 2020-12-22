import Vue from "vue"
import Router from "vue-router"
// Components
import Login from '@/components/Login'
import Dashboard from '@/components/Dashboard'
import NotFound from '@/components/NotFound'
import Profile from '@/components/Profile';
import Doctors from '@/components/Doctors';
import NGOs from '@/components/NGOs';
import AddNGO from '@/components/AddNGO';
import EditNGO from '@/components/EditNGO';
import EditDoctor from '@/components/EditDoctor';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: "/admin/login",
      name: "Login",
      components: {
        login: Login
      },
      meta: {hideNavigation: true},
      beforeEnter: (to, from, next) => {
        if (localStorage.getItem('user')) {
          next({name: 'Dashboard'});
        } else {
          next();
        }
      }
    },
    {
      path: '/admin/dashboard',
      name: 'Dashboard',
      component: Dashboard,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/admin/profile',
      name: 'Profile',
      component: Profile,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/admin/doctors',
      name: 'Doctors',
      component: Doctors,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/admin/ngos',
      name: 'NGOs',
      component: NGOs,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/admin/ngos/create',
      name: 'AddNGO',
      component: AddNGO,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/admin/ngos/:id',
      name: 'EditNGO',
      component: EditNGO,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/admin/doctors/:id',
      name: 'EditDoctor',
      component: EditDoctor,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/admin/404',
      component: NotFound,
      name: 'NotFound'
    },
    {
      path: '*',
      redirect: '/admin/dashboard'
    }
  ]
});


export default router;
