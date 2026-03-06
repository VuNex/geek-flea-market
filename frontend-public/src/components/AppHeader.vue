<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);

const userName = computed(() => authStore.user?.name || '');

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};
</script>

<template>
  <header class="app-header">
    <div class="container header-content">
      <div class="header-left">
        <router-link to="/" class="logo">
          <i class="pi pi-shopping-bag logo-icon"></i>
          <span class="logo-text">Geek Flea Market</span>
        </router-link>
        
        <nav class="main-nav">
          <router-link to="/" class="nav-link">
             <i class="pi pi-list mr-1"></i> Объявления
          </router-link>
        </nav>
      </div>

      <div class="header-right">
        <template v-if="isAuthenticated">
          <div class="user-info">
            <router-link to="/profile/adverts" class="nav-link">
              <i class="pi pi-images mr-1"></i> Мои объявления
            </router-link>
            <router-link to="/profile" class="user-link">
              <i class="pi pi-user mr-1"></i>
              <span class="user-name">{{ userName }}</span>
            </router-link>
            <Button label="Выйти" icon="pi pi-sign-out" severity="secondary" variant="outlined" size="small" @click="handleLogout" />
          </div>
        </template>
        
        <template v-else>
          <div class="auth-buttons">
            <router-link to="/login">
              <Button label="Войти" icon="pi pi-sign-in" variant="text" />
            </router-link>
            <router-link to="/register">
              <Button label="Регистрация" icon="pi pi-user-plus" size="small" />
            </router-link>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background-color: #fff;
  border-bottom: 1px solid #eee;
  padding: 0.75rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left, .header-right, .user-info, .auth-buttons {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  font-weight: 700;
  color: #333;
  font-size: 1.2rem;
}

.logo-icon {
  font-size: 1.5rem;
  color: #3b82f6;
}

.nav-link {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  transition: color 0.2s;
  display: flex;
  align-items: center;
}

.nav-link:hover, .router-link-active {
  color: #3b82f6;
}

.user-link {
  text-decoration: none;
  color: #333;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-name {
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mr-1 {
  margin-right: 0.25rem;
}
</style>
