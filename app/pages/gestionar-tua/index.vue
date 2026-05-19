<script lang="ts" setup>
const cards = [
  {
    title: 'Nuevo TUA',
    description: 'Crear un nuevo trámite de acreditación.',
    icon: 'lucide:file-plus',
    to: '/gestionar-tua/nuevo',
  },
  {
    title: 'Pendientes',
    description: 'Trámites pendientes de revisión.',
    icon: 'lucide:clock',
    to: '/gestionar-tua/pendientes',
  },
  {
    title: 'En revisión',
    description: 'Trámites en proceso de revisión.',
    icon: 'lucide:search',
    to: '/gestionar-tua/revision',
  },
  {
    title: 'Aprobados',
    description: 'Trámites que han sido aprobados.',
    icon: 'lucide:badge-check',
    to: '/gestionar-tua/aprobados',
  },
  {
    title: 'Historial',
    description: 'Historial completo de trámites.',
    icon: 'lucide:history',
    to: '/gestionar-tua/historial',
  },
  {
    title: 'Limpiar Roles',
    description: 'Limpiar y procesar roles de turno.',
    icon: 'lucide:sparkles',
    to: '/gestionar-tua/limpiar-roles-turno',
  },
  {
    title: 'Generar Data',
    description: 'Generar datos TUA desde archivo Excel.',
    icon: 'lucide:database',
    to: '/gestionar-tua/generar-data',
  },
]
</script>

<template>
  <div>
    <AppPageHeader
      section="Gestionar TUA"
      title="Panel de gestión"
      description="Administra y da seguimiento a los procesos de Trámite Único de Acreditación."
    />

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="card in cards"
        :key="card.to"
        :to="card.to"
        class="bg-card rounded-xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <div class="bg-primary/10 mb-3 flex size-10 items-center justify-center rounded-lg">
          <Icon :name="card.icon" class="text-primary size-5" />
        </div>
        <h3 class="text-sm font-semibold">{{ card.title }}</h3>
        <p class="text-muted-foreground mt-1 text-xs">{{ card.description }}</p>
      </NuxtLink>
    </div>
  </div>
</template>
