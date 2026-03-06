<script setup lang="ts">
import { computed } from 'vue';
import Card from 'primevue/card';
import Badge from 'primevue/badge';
import type { AdvertListItem } from '../types';
import AdvantageBadge from './AdvantageBadge.vue';
import StatusBadge from './StatusBadge.vue';

const props = defineProps<{
  advert: AdvertListItem;
}>();

const formattedPrice = computed(() => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'KZT',
    maximumFractionDigits: 0,
  }).format(props.advert.price);
});

const mainPhotoUrl = computed(() => {
  if (props.advert.photos && props.advert.photos.length > 0) {
    return props.advert.photos.sort((a, b) => a.order - b.order)[0].url;
  }
  return '/images/no_photo.jpg';
});

const formattedDate = computed(() => {
  if (!props.advert.publishedAt) return '';
  return new Date(props.advert.publishedAt).toLocaleDateString('ru-RU');
});
</script>

<template>
  <router-link :to="`/adverts/${advert.id}`" class="advert-card-link">
    <Card class="advert-card h-full overflow-hidden">
      <template #header>
        <div class="card-image-wrapper">
          <img :src="mainPhotoUrl" :alt="advert.title" class="card-image" loading="lazy" />
          <div v-if="advert.advantageType" class="card-advantage">
            <AdvantageBadge :type="advert.advantageType" />
          </div>
        </div>
      </template>
      
      <template #title>
        <div class="card-title-container">
          <h3 class="card-title">{{ advert.title }}</h3>
          <div class="card-price">{{ formattedPrice }}</div>
        </div>
      </template>

      <template #content>
        <div class="card-meta">
          <div class="card-category-badge">
             <i class="pi pi-tag mr-1 text-primary"></i>
             <span>{{ advert.category.name }}</span>
          </div>
          <span class="card-date">{{ formattedDate }}</span>
        </div>
      </template>
      
      <template #footer>
        <div class="card-footer">
          <div class="card-author">
            <i class="pi pi-user mr-1"></i>
            <span class="author-name">{{ advert.author.name }}</span>
          </div>
          <StatusBadge v-if="advert.status !== 'published'" :status="advert.status" />
        </div>
      </template>
    </Card>
  </router-link>
</template>

<style scoped>
.advert-card-link {
  text-decoration: none;
  color: inherit;
  display: block;
  height: 100%;
}

.advert-card {
  transition: all 0.3s ease;
  border: 1px solid #f1f5f9;
}

.advert-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.card-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
  background-color: #f8fafc;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.advert-card:hover .card-image {
  transform: scale(1.05);
}

.card-advantage {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 10;
}

.card-title-container {
  margin-top: -0.5rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 0.25rem;
  color: #1e293b;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-price {
  font-size: 1.15rem;
  font-weight: 800;
  color: #3b82f6;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.card-category-badge {
  display: flex;
  align-items: center;
  font-weight: 600;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
  border-top: 1px solid #f1f5f9;
}

.card-author {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: #64748b;
}

.author-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mr-1 {
  margin-right: 0.25rem;
}

.text-primary {
  color: #3b82f6;
}

.h-full {
  height: 100%;
}
</style>
