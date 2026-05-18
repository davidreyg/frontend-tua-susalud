<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold mb-2">Limpiar Roles de turno</h1>
    <p class="text-muted-foreground mb-8">
      Sube un archivo Excel con los roles de turno para procesarlo y obtener una versión limpia.
    </p>

    <div
      class="border-input data-[drag-over]:border-primary flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 transition-colors"
      @drop.prevent="handleDrop" @dragover.prevent="dragOver = true" @dragleave.prevent="dragOver = false"
      @click="inputRef?.click()">
      <Icon :name="file ? 'lucide:file-spreadsheet' : 'lucide:upload'" class="text-muted-foreground size-10" />
      <div class="text-center">
        <p class="font-medium">
          {{ file ? file.name : 'Arrastra tu archivo Excel aquí o haz clic para seleccionarlo' }}
        </p>
        <p v-if="!file" class="text-muted-foreground mt-1 text-sm">Solo archivos .xlsx o .xls</p>
      </div>
      <input ref="inputRef" type="file" accept=".xlsx,.xls" class="hidden" @change="handleFileChange" />
    </div>

    <div v-if="file" class="mt-6 flex items-center gap-3">
      <UiButton size="lg" :loading="loading" @click="uploadFile">
        <Icon name="lucide:wand-sparkles" class="size-4" />
        Limpiar archivo
      </UiButton>
      <UiButton variant="outline" size="lg" @click="reset">
        <Icon name="lucide:x" class="size-4" />
        Cancelar
      </UiButton>
    </div>

    <div v-if="resultUrl" class="mt-8 rounded-lg border bg-card p-6 text-sm">
      <div class="flex items-center gap-3">
        <Icon name="lucide:check-circle-2" class="text-primary size-6" />
        <div class="flex-1">
          <p class="font-semibold">Archivo procesado correctamente</p>
          <p class="text-muted-foreground mt-0.5">El archivo limpio está listo para descargar.</p>
        </div>
        <UiButton as="a" :href="resultUrl" download variant="default">
          <Icon name="lucide:download" class="size-4" />
          Descargar
        </UiButton>
      </div>
    </div>

    <div v-if="error" class="mt-8 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm">
      <div class="flex items-center gap-3">
        <Icon name="lucide:alert-circle" class="size-5 shrink-0 text-destructive" />
        <p class="text-destructive">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const inputRef = ref<HTMLInputElement>();
const dragOver = ref(false);
const file = ref<File>();
const loading = ref(false);
const resultUrl = ref<string>();
const error = ref<string>();

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const selected = target.files?.[0];
  if (selected) validateAndSet(selected);
}

function handleDrop(e: DragEvent) {
  dragOver.value = false;
  const dropped = e.dataTransfer?.files?.[0];
  if (dropped) validateAndSet(dropped);
}

function validateAndSet(f: File) {
  error.value = undefined;
  resultUrl.value = undefined;

  const validTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];
  if (!validTypes.includes(f.type) && !f.name.endsWith(".xlsx") && !f.name.endsWith(".xls")) {
    error.value = "Solo se permiten archivos Excel (.xlsx o .xls)";
    return;
  }

  file.value = f;
}

async function uploadFile() {
  if (!file.value) return;

  loading.value = true;
  error.value = undefined;
  resultUrl.value = undefined;

  try {
    const form = new FormData();
    form.append("file", file.value);

    const res = await $fetch("/api/limpiar-roles-turno", {
      method: "POST",
      body: form,
      responseType: "blob",
    });

    resultUrl.value = URL.createObjectURL(res as Blob);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || "Error al procesar el archivo";
  } finally {
    loading.value = false;
  }
}

function reset() {
  file.value = undefined;
  resultUrl.value = undefined;
  error.value = undefined;
  if (inputRef.value) inputRef.value.value = "";
}
</script>
