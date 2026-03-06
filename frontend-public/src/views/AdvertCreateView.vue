<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { advertsApi } from '../api/adverts.api';
import { categoriesApi } from '../api/categories.api';
import type { Category } from '../types';
import AppNotification from '../components/AppNotification.vue';

const router = useRouter();

/**
 * Данные нового объявления.
 */
const form = reactive({
  title: '',
  body: '',
  price: 0,
  categoryId: undefined as number | undefined,
  photos: [{ url: '', order: 0 }] // Минимум одна строка для фото по умолчанию
});

const categories = ref<Category[]>([]);
const isLoading = ref(false);
const notification = ref<{ message: string; type: 'success' | 'error' } | null>(null);

/**
 * Загрузка категорий для выпадающего списка.
 */
onMounted(async () => {
  try {
    const { data } = await categoriesApi.getCategories();
    categories.value = data;
  } catch (error) {
    console.error('Ошибка при загрузке категорий:', error);
  }
});

/**
 * Динамическое управление списком фотографий.
 */
const addPhotoRow = () => {
  form.photos.push({ url: '', order: form.photos.length });
};

const removePhotoRow = (index: number) => {
  if (form.photos.length > 1) {
    form.photos.splice(index, 1);
    // Обновляем порядок
    form.photos.forEach((p, i) => p.order = i);
  }
};

/**
 * Валидация и отправка формы.
 */
const handleCreate = async () => {
  // 1. Валидация
  if (!form.title || !form.body || form.price <= 0 || !form.categoryId) {
    showNotification('Пожалуйста, заполните все обязательные поля корректно', 'error');
    return;
  }

  const validPhotos = form.photos.filter(p => p.url.trim() !== '');
  if (validPhotos.length === 0) {
    showNotification('Добавьте хотя бы одну фотографию (URL)', 'error');
    return;
  }

  isLoading.value = true;
  try {
    const payload = {
      ...form,
      photos: validPhotos
    };
    const { data } = await advertsApi.createAdvert(payload);
    showNotification('Объявление создано!', 'success');
    
    // Переход на страницу деталей созданного объявления
    setTimeout(() => {
      router.push(`/adverts/${data.id}`);
    }, 1500);
  } catch (error: any) {
    showNotification('Ошибка при создании объявления', 'error');
  } finally {
    isLoading.value = false;
  }
};

const showNotification = (message: string, type: 'success' | 'error') => {
  notification.value = { message, type };
  setTimeout(() => { notification.value = null; }, 3000);
};
</script>

<template>
  <main class="create-advert-page container">
    <div class="form-container">
      <h1 class="page-title">Новое объявление</h1>
      
      <div class="card">
        <form @submit.prevent="handleCreate" class="advert-form">
          <!-- Основные поля -->
          <div class="form-section">
            <h3 class="section-title">Основная информация</h3>
            
            <div class="form-group">
              <label for="title">Заголовок *</label>
              <input 
                id="title"
                type="text" 
                v-model="form.title" 
                placeholder="Например: Процессор Intel Core i9-13900K"
                class="input-control"
                required
              />
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="category">Категория *</label>
                <select id="category" v-model="form.categoryId" class="input-control" required>
                  <option :value="undefined" disabled>Выберите категорию</option>
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
                placeholder="Опишите состояние, комплектацию и причину продажи..."
                class="input-control textarea"
                rows="6"
                required
              ></textarea>
            </div>
          </div>

          <!-- Фотографии -->
          <div class="form-section">
            <h3 class="section-title">Фотографии (минимум 1 URL)</h3>
            <div class="photos-list">
              <div v-for="(photo, index) in form.photos" :key="index" class="photo-input-group">
                <input 
                  type="url" 
                  v-model="photo.url" 
                  placeholder="https://example.com/image.jpg"
                  class="input-control flex-grow"
                />
                <button 
                  type="button" 
                  @click="removePhotoRow(index)" 
                  class="btn-icon delete"
                  title="Удалить"
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
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              {{ isLoading ? 'Создание...' : 'Разместить объявление' }}
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
.create-advert-page { padding: 3rem 0; }
.form-container { max-width: 800px; margin: 0 auto; }
.page-title { font-size: 2rem; font-weight: 800; margin-bottom: 2rem; color: #1e293b; }
.card { background: white; border-radius: 12px; border: 1px solid #f1f5f9; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }

.advert-form { display: flex; flex-direction: column; gap: 2.5rem; }
.section-title { font-size: 1.125rem; font-weight: 700; color: #334155; margin-bottom: 1.5rem; border-left: 4px solid #3b82f6; padding-left: 1rem; }

.form-group { margin-bottom: 1.25rem; }
.form-group label { display: block; font-size: 0.875rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }

.input-control { width: 100%; padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 1rem; }
.textarea { resize: vertical; min-height: 120px; }

.photo-input-group { display: flex; gap: 0.75rem; margin-bottom: 0.75rem; }
.flex-grow { flex: 1; }
.btn-icon { width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid #e2e8f0; cursor: pointer; font-size: 1.5rem; }
.btn-icon.delete { color: #ef4444; border-color: #fee2e2; background: #fff; }
.btn-icon:disabled { opacity: 0.3; cursor: not-allowed; }

.form-footer { display: flex; justify-content: flex-end; gap: 1rem; padding-top: 2rem; border-top: 1px solid #f1f5f9; }

@media (max-width: 640px) {
  .form-grid { grid-template-columns: 1fr; }
}
</style>
