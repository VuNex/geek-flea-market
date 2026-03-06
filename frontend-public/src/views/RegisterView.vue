<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { authApi } from '../api/auth.api';

const router = useRouter();
const authStore = useAuthStore();

/**
 * Данные формы регистрации.
 */
const form = reactive({
  name: '',
  phone: '',
  email: '',
  password: '',
});

const isLoading = ref(false);
const errorMessage = ref('');

/**
 * Обработка регистрации.
 */
const handleRegister = async () => {
  // 1. Клиентская валидация
  if (!form.name || !form.phone || !form.email || !form.password) {
    errorMessage.value = 'Все поля обязательны для заполнения';
    return;
  }

  if (form.password.length < 6) {
    errorMessage.value = 'Пароль должен быть не менее 6 символов';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    // 2. Отправка данных на регистрацию
    await authApi.register(form);
    
    // 3. Автоматический вход после успешной регистрации
    const loginResponse = await authApi.login({
      login: form.email, // Используем email как логин
      password: form.password
    });
    
    authStore.login(loginResponse.data.token, loginResponse.data.user);
    await authStore.loadProfile();
    
    router.push('/');
  } catch (error: any) {
    if (error.response?.status === 409) {
      errorMessage.value = 'Пользователь с таким email или телефоном уже существует';
    } else {
      errorMessage.value = 'Ошибка при регистрации. Проверьте данные и попробуйте снова.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <main class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <h1 class="auth-title">Регистрация</h1>
        <p class="auth-subtitle">Станьте частью сообщества гиков прямо сейчас</p>

        <div v-if="errorMessage" class="alert alert-error">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label for="name">Ваше имя</label>
            <input 
              id="name"
              type="text" 
              v-model="form.name" 
              placeholder="Алексей"
              class="input-control"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label for="phone">Телефон</label>
            <input 
              id="phone"
              type="tel" 
              v-model="form.phone" 
              placeholder="+7 (777) 000-00-00"
              class="input-control"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label for="email">Электронная почта</label>
            <input 
              id="email"
              type="email" 
              v-model="form.email" 
              placeholder="example@mail.ru"
              class="input-control"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label for="password">Пароль (мин. 6 символов)</label>
            <input 
              id="password"
              type="password" 
              v-model="form.password" 
              placeholder="••••••••"
              class="input-control"
              required
              minlength="6"
              :disabled="isLoading"
            />
          </div>

          <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
            <span v-if="isLoading">Регистрация...</span>
            <span v-else>Создать аккаунт</span>
          </button>
        </form>

        <div class="auth-footer">
          Уже есть аккаунт? <router-link to="/login">Войти</router-link>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Стили идентичны LoginView для единообразия */
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
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.7;
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
</style>
