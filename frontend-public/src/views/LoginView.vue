<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { authApi } from '../api/auth.api';

const router = useRouter();
const authStore = useAuthStore();

/**
 * Данные формы: логин (телефон или email) и пароль.
 */
const form = reactive({
  login: '',
  password: '',
});

/**
 * Состояние загрузки и сообщение об ошибке.
 */
const isLoading = ref(false);
const errorMessage = ref('');

/**
 * Обработка отправки формы входа.
 */
const handleLogin = async () => {
  // Базовая клиентская валидация
  if (!form.login || !form.password) {
    errorMessage.value = 'Пожалуйста, заполните все поля';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    // Выполняем запрос к API Gateway
    const response = await authApi.login(form);
    
    // Сохраняем данные в Pinia store
    authStore.login(response.data.token, response.data.user);
    
    // После успешного входа запрашиваем полный профиль
    await authStore.loadProfile();
    
    // Перенаправляем на главную страницу
    router.push('/');
  } catch (error: any) {
    // Обработка типичных ошибок API
    if (error.response?.status === 401) {
      errorMessage.value = 'Неверный логин или пароль';
    } else {
      errorMessage.value = 'Произошла ошибка при входе. Попробуйте позже.';
    }
    console.error('Ошибка логина:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <main class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <h1 class="auth-title">Вход на платформу</h1>
        <p class="auth-subtitle">Войдите, чтобы управлять объявлениями и гик-сокровищами</p>

        <!-- Сообщение об ошибке -->
        <div v-if="errorMessage" class="alert alert-error">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label for="login">Телефон или Email</label>
            <input 
              id="login"
              type="text" 
              v-model="form.login" 
              placeholder="example@mail.ru или +7..."
              class="input-control"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label for="password">Пароль</label>
            <input 
              id="password"
              type="password" 
              v-model="form.password" 
              placeholder="••••••••"
              class="input-control"
              required
              :disabled="isLoading"
            />
          </div>

          <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
            <span v-if="isLoading">Входим...</span>
            <span v-else>Войти</span>
          </button>
        </form>

        <div class="auth-footer">
          Нет аккаунта? <router-link to="/register">Зарегистрироваться</router-link>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: calc(100vh - 150px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background-color: #f8fafc;
}

.auth-container {
  width: 100%;
  max-width: 440px;
}

.auth-card {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.auth-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 2rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
}

.input-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}

.input-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.alert-error {
  background-color: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.btn-block {
  width: 100%;
  justify-content: center;
  padding: 0.75rem;
  font-size: 1rem;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
}

.auth-footer a {
  color: #3b82f6;
  font-weight: 600;
  text-decoration: none;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>
