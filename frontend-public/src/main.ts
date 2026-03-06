import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import App from './App.vue';
import router from './router';

import 'primeicons/primeicons.css';


const app = createApp(App);


const pinia = createPinia();
app.use(pinia);


app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            prefix: 'p',
            darkModeSelector: '.app-dark',
            cssLayer: false
        }
    }
});


app.use(router);


app.mount('#app');
