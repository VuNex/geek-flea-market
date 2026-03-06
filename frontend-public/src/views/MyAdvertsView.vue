<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { authApi } from '../api/auth.api';
import type { AdvertListItem } from '../types';
import AdvertCard from '../components/AdvertCard.vue';

/**
 * Варианты фильтрации по статусу.
 */
const statuses = [
  { value: 'all', label: 'Все' },
  { value: 'draft', label: 'Черновик' },
  { value: 'moderation', label: 'На модерации' },
  { value: 'published', label: 'Опубликовано' },
  { value: 'rejected', label: 'Отклонено' },
  { value: 'archived', label: 'Архив' },
];

const selectedStatus = ref('all');
const adverts = ref<AdvertListItem[]>([]);
const isLoading = ref(true);

/**
 * Загрузка объявлений пользователя с учетом выбранного фильтра.
 */
const fetchMyAdverts = async () => {
  isLoading.value = true;
  try {
    // Если выбрано 'all', передаем undefined в API
    const statusParam = selectedStatus.value === 'all' ? undefined : selectedStatus.value;
    const { data } = await authApi.getMyAdverts(statusParam);
    adverts.value = data;
  } catch (error) {
    console.error('Ошибка при загрузке моих объявлений:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchMyAdverts);

/**
 * При смене таба автоматически перезагружаем данные.
 */
watch(selectedStatus, fetchMyAdverts);
</script>

<template>
  <main class="my-adverts-page container">
    <div class="profile-layout">
      <!-- Навигация по личному кабинету -->
      <aside class="profile-sidebar">
        <nav class="profile-nav">
          <router-link to="/profile" class="nav-item">Настройки профиля</router-link>
          <router-link to="/profile/adverts" class="nav-item active">Мои объявления</router-link>
        </nav>
      </aside>

      <!-- Контент списка объявлений -->
      <section class="profile-content">
        <div class="header-with-action">
          <h1 class="page-title">Мои объявления</h1>
          <router-link to="/adverts/create" class="btn btn-primary">Создать объявление</router-link>
        </div>

        <!-- Табы статусов -->
        <div class="status-tabs">
          <button 
            v-for="status in statuses" 
            :key="status.value"
            @click="selectedStatus = status.value"
            :class="['tab-btn', { active: selectedStatus === status.value }]"
          >
            {{ status.label }}
          </button>
        </div>

        <div v-if="isLoading" class="loader-container">Загрузка ваших объявлений...</div>
        
        <template v-else>
          <div v-if="adverts.length > 0" class="adverts-grid">
            <AdvertCard 
              v-for="advert in adverts" 
              :key="advert.id" 
              :advert="advert" 
            />
          </div>
          
          <div v-else class="empty-state">
            <p>В этой категории у вас пока нет объявлений.</p>
            <router-link v-if="selectedStatus === 'all'" to="/adverts/create" class="btn btn-outline">Разместить первое объявление</router-link>
          </div>
        </template>
      </section>
    </div>
  </main>
</template>

<style scoped>
/* Базовая раскладка профиля дублируется или выносится в общие стили */
.my-adverts-page { padding: 3rem 0; }
.profile-layout { display: grid; grid-template-columns: 250px 1fr; gap: 3rem; }
.page-title { font-size: 1.75rem; font-weight: 800; color: #1e293b; }
.profile-nav { display: flex; flex-direction: column; gap: 0.5rem; }
.nav-item { display: block; padding: 0.75rem 1rem; text-decoration: none; color: #64748b; border-radius: 8px; font-weight: 600; transition: all 0.2s; }
.nav-item:hover { background-color: #f1f5f9; color: #334155; }
.nav-item.active { background-color: #eff6ff; color: #2563eb; }

.header-with-action { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }

.status-tabs { display: flex; gap: 0.5rem; border-bottom: 1px solid #e2e8f0; margin-bottom: 2rem; overflow-x: auto; padding-bottom: 0.5rem; }
.tab-btn { padding: 0.5rem 1rem; border: none; background: none; font-size: 0.875rem; font-weight: 600; color: #64748b; cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap; transition: all 0.2s; }
.tab-btn:hover { color: #1e293b; }
.tab-btn.active { color: #2563eb; border-bottom-color: #2563eb; }

.adverts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; }

.empty-state { text-align: center; padding: 4rem 2rem; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1; }
.empty-state p { margin-bottom: 1.5rem; color: #64748b; }

@media (max-width: 1024px) {
  .profile-layout { grid-template-columns: 1fr; }
  .profile-sidebar { display: none; }
}
</style>
