<template>
  <div>
    <AppPageHeader section="Gestionar TUA" title="Limpiar Roles de turno"
      description="Sube un archivo Excel con los roles de turno para procesarlo y obtener una versión limpia." />

    <!-- Upload section -->
    <div class="rounded-xl border bg-card">
      <div class="p-6 pb-4">
        <div class="flex items-center gap-2.5">
          <div class="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
            <Icon name="lucide:upload" class="text-primary size-4" />
          </div>
          <div>
            <h2 class="text-sm font-semibold">Subir archivo</h2>
            <p class="text-muted-foreground text-xs">Formatos aceptados: .xlsx, .xls</p>
          </div>
        </div>
      </div>
      <UiDivider class="px-6" />
      <div class="p-6 pt-5">
        <Motion :variants="fadeIn" initial="hidden" animate="visible" as-child>
          <div ref="dropzoneRef" role="button"
            class="border-input hover:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50 flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed p-6 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[input:focus]:ring-[3px]"
            @click="openFileDialog">
            <input ref="inputRef" hidden aria-label="Upload file" :disabled="Boolean(currentFile)" />

            <div class="flex flex-col items-center gap-3 text-center">
              <div class="bg-background flex size-12 items-center justify-center rounded-full border"
                aria-hidden="true">
                <Icon :name="currentFile ? 'lucide:file-spreadsheet' : 'lucide:upload'"
                  class="text-muted-foreground size-5" />
              </div>
              <div>
                <p class="text-sm font-medium">
                  {{ currentFile ? currentFile.file.name : 'Arrastra o haz clic para seleccionar' }}
                </p>
                <p v-if="!currentFile" class="text-muted-foreground mt-0.5 text-xs">
                  Tamaño máximo: {{ formatBytes(maxSize) }}
                </p>
              </div>
            </div>
          </div>
        </Motion>

        <Motion v-if="errors.length > 0" key="errors" :variants="slideUp" initial="hidden" animate="visible"
          class="text-destructive mt-3 flex items-center gap-1.5 text-xs" role="alert">
          <Icon name="lucide:circle-alert" class="size-3.5 shrink-0" />
          <span>{{ errors[0] }}</span>
        </Motion>
      </div>
    </div>

    <!-- File section -->
    <AnimatePresence>
      <Motion v-if="currentFile" key="file-section" :variants="slideUp" initial="hidden" animate="visible" exit="exit">
        <UiDivider label="Archivo cargado" class="my-8" />

        <div class="rounded-xl border bg-card">
          <div class="flex items-center justify-between gap-3 px-6 py-4">
            <div class="flex items-center gap-3 overflow-hidden">
              <div class="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
                <Icon name="lucide:file-spreadsheet" class="text-primary size-5" />
              </div>
              <div class="min-w-0">
                <p class="truncate text-sm font-medium">{{ currentFile.file.name }}</p>
                <p class="text-muted-foreground text-xs">
                  {{ formatBytes((currentFile.file as File).size || currentFile.file.size) }}
                </p>
              </div>
            </div>

            <UiButton size="icon" variant="ghost" class="text-muted-foreground/80 hover:text-foreground size-8 shrink-0"
              aria-label="Remove file" @click="removeFile(currentFile.id)">
              <Icon name="lucide:x" class="size-4" />
            </UiButton>
          </div>
          <UiDivider class="px-6" />
          <div class="px-6 py-4">
            <UiButton :loading="loading" @click="uploadFile">
              <Icon name="lucide:wand-sparkles" class="size-4" />
              Limpiar archivo
            </UiButton>
          </div>
        </div>
      </Motion>
    </AnimatePresence>

    <!-- Result section -->
    <AnimatePresence>
      <Motion v-if="resultUrl" key="result-section" :variants="slideUp" initial="hidden" animate="visible" exit="exit">
        <UiDivider label="Resultado" class="my-8" />

        <div class="rounded-xl border bg-card">
          <div class="flex items-center gap-3 px-6 py-4">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
              <Icon name="lucide:check-circle-2" class="size-5 text-emerald-500" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold">Archivo procesado correctamente</p>
              <p class="text-muted-foreground text-xs">El archivo limpio está listo para descargar.</p>
            </div>
            <UiButton as="a" :href="resultUrl" download variant="default" size="sm" class="shrink-0">
              <Icon name="lucide:download" class="size-4" />
              Descargar
            </UiButton>
          </div>
        </div>
      </Motion>
    </AnimatePresence>

    <!-- Error section -->
    <AnimatePresence>
      <Motion v-if="errorMsg" key="error-section" :variants="slideUp" initial="hidden" animate="visible" exit="exit">
        <UiDivider class="my-8" />

        <div class="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-4 text-sm">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
            <Icon name="lucide:alert-circle" class="size-5 text-destructive" />
          </div>
          <p class="text-destructive flex-1">{{ errorMsg }}</p>
          <UiButton variant="ghost" size="icon-sm" @click="errorMsg = undefined">
            <Icon name="lucide:x" class="size-4" />
          </UiButton>
        </div>
      </Motion>
    </AnimatePresence>
  </div>
</template>

<script lang="ts" setup>
import type { MotionProps } from "motion-v";
import { AnimatePresence } from "motion-v";

const maxSize = 10 * 1024 * 1024;

const { files, errors, openFileDialog, removeFile, inputRef, dropzoneRef } = useFileUpload({
  maxSize,
  accept: ".xlsx,.xls",
  multiple: false,
});

const currentFile = computed(() => files.value[0]);

const loading = ref(false);
const resultUrl = ref<string>();
const errorMsg = ref<string>();

async function uploadFile() {
  if (!currentFile.value || !(currentFile.value.file instanceof File)) return;

  loading.value = true;
  errorMsg.value = undefined;
  resultUrl.value = undefined;

  try {
    const form = new FormData();
    form.append("file", currentFile.value.file);

    const res = await $fetch("/api/limpiar-roles-turno", {
      method: "POST",
      body: form,
      responseType: "blob",
    });

    resultUrl.value = URL.createObjectURL(res as Blob);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    errorMsg.value = e?.data?.message || e?.message || "Error al procesar el archivo";
  } finally {
    loading.value = false;
  }
}

const fadeIn: MotionProps["variants"] = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

const slideUp: MotionProps["variants"] = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 18 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};
</script>
