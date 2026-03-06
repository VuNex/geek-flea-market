<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';

const authStore = useAuthStore();

onMounted(async () => {
  if (authStore.token) {
    try {
      await authStore.loadProfile();
    } catch (error) {
      console.error('Ошибка инициализации профиля при старте:', error);
      // Если токен невалиден, стор сам обработает логаут через интерцептор
    }
  }
});
</script>

<template>
  <div class="app-wrapper">
    <AppHeader />

    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <AppFooter />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:root {
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --bg-color: #f8fafc;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --border-color: #e2e8f0;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg-color);
  color: var(--text-main);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
}

.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  border: 1px solid transparent;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.btn-outline {
  border-color: var(--border-color);
  color: var(--text-muted);
  background: white;
}

.btn-outline:hover {
  background-color: #f1f5f9;
  color: var(--text-main);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
