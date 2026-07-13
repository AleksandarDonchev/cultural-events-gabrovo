import { createRouter, createWebHistory } from "vue-router"

import Home from "../pages/Home.vue"
git ls-files client/src/pages
import Login from "../pages/Login.vue"
import Register from "../pages/Register.vue"

const routes = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/municipality/:name",
    component: Municipality,
  },
  {
  path: "/login",
  component: Login,
},
{
  path: "/register",
  component: Register,
},
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
