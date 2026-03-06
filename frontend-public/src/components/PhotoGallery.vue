<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Image from 'primevue/image';
import type { AdvertPhoto } from '../types';

/**
 * Пропсы: список фотографий объявления.
 */
const props = defineProps<{
  photos: AdvertPhoto[];
}>();

/**
 * Сортируем фотографии по полю order.
 */
const sortedPhotos = computed(() => {
  return [...props.photos].sort((a, b) => a.order - b.order);
});

/**
 * Индекс текущей выбранной фотографии.
 */
const activeIndex = ref(0);

/**
 * Сбрасываем индекс при изменении набора фотографий.
 */
watch(() => props.photos, () => {
  activeIndex.value = 0;
}, { deep: true });

/**
 * URL активной фотографии.
 */
const activePhotoUrl = computed(() => {
  return sortedPhotos.value[activeIndex.value]?.url || '/images/no_photo.jpg';
});

/**
 * Смена активной фотографии.
 */
const selectPhoto = (index: number) => {
  activeIndex.value = index;
};
</script>

<template>
  <div class="photo-gallery">
    <!-- Основное изображение с возможностью предпросмотра -->
    <div class="main-photo-container">
      <Image 
        :src="activePhotoUrl" 
        alt="Фото объявления" 
        preview 
        image-class="main-photo"
        class="w-full h-full"
      />
    </div>

    <!-- Список миниатюр -->
    <div v-if="sortedPhotos.length > 1" class="thumbnails">
      <button 
        v-for="(photo, index) in sortedPhotos" 
        :key="photo.id || index"
        class="thumbnail-btn"
        :class="{ active: activeIndex === index }"
        @click="selectPhoto(index)"
      >
        <img :src="photo.url" alt="Миниатюра" class="thumbnail-img" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.photo-gallery {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main-photo-container {
  width: 100%;
  aspect-ratio: 16/9;
  background-color: #f8fafc;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

:deep(.main-photo) {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.thumbnails {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.thumbnail-btn {
  flex-shrink: 0;
  width: 80px;
  height: 60px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  background: none;
  transition: all 0.2s;
}

.thumbnail-btn.active {
  border-color: #3b82f6;
  transform: scale(1.05);
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnails::-webkit-scrollbar {
  height: 4px;
}
.thumbnails::-webkit-scrollbar-track {
  background: #f1f5f9;
}
.thumbnails::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.w-full { width: 100%; }
.h-full { height: 100%; }
</style>
