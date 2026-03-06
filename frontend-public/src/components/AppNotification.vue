<script setup lang="ts">
import { ref, onMounted } from 'vue';

/**
 * Пропсы: текст сообщения, тип (success или error) и длительность показа.
 */
const props = defineProps<{
  message: string;
  type: 'success' | 'error';
  duration?: number;
}>();

/**
 * Эмит для сообщения родительскому компоненту о необходимости скрыть уведомление.
 */
const emit = defineEmits(['close']);

/**
 * Флаг видимости для анимации плавного появления/исчезновения.
 */
const isVisible = ref(false);

onMounted(() => {
  // Активируем видимость с небольшой задержкой для срабатывания CSS перехода
  setTimeout(() => {
    isVisible.value = true;
  }, 10);

  // Настраиваем автоматическое закрытие через указанное время
  const timer = setTimeout(() => {
    isVisible.value = false;
    // Ожидаем окончания анимации исчезновения перед эмитом закрытия
    setTimeout(() => {
      emit('close');
    }, 300);
  }, props.duration || 3010);

  return () => clearTimeout(timer);
});
</script>

<template>
  <div :class="['notification', type, { 'is-visible': isVisible }]">
    <div class="notification-icon">
      <span v-if="type === 'success'">✅</span>
      <span v-else>⚠️</span>
    </div>
    <div class="notification-message">
      {{ message }}
    </div>
    <button class="notification-close" @click="emit('close')">&times;</button>
  </div>
</template>

<style scoped>
.notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  min-width: 300px;
  max-width: 500px;
  transform: translateY(100px);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification.is-visible {
  transform: translateY(0);
  opacity: 1;
}

.notification.success {
  border-left: 4px solid #10b981;
}

.notification.error {
  border-left: 4px solid #ef4444;
}

.notification-icon {
  font-size: 1.25rem;
}

.notification-message {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
}

.notification-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.notification-close:hover {
  color: #4b5563;
}
</style>
