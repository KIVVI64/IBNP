import Vue from 'vue'
import VueRouter from 'vue-router'
import { auth } from '../plugins/firebase'
import Home from '../views/Home.vue'
import ViewNotFound from '../views/ViewNotFound.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: "IBNP - Szczerze o nauczycielach"
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "about" */ '../views/Login.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/szkola/dodaj',
    name: 'SchoolAdd',
    component: () => import(/* webpackChunkName: "school_add" */ '../views/SchoolAdd.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/szkola/:school_uid',
    name: 'School',
    component: () => import(/* webpackChunkName: "school_add" */ '../views/School.vue'),
  },
  {
    path: '/nauczyciel/dodaj',
    name: 'TeacherAdd',
    component: () => import(/* webpackChunkName: "school_add" */ '../views/TeacherAdd.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/nauczyciel/:teacher_uid',
    name: 'Teacher',
    component: () => import(/* webpackChunkName: "teacher" */ '../views/Teacher.vue')
  },
  {
    path: "*",
    name: "ViewNotFound",
    component: ViewNotFound,
    meta: {
      title: "IBNP - 404"
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// Nav Guards
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(x => x.meta.requiresAuth)

  if (requiresAuth && !auth.currentUser) {
    next({
      path: "/login",
      query: {
        redirect: to.fullPath
      }
    });
  } else {
    next()
  }
})

export default router
