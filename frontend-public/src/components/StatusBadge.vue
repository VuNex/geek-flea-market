<script setup lang="ts">
import { computed } from 'vue';
import Badge from 'primevue/badge';
import type { AdvertStatus } from '../types';

const props = defineProps<{
  status: AdvertStatus;
}>();

const STATUS_MAP: Record<AdvertStatus, { label: string; severity: string }> = {
  draft: { label: 'Черновик', severity: 'secondary' },
  moderation: { label: 'На модерации', severity: 'warn' },
  published: { label: 'Опубликовано', severity: 'success' },
  rejected: { label: 'Отклонено', severity: 'danger' },
  archived: { label: 'В архиве', severity: 'contrast' },
};

const currentStatus = computed(() => {
  return STATUS_MAP[props.status] || { label: 'Неизвестно', severity: null };
});
</script>

<template>
  <Badge :value="currentStatus.label" :severity="currentStatus.severity" />
</template>

<style scoped>

</style>
