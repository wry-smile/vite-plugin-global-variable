import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { useGlobSetting } from '../../../tools'

createApp(App).mount('#app')
console.log(useGlobSetting())
