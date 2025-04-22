import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/SongsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/playlists/',
      name: 'playlists',
      component: () => import('../views/PlaylistsView.vue'),
    },
    {
      path: '/repositories/',
      name: 'repositories',
      component: () => import('../views/DirectoriesView.vue'),
    },
  ],
})

export default router
