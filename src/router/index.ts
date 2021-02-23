import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import quickStart from '../views/quick-start.vue';
import geometry from '../views/geometry.vue';

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
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
