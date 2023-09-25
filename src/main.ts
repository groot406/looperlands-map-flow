import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { Icon } from '@vicons/utils'
import drag from 'v-drag'
import contextmenu from "v-contextmenu";
import "v-contextmenu/dist/themes/default.css";
import naive from 'naive-ui'

createApp(App)
    .component('Icon', Icon)
    .use(drag)
    .use(naive)
    .use(contextmenu)
    .mount('#app')
