<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { authApi } from '../api/auth.api';
import type { UserProfile } from '../types';
import AppNotification from '../components/AppNotification.vue';

const authStore = useAuthStore();

/**
 * Состояние формы профиля.
 */
const form = reactive({
  name: '',
  phone: '',
  email: '',
});

const isLoading = ref(false);
const notification = ref<{ message: string; type: 'success' | 'error' } | null>(null);

/**
 * Инициализация данных формы из стора или API.
 */
onMounted(async () => {
  // Убеждаемся, что данные профиля загружены
  if (!authStore.user || !('phone' in authStore.user)) {
    await authStore.loadProfile();
  }
  
  const user = authStore.user as UserProfile;
  if (user) {
    form.name = user.name;
    form.phone = user.phone;
    form.email = user.email;
  }
});

/**
 * Сохранение изменений профиля.
 */
const handleSave = async () => {
  isLoading.value = true;
  try {
    const { data } = await authApi.updateProfile(form);
    authStore.updateUserData(data);
    showNotification('Профиль успешно обновлен', 'success');
  } catch (error: any) {
    if (error.response?.status === 409) {
      showNotification('Email или телефон уже используется другим пользователем', 'error');
    } else {
      showNotification('Ошибка при обновлении профиля', 'error');
    }
  } finally {
    isLoading.value = false;
  }
};

/**
 * Утилита для показа уведомления.
 */
const showNotification = (message: string, type: 'success' | 'error') => {
  notification.value = { message, type };
  setTimeout(() => { notification.value = null; }, 3000);
};
</script>

<template>
  <main class="profile-page container">
    <div class="profile-layout">
      <!-- Навигация по личному кабинету (можно вынести в компонент) -->
      <aside class="profile-sidebar">
        <nav class="profile-nav">
          <router-link to="/profile" class="nav-item active">Настройки профиля</router-link>
          <router-link to="/profile/adverts" class="nav-item">Мои объявления</router-link>
        </nav>
      </aside>

      <!-- Форма редактирования -->
      <section class="profile-content">
        <h1 class="page-title">Настройки профиля</h1>
        
        <div class="profile-card">
          <form @submit.prevent="handleSave" class="profile-form">
            <div class="form-group">
              <label for="name">Ваше имя</label>
              <input 
                id="name"
                type="text" 
                v-model="form.name" 
                class="input-control"
                required
              />
            </div>

            <div class="form-group">
              <label for="phone">Номер телефона</label>
              <input 
                id="phone"
                type="tel" 
                v-model="form.phone" 
                class="input-control"
                required
              />
            </div>

            <div class="form-group">
              <label for="email">Электронная почта</label>
              <input 
                id="email"
                type="email" 
                v-model="form.email" 
                class="input-control"
                required
              />
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="isLoading">
                {{ isLoading ? 'Сохранение...' : 'Сохранить изменения' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Дополнительная информация об аккаунте -->
        <div class="account-meta">
          <p v-if="authStore.user">Аккаунт создан: {{ new Date((authStore.user as UserProfile).createdAt).toLocaleDateString() }}</p>
          <p>Роль: {{ authStore.user?.role }}</p>
        </div>
      </section>
    </div>

    <!-- Всплывающие уведомления -->
    <AppNotification 
      v-if="notification" 
      :message="notification.message" 
      :type="notification.type" 
      @close="notification = null"
    />
  </main>
</template>

<style scoped>
.profile-page {
  padding: 3rem 0;
}

.profile-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 3rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 2rem;
}

.profile-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: block;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: #64748b;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}

.nav-item:hover {
  background-color: #f1f5f9;
  color: #334155;
}

.nav-item.active {
  background-color: #eff6ff;
  color: #2563eb;
}

.profile-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 500px;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 0.5rem;
}

.input-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}

.input-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  margin-top: 1rem;
}

.account-meta {
  margin-top: 2rem;
  font-size: 0.875rem;
  color: #94a3b8;
  display: flex;
  gap: 2rem;
}

@media (max-width: 768px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }
}
</style>
