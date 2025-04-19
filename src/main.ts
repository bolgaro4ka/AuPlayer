import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'
import vIntersect from './directives/v-intersect'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.directive('intersect', vIntersect);

app.mount('#app')
