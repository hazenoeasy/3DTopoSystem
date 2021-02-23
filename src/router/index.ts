import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import quickStart from '../views/quick-start.vue';
import geometry from '../views/geometry.vue';
import material from '../views/material.vue';
import plf from '../views/plf.vue';
import light from '../views/light.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'quick-start',
    component: quickStart,
  },
  {
    path: '/geometry',
    name: 'geometry',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    // component: () => import('../views/geometry.vue'),
    component: geometry,
  },
  {
    path: '/material',
    name: 'material',
    component: material,
  },
  {
    path: '/plf',
    name: 'plf',
    component: plf,
  },
  {
    path: '/light',
    name: 'light',
    component: light,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
