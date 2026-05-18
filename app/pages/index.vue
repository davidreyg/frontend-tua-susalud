<template>
  <div>
    <AppPageHeader
      title="Inicio"
      description="Bienvenido al sistema de gestión de Trámite Único de Acreditación."
    />

    <div class="rounded-xl border bg-card p-8">
      <div class="flex flex-col items-center gap-4 text-center">
        <div class="bg-primary/10 flex size-16 items-center justify-center rounded-2xl">
          <Icon name="lucide:home" class="text-primary size-7" />
        </div>
        <div>
          <h2 class="text-lg font-semibold">Panel principal</h2>
          <p class="text-muted-foreground mt-1 max-w-md text-sm">
            Selecciona una opción en el menú lateral para comenzar a gestionar los trámites TUA.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
