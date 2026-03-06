<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { advertsApi } from '../api/adverts.api';
import { categoriesApi } from '../api/categories.api';
import { useAuthStore } from '../stores/auth';
import type { Category, AdvertDetail } from '../types';
import AppNotification from '../components/AppNotification.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const advertId = route.params.id as string;

/**
 * Данные формы (идентичны созданию).
 */
const form = reactive({
  title: '',
  body: '',
  price: 0,
  categoryId: undefined as number | undefined,
  photos: [] as { url: string; order: number }[]
});

const categories = ref<Category[]>([]);
const isLoading = ref(true);
const isSaving = ref(false);
const notification = ref<{ message: string; type: 'success' | 'error' } | null>(null);

/**
 * Загрузка исходных данных и списка категорий.
 */
onMounted(async () => {
  try {
    const [catsRes, advertRes] = await Promise.all([
      categoriesApi.getCategories(),
      advertsApi.getAdvertDetail(advertId)
    ]);

    categories.value = catsRes.data;
    const advert = advertRes.data;

    // Безопасность: проверям автора и статус
    if (advert.author.id !== authStore.user?.id) {
      showNotification('У вас нет прав на редактирование этого объявления', 'error');
      router.push('/');
      return;
    }

    if (advert.status !== 'draft') {
      showNotification('Редактирование разрешено только для черновиков', 'error');
      router.push(`/adverts/${advertId}`);
      return;
    }

    // Заполнение формы
    form.title = advert.title;
    form.body = advert.body;
    form.price = advert.price;
    form.categoryId = advert.category.id;
    form.photos = advert.photos.length > 0 
      ? advert.photos.map(p => ({ url: p.url, order: p.order }))
      : [{ url: '', order: 0 }];

  } catch (error) {
    console.error('Ошибка при инициализации редактирования:', error);
    showNotification('Не удалось загрузить данные объявления', 'error');
  } finally {
    isLoading.value = false;
  }
});

/**
 * Управление списком фото (идентично созданию).
 */
const addPhotoRow = () => {
  form.photos.push({ url: '', order: form.photos.length });
};

const removePhotoRow = (index: number) => {
  if (form.photos.length > 1) {
    form.photos.splice(index, 1);
    form.photos.forEach((p, i) => p.order = i);
  }
};

/**
 * Сохранение изменений.
 */
const handleUpdate = async () => {
  const validPhotos = form.photos.filter(p => p.url.trim() !== '');
  if (validPhotos.length === 0) {
    showNotification('Добавьте хотя бы одну фотографию', 'error');
    return;
  }

  isSaving.value = true;
  try {
    const payload = {
      ...form,
      photos: validPhotos
    };
    await advertsApi.updateAdvert(advertId, payload);
    showNotification('Изменения сохранены!', 'success');
    
    setTimeout(() => {
      router.push(`/adverts/${advertId}`);
    }, 1500);
  } catch (error) {
    showNotification('Ошибка при сохранении', 'error');
  } finally {
    isSaving.value = false;
  }
};

const showNotification = (message: string, type: 'success' | 'error') => {
  notification.value = { message, type };
  setTimeout(() => { notification.value = null; }, 3000);
};
</script>

<template>
  <main class="edit-advert-page container">
    <div v-if="isLoading" class="loader-container">Загрузка данных...</div>
    
    <div v-else class="form-container">
      <h1 class="page-title">Редактирование черновика</h1>
      
      <div class="card">
        <form @submit.prevent="handleUpdate" class="advert-form">
          <div class="form-section">
            <h3 class="section-title">Основная информация</h3>
            
            <div class="form-group">
              <label for="title">Заголовок *</label>
              <input 
                id="title"
                type="text" 
                v-model="form.title" 
                class="input-control"
                required
              />
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="category">Категория *</label>
                <select id="category" v-model="form.categoryId" class="input-control" required>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="price">Цена (₸) *</label>
                <input 
                  id="price"
                  type="number" 
                  v-model.number="form.price" 
                  class="input-control"
                  min="1"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="body">Описание товара *</label>
              <textarea 
                id="body"
                v-model="form.body" 
                class="input-control textarea"
                rows="6"
                required
              ></textarea>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">Фотографии</h3>
            <div class="photos-list">
              <div v-for="(photo, index) in form.photos" :key="index" class="photo-input-group">
                <input 
                  type="url" 
                  v-model="photo.url" 
                  placeholder="URL фотографии"
                  class="input-control flex-grow"
                />
                <button 
                  type="button" 
                  @click="removePhotoRow(index)" 
                  class="btn-icon delete"
                  :disabled="form.photos.length === 1"
                >
                  &times;
                </button>
              </div>
              <button type="button" @click="addPhotoRow" class="btn btn-outline btn-sm">
                + Добавить ещё фото
              </button>
            </div>
          </div>

          <div class="form-footer">
            <button type="button" @click="router.back()" class="btn btn-outline">Отмена</button>
            <button type="submit" class="btn btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Сохранение...' : 'Сохранить изменения' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <AppNotification 
      v-if="notification" 
      :message="notification.message" 
      :type="notification.type" 
      @close="notification = null"
    />
  </main>
</template>

<style scoped>
/* Стили идентичны созданию для консистентности */
.edit-advert-page { padding: 3rem 0; }
.form-container { max-width: 800px; margin: 0 auto; }
.page-title { font-size: 2rem; font-weight: 800; margin-bottom: 2rem; color: #1e293b; }
.card { background: white; border-radius: 12px; border: 1px solid #f1f5f9; padding: 2rem; }
.advert-form { display: flex; flex-direction: column; gap: 2.5rem; }
.section-title { font-size: 1.125rem; font-weight: 700; color: #334155; margin-bottom: 1.5rem; border-left: 4px solid #3b82f6; padding-left: 1rem; }
.form-group { margin-bottom: 1.25rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.input-control { width: 100%; padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 1rem; }
.textarea { resize: vertical; min-height: 120px; }
.photo-input-group { display: flex; gap: 0.75rem; margin-bottom: 0.75rem; }
.btn-icon.delete { color: #ef4444; border-color: #fee2e2; background: #fff; cursor: pointer; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
.form-footer { display: flex; justify-content: flex-end; gap: 1rem; padding-top: 2rem; border-top: 1px solid #f1f5f9; }
</style>
