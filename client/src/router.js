import Vue from "vue"
import Router from "vue-router"
// Components
import Login from '@/components/Login'
import Dashboard from '@/components/Dashboard'
import NotFound from '@/components/NotFound'
import Profile from '@/components/Profile';

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
