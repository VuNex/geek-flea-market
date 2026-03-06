<script setup lang="ts">
import { computed } from 'vue';
import type { AdvantageType } from '../types';

const props = defineProps<{
  type: AdvantageType;
}>();

const config = computed(() => {
  if (props.type === 'vip') {
    return { label: 'VIP', icon: 'pi pi-star-fill', class: 'badge-vip' };
  }
  if (props.type === 'top') {
    return { label: 'TOP', icon: 'pi pi-arrow-up', class: 'badge-top' };
  }
  return null;
});
</script>

<template>
  <span v-if="config" :class="['advantage-badge', config.class]">
    <i :class="[config.icon, 'mr-1']"></i>
    {{ config.label }}
  </span>
</template>

<style scoped>
.advantage-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 800;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.05em;
}

.badge-vip {
  background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
  border: 1px solid #b45309;
}

.badge-top {
  background: linear-gradient(135deg, #a78bfa 0%, #6366f1 100%);
  border: 1px solid #4f46e5;
}

.mr-1 {
  margin-right: 0.25rem;
  font-size: 0.7rem;
}
</style>
