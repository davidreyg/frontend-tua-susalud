<script lang="ts" setup>
import type { MotionProps } from 'motion-v'
import { AnimatePresence } from 'motion-v'
import { tuaService } from '~/services/tua.service'

const maxSize = 10 * 1024 * 1024

const { files, errors, openFileDialog, clearFiles, inputRef, dropzoneRef } = useFileUpload({
  maxSize,
  accept: '.xlsx,.xls',
  multiple: false,
})

const currentFile = computed(() => files.value[0])

const loading = ref(false)
const resultUrl = ref<string>()
const downloadName = ref('')
const errorMsg = ref<string>()

function revokeResultUrl() {
  if (resultUrl.value) URL.revokeObjectURL(resultUrl.value)
  resultUrl.value = undefined
}

async function uploadFile() {
  if (!currentFile.value || !(currentFile.value.file instanceof File)) return

  loading.value = true
  errorMsg.value = undefined

  try {
    const archivo = await tuaService.cleanRolesTurno(currentFile.value.file)

    revokeResultUrl()
    const fecha = new Date().toISOString().slice(0, 10)
    const nombre = currentFile.value.file.name.replace(/\.(xlsx|xls)$/i, `_limpio_${fecha}.$1`)
    downloadName.value = nombre
    resultUrl.value = URL.createObjectURL(archivo)
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Error al procesar el archivo'
  } finally {
    loading.value = false
  }
}

watch(currentFile, (file, prev) => {
  if (file && file !== prev) {
    revokeResultUrl()
    errorMsg.value = undefined
    uploadFile()
  }
})

function resetAll() {
  revokeResultUrl()
  downloadName.value = ''
  errorMsg.value = undefined
  clearFiles()
}

onUnmounted(revokeResultUrl)

const fadeIn: MotionProps['variants'] = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
}

const slideUp: MotionProps['variants'] = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 18 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
}
</script>

<template>
  <div>
    <AppPageHeader
      section="Gestionar TUA"
      title="Limpiar Roles de turno"
      description="Sube un archivo Excel con los roles de turno y se procesará automáticamente."
    />

    <!-- Upload section -->
    <div class="bg-card rounded-xl border">
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
          <div
            ref="dropzoneRef"
            role="button"
            class="border-input hover:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50 flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed p-6 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[input:focus]:ring-[3px]"
            @click="openFileDialog"
          >
            <input ref="inputRef" hidden aria-label="Upload file" />

            <div class="flex flex-col items-center gap-3 text-center">
              <div
                class="bg-background flex size-12 items-center justify-center rounded-full border"
                aria-hidden="true"
              >
                <Icon
                  v-if="loading"
                  name="lucide:loader-circle"
                  class="text-muted-foreground size-5 animate-spin"
                />
                <Icon
                  v-else-if="resultUrl"
                  name="lucide:check-circle-2"
                  class="size-5 text-emerald-500"
                />
                <Icon v-else name="lucide:upload" class="text-muted-foreground size-5" />
              </div>
              <div>
                <p class="text-sm font-medium">
                  {{
                    loading
                      ? 'Procesando…'
                      : currentFile
                        ? currentFile.file.name
                        : 'Arrastra o haz clic para seleccionar'
                  }}
                </p>
                <p v-if="!currentFile" class="text-muted-foreground mt-0.5 text-xs">
                  Tamaño máximo: {{ formatBytes(maxSize) }}
                </p>
                <p v-else-if="resultUrl" class="mt-0.5 text-xs text-emerald-600">
                  Listo para descargar
                </p>
                <p v-else-if="errorMsg" class="text-destructive mt-0.5 text-xs">
                  {{ errorMsg }}
                </p>
              </div>
            </div>
          </div>
        </Motion>

        <Motion
          v-if="errors.length > 0"
          key="errors"
          :variants="slideUp"
          initial="hidden"
          animate="visible"
          class="text-destructive mt-3 flex items-center gap-1.5 text-xs"
          role="alert"
        >
          <Icon name="lucide:circle-alert" class="size-3.5 shrink-0" />
          <span>{{ errors[0] }}</span>
        </Motion>
      </div>
    </div>

    <!-- Result section -->
    <AnimatePresence>
      <Motion
        v-if="resultUrl"
        key="result-section"
        :variants="slideUp"
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <UiDivider label="Resultado" class="my-8" />

        <div class="bg-card rounded-xl border">
          <div class="flex items-center gap-3 px-6 py-4">
            <div
              class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10"
            >
              <Icon name="lucide:check-circle-2" class="size-5 text-emerald-500" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold">Archivo procesado correctamente</p>
              <p class="text-muted-foreground text-xs">
                El archivo limpio está listo para descargar.
              </p>
            </div>
            <UiButton
              as="a"
              :href="resultUrl"
              :download="downloadName"
              variant="default"
              size="sm"
              class="shrink-0"
            >
              <Icon name="lucide:download" class="size-4" />
              Descargar
            </UiButton>
            <UiButton variant="outline" size="icon-sm" @click="resetAll">
              <Icon name="lucide:refresh-cw" class="size-4" />
            </UiButton>
          </div>
        </div>
      </Motion>
    </AnimatePresence>
  </div>
</template>
