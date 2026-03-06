<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { advertsApi } from '../api/adverts.api';
import { servicesApi } from '../api/services.api';
import type { AdvertDetail, AdvantageService, AdvertStatus } from '../types';
import PhotoGallery from '../components/PhotoGallery.vue';
import StatusBadge from '../components/StatusBadge.vue';
import AdvantageBadge from '../components/AdvantageBadge.vue';
import AppNotification from '../components/AppNotification.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const advertId = route.params.id as string;

const advert = ref<AdvertDetail | null>(null);
const services = ref<AdvantageService[]>([]);
const isLoading = ref(true);
const notification = ref<{ message: string; type: 'success' | 'error' } | null>(null);

/**
 * Проверяем, является ли текущий пользователь автором объявления.
 */
const isAuthor = computed(() => {
  return authStore.isAuthenticated && advert.value?.author.id === authStore.user?.id;
});

/**
 * Форматирование цены.
 */
const formattedPrice = computed(() => {
  if (!advert.value) return '';
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(advert.value.price);
});

/**
 * Загрузка данных объявления и услуг (если автор).
 */
const loadData = async () => {
  isLoading.value = true;
  try {
    const { data } = await advertsApi.getAdvertDetail(advertId);
    advert.value = data;

    // Если автор — загружаем список услуг
    if (isAuthor.value && data.status === 'published') {
      const servicesRes = await servicesApi.getAdvertServices(advertId);
      services.value = servicesRes.data;
    }
  } catch (error) {
    console.error('Ошибка при загрузке деталей:', error);
    showNotification('Не удалось загрузить данные объявления', 'error');
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadData);

/**
 * Управление статусом (для автора).
 */
const handleStatusChange = async (newStatus: AdvertStatus) => {
  try {
    await advertsApi.updateStatus(advertId, newStatus);
    showNotification(`Статус изменен на "${newStatus}"`, 'success');
    await loadData(); // Обновляем данные
  } catch (error) {
    showNotification('Не удалось изменить статус', 'error');
  }
};

/**
 * Удаление объявления (только из архива).
 */
const handleDelete = async () => {
  if (!confirm('Вы уверены, что хотите удалить объявление безвозвратно?')) return;
  try {
    await advertsApi.deleteAdvert(advertId);
    router.push('/profile/adverts');
  } catch (error) {
    showNotification('Ошибка при удалении', 'error');
  }
};

/**
 * Активация/продление услуг.
 */
const handleActivateService = async (type: 'vip' | 'top') => {
  try {
    await servicesApi.activateService(advertId, type);
    showNotification(`Услуга ${type.toUpperCase()} активирована!`, 'success');
    await loadData();
  } catch (error) {
    showNotification('Не удалось активировать услугу', 'error');
  }
};

const handleExtendService = async (serviceId: number) => {
  try {
    await servicesApi.extendService(advertId, serviceId);
    showNotification('Услуга продлена', 'success');
    await loadData();
  } catch (error) {
    showNotification('Не удалось продлить услугу', 'error');
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
  <div class="advert-detail-page container">
    <div v-if="isLoading" class="loader-container">Загрузка...</div>
    
    <template v-else-if="advert">
      <div class="detail-layout">
        <!-- Левая колонка: Фото и Описание -->
        <div class="main-info">
          <PhotoGallery :photos="advert.photos" />
          
          <section class="description-section">
            <h2 class="section-title">Описание</h2>
            <p class="advert-body">{{ advert.body }}</p>
          </section>
        </div>

        <!-- Правая колонка: Цена, Автор, Действия -->
        <aside class="sidebar">
          <div class="sidebar-card price-card">
            <div class="header-row">
              <StatusBadge :status="advert.status" />
              <AdvantageBadge v-if="advert.advantageType" :type="advert.advantageType" />
            </div>
            <h1 class="advert-title">{{ advert.title }}</h1>
            <div class="price-tag">{{ formattedPrice }}</div>
            
            <div class="meta-info">
              <span>Категория: {{ advert.category.name }}</span>
              <span>Просмотров: {{ advert.viewsCount }}</span>
            </div>
          </div>

          <div class="sidebar-card contact-card">
            <h3 class="card-title">Автор</h3>
            <div class="author-row">
              <span class="avatar">👤</span>
              <span class="author-name">{{ advert.author.name }}</span>
            </div>
            
            <div class="phone-block">
              <template v-if="authStore.isAuthenticated">
                <a :href="`tel:${advert.author.phone}`" class="btn btn-primary btn-block">
                  Позвонить: {{ advert.author.phone }}
                </a>
              </template>
              <template v-else>
                <div class="phone-hidden">
                  <router-link to="/login">Войдите</router-link>, чтобы увидеть телефон
                </div>
              </template>
            </div>
          </div>

          <!-- Блок управления для автора -->
          <div v-if="isAuthor" class="sidebar-card actions-card">
            <h3 class="card-title">Ваше объявление</h3>
            
            <div class="action-buttons">
              <!-- Статус: draft -->
              <template v-if="advert.status === 'draft'">
                <router-link :to="`/adverts/${advert.id}/edit`" class="btn btn-outline btn-block">Редактировать</router-link>
                <button @click="handleStatusChange('moderation')" class="btn btn-primary btn-block">На модерацию</button>
                <button @click="handleStatusChange('archived')" class="btn btn-outline btn-block">В архив</button>
              </template>

              <!-- Статус: published -->
              <template v-if="advert.status === 'published'">
                <button @click="handleStatusChange('draft')" class="btn btn-outline btn-block">В черновик</button>
                <button @click="handleStatusChange('archived')" class="btn btn-outline btn-block">В архив</button>
              </template>

              <!-- Статус: rejected -->
              <template v-if="advert.status === 'rejected'">
                <button @click="handleStatusChange('draft')" class="btn btn-outline btn-block">В черновик</button>
                <button @click="handleStatusChange('archived')" class="btn btn-outline btn-block">В архив</button>
              </template>

              <!-- Статус: archived -->
              <template v-if="advert.status === 'archived'">
                <button @click="handleStatusChange('published')" class="btn btn-primary btn-block">Опубликовать заново</button>
                <button @click="handleDelete" class="btn btn-danger btn-block">Удалить навсегда</button>
              </template>
            </div>
          </div>

          <!-- Блок услуг для автора (только published) -->
          <div v-if="isAuthor && advert.status === 'published'" class="sidebar-card services-card">
            <h3 class="card-title">Платные услуги</h3>
            
            <div class="services-list">
              <div v-for="svc in services" :key="svc.id" class="service-item">
                <div class="svc-header">
                  <AdvantageBadge :type="svc.type" />
                  <span v-if="svc.isActive" class="svc-status active">Активна до {{ new Date(svc.expiresAt).toLocaleDateString() }}</span>
                  <span v-else class="svc-status expired">Истекла</span>
                </div>
                <button v-if="svc.isActive" @click="handleExtendService(svc.id)" class="btn btn-sm btn-outline">Продлить</button>
              </div>

              <!-- Кнопки активации новых если таких еще нет активных -->
              <div class="activation-buttons">
                <button v-if="!services.some(s => s.type === 'vip' && s.isActive)" @click="handleActivateService('vip')" class="btn btn-sm btn-block btn-vip">Активировать VIP</button>
                <button v-if="!services.some(s => s.type === 'top' && s.isActive)" @click="handleActivateService('top')" class="btn btn-sm btn-block btn-top">Активировать TOP</button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </template>

    <div v-else class="empty-state">Объявление не найдено</div>

    <!-- Глобальные уведомления -->
    <AppNotification 
      v-if="notification" 
      :message="notification.message" 
      :type="notification.type" 
      @close="notification = null"
    />
  </div>
</template>

<style scoped>
.advert-detail-page { padding: 2rem 0; }
.detail-layout { display: grid; grid-template-columns: 1fr 350px; gap: 2.5rem; }
.sidebar-card { background: white; border: 1px solid #f1f5f9; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; }
.header-row { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
.advert-title { font-size: 1.75rem; font-weight: 800; margin-bottom: 1rem; line-height: 1.2; }
.price-tag { font-size: 2rem; font-weight: 800; color: #1e293b; margin-bottom: 1rem; }
.meta-info { display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.875rem; color: #64748b; }
.section-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; margin-top: 2rem; }
.advert-body { line-height: 1.6; color: #334155; white-space: pre-wrap; }
.card-title { font-size: 1rem; font-weight: 700; margin-bottom: 1rem; }
.author-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
.avatar { font-size: 2rem; background: #f1f5f9; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.phone-hidden { background: #f8fafc; padding: 1rem; border-radius: 8px; text-align: center; font-size: 0.875rem; border: 1px dashed #cbd5e1; }
.action-buttons { display: flex; flex-direction: column; gap: 0.75rem; }
.service-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #f8fafc; border-radius: 8px; margin-bottom: 0.5rem; }
.svc-header { display: flex; flex-direction: column; gap: 0.25rem; }
.svc-status { font-size: 0.7rem; font-weight: 600; }
.svc-status.active { color: #059669; }
.svc-status.expired { color: #94a3b8; }
.btn-block { width: 100%; justify-content: center; }
.btn-danger { background: #fee2e2; color: #b91c1c; }
.btn-vip { background: #f59e0b; color: white; }
.btn-top { background: #8b5cf6; color: white; }

@media (max-width: 1024px) {
  .detail-layout { grid-template-columns: 1fr; }
}
</style>
