import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/SongsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { transition: 'page-opacity' },
    },
    {
      path: '/playlists/',
      name: 'playlists',
      component: () => import('../views/PlaylistsView.vue'),
      meta: { transition: 'page-opacity' },
    },
    {
      path: '/repositories/',
      name: 'repositories',
      component: () => import('../views/DirectoriesView.vue'),
      meta: { transition: 'page-opacity' },
    },
    {
      path: '/playlist/:id',
      name: 'playlist',
      component: () => import('../views/PlaylistView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
    },
    
  ],
})

export default router
