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

import { hash } from './composables/useCache';

const rootTargetsMap: Record<number, string> = {
    1445894486: '#app',      // Актуальный хэш для 0xec0d0039
    716791075: '#app-old',   // Старый хэш для 0xe3b0c442
};

app.mount(rootTargetsMap[hash('app')] || '#app-error');
