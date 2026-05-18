<template>
  <div class="mb-10 pb-8 border-b border-border/40">
    <div v-if="section" class="flex items-center gap-2 mb-3">
      <span
        class="bg-primary/10 text-primary rounded-md px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.1em]">{{
        section }}</span>
    </div>
    <div>
      <h1 class="text-3xl font-bold tracking-tight text-foreground">{{ title }}</h1>
      <p v-if="description" class="text-muted-foreground/80 mt-2 max-w-2xl text-sm leading-relaxed">
        {{ description }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  title: string;
  section?: string;
  description?: string;
}>();
</script>
