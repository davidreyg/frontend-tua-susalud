<script lang="ts" setup>
defineProps<{
  title: string
  section?: string
  description?: string
}>()
</script>

<template>
  <div class="border-border/40 mb-10 border-b pb-8">
    <div v-if="section" class="mb-3 flex items-center gap-2">
      <span
        class="bg-primary/10 text-primary rounded-md px-2.5 py-0.5 text-[11px] font-semibold tracking-widest uppercase"
        >{{ section }}</span
      >
    </div>
    <div>
      <h1 class="text-foreground text-3xl font-bold tracking-tight">{{ title }}</h1>
      <p v-if="description" class="text-muted-foreground/80 mt-2 max-w-2xl text-sm leading-relaxed">
        {{ description }}
      </p>
    </div>
  </div>
</template>
