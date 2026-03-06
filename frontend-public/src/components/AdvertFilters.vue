<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import Button from 'primevue/button';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import { useAdvertsStore } from '../stores/adverts';
import { categoriesApi } from '../api/categories.api';
import type { Category } from '../types';

const advertsStore = useAdvertsStore();
const categories = ref<Category[]>([]);
const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

onMounted(async () => {
  try {
    const { data } = await categoriesApi.getCategories();
    categories.value = data;
  } catch (error) {
    console.error('Ошибка при загрузке категорий:', error);
  }
});

/**
 * Следим за изменениями фильтров и вызываем поиск с задержкой (debounce 400ms).
 * Используем watch с глубоким отслеживанием.
 */
watch(
  () => advertsStore.filters,
  () => {
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value);
    }
    
    searchTimeout.value = setTimeout(() => {
      advertsStore.fetchAdverts();
    }, 400);
  },
  { deep: true }
);

const handleReset = () => {
  advertsStore.resetFilters();
};

const sortOptions = [
  { label: 'По дате', value: 'date' },
  { label: 'По цене', value: 'price' }
];

const orderOptions = [
  { label: 'Сначала новые / дорогие', value: 'desc' },
  { label: 'Сначала старые / дешевые', value: 'asc' }
];
</script>

<template>
  <aside class="filters-card p-4 lg:p-6">
    <div class="flex items-center justify-between mb-6">
       <h3 class="text-xl font-bold m-0 flex items-center gap-2">
         <i class="pi pi-sliders-h text-primary"></i>
         Параметры поиска
       </h3>
    </div>

    <div class="filter-group mb-6">
      <label for="search" class="filter-label">Что ищем?</label>
      <IconField>
        <InputIcon class="pi pi-search" />
        <InputText 
          id="search"
          v-model="advertsStore.filters.search" 
          placeholder="Название или описание..."
          class="w-full search-input"
          variant="filled"
        />
      </IconField>
    </div>

    <div class="filter-group mb-6">
      <label for="category" class="filter-label">Категория</label>
      <Select 
        id="category"
        v-model="advertsStore.filters.categoryId" 
        :options="categories"
        optionLabel="name"
        optionValue="id"
        placeholder="Все категории"
        showClear
        class="w-full custom-select"
        aria-label="Выберите категорию"
      >
        <template #value="slotProps">
           <div v-if="slotProps.value" class="flex items-center gap-2">
             <i class="pi pi-tag text-primary text-sm"></i>
             <span>{{ categories.find(c => c.id === slotProps.value)?.name }}</span>
           </div>
           <span v-else>{{ slotProps.placeholder }}</span>
        </template>
      </Select>
    </div>

    <div class="filter-group mb-6">
      <label class="filter-label">Диапазон цены (₸)</label>
      <div class="price-range flex gap-2 flex-direction-row">
        <IconField class="flex-1">
          <InputIcon class="pi pi-money-bill text-sm" />
          <InputNumber 
            v-model="advertsStore.filters.priceMin" 
            placeholder="От" 
            mode="decimal"
            class="w-full"
            inputClass="price-input"
          />
        </IconField>
        <IconField class="flex-1">
          <InputIcon class="pi pi-money-bill text-sm" />
          <InputNumber 
            v-model="advertsStore.filters.priceMax" 
            placeholder="До" 
            mode="decimal"
            class="w-full"
            inputClass="price-input"
          />
        </IconField>
      </div>
    </div>

    <div class="filter-group mb-8">
      <label for="sort" class="filter-label">Сортировка</label>
      <div class="flex flex-col gap-3">
        <Select 
          id="sort" 
          v-model="advertsStore.filters.sortBy" 
          :options="sortOptions"
          optionLabel="label"
          optionValue="value"
          class="w-full custom-select-small"
        />
        <Select 
          v-model="advertsStore.filters.sortOrder" 
          :options="orderOptions"
          optionLabel="label"
          optionValue="value"
          class="w-full custom-select-small"
        />
      </div>
    </div>

    <Button 
      label="Сбросить всё" 
      icon="pi pi-refresh" 
      severity="secondary" 
      size="small"
      variant="text"
      class="w-full reset-button" 
      @click="handleReset" 
    />
  </aside>
</template>

<style scoped>
.filters-card {
  background: #ffffff;
  border-radius: 1.25rem;
  border: 1px solid #eef2f6;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 6rem;
  transition: all 0.3s ease;
}

.filter-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.5rem;
  padding-left: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.search-input {
  border-radius: 10px;
}

.custom-select :deep(.p-select-label) {
  padding: 0.6rem 1rem;
}

.price-input {
  width: 100%;
}

.price-range :deep(.p-inputnumber-input) {
  padding-left: 2.25rem !important;
  border-radius: 10px;
}

.custom-select-small {
  border-radius: 8px;
}

.reset-button {
  font-weight: 600;
  color: #94a3b8;
}

.reset-button:hover {
  color: #ef4444 !important;
}

:deep(.p-inputtext), 
:deep(.p-select) {
  border-color: #e2e8f0;
  transition: border-color 0.2s, box-shadow 0.2s;
}

:deep(.p-inputtext:enabled:focus), 
:deep(.p-select:not(.p-disabled).p-focus) {
  border-color: var(--p-primary-color);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.text-primary {
  color: #3b82f6;
}

.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.flex-direction-row { flex-direction: column; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.m-0 { margin: 0; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.p-4 { padding: 1rem; }
.w-full { width: 100%; }
.flex-1 { flex: 1; }
.text-xl { font-size: 1.25rem; }
.text-sm { font-size: 0.875rem; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }

@media (min-width: 1024px) {
  .lg\:p-6 { padding: 1.5rem; }
}
</style>
