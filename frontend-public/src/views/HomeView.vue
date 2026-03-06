<script setup lang="ts">
import { onMounted } from 'vue';
import { useAdvertsStore } from '../stores/adverts';
import AdvertCard from '../components/AdvertCard.vue';
import AdvertFilters from '../components/AdvertFilters.vue';

const advertsStore = useAdvertsStore();

onMounted(() => {
  advertsStore.fetchAdverts();
});
</script>

<template>
  <div class="home-page container">
    <div class="home-layout">
      <aside class="sidebar">
        <AdvertFilters />
      </aside>

      <main class="content">
        <div class="content-header">
          <h1 class="page-title">Объявления</h1>
          <p class="results-count">Найдено: {{ advertsStore.adverts.length }}</p>
        </div>

        <div v-if="advertsStore.isLoading" class="loader-container">
          <div class="loader"></div>
          <p>Поиск сокровищ...</p>
        </div>

        <template v-else>
          <div v-if="advertsStore.adverts.length > 0" class="adverts-grid">
            <AdvertCard 
              v-for="advert in advertsStore.adverts" 
              :key="advert.id" 
              :advert="advert" 
            />
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">🔍</div>
            <h2>Ничего не нашли</h2>
            <p>Попробуйте изменить параметры поиска или сбросить фильтры.</p>
            <button @click="advertsStore.resetFilters" class="btn btn-primary">
              Сбросить фильтры
            </button>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  padding-top: 2rem;
  padding-bottom: 4rem;
}

.home-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2.5rem;
}

.sidebar {
  /* Стили заданы внутри компонента AdvertFilters */
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
}

.results-count {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.adverts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 0;
  color: #64748b;
}

.loader {
  border: 4px solid #f1f5f9;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #1e293b;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

@media (max-width: 1024px) {
  .home-layout {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    display: none;
  }
}
</style>
