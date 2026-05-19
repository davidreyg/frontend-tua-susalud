<script lang="ts" setup>
import type { MotionProps } from 'motion-v'
import { AnimatePresence, LayoutGroup } from 'motion-v'
import { tuaService } from '~/services/tua.service'

const maxSize = 10 * 1024 * 1024

const { files, errors, openFileDialog, removeFile, clearFiles, inputRef, dropzoneRef } =
  useFileUpload({
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
    downloadName.value = ''
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

const sequenceContainer: MotionProps['variants'] = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.4, when: 'beforeChildren' },
  },
}

const dropAreaContainer: MotionProps['variants'] = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { staggerChildren: 0.1, when: 'beforeChildren' },
  },
}

const dropAreaItem: MotionProps['variants'] = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100 },
  },
}

const listItem: MotionProps['variants'] = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 80, damping: 15 },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.2, ease: 'easeInOut' },
  },
}
</script>

<template>
  <div>
    <AppPageHeader
      section="Gestionar TUA"
      title="Limpiar Roles de turno"
      description="Sube un archivo Excel con los roles de turno y se procesará automáticamente."
    />

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
        <LayoutGroup>
          <Motion
            :variants="sequenceContainer"
            initial="hidden"
            animate="visible"
            exit="exit"
            layout="position"
            class="mx-auto flex max-w-md flex-col gap-2"
          >
            <!-- Drop area -->
            <Motion as-child :variants="dropAreaContainer">
              <div
                ref="dropzoneRef"
                role="button"
                class="border-input hover:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[input:focus]:ring-[3px]"
                @click="openFileDialog"
              >
                <input ref="inputRef" hidden aria-label="Upload file" />

                <div class="flex flex-col items-center justify-center text-center">
                  <Motion
                    :variants="dropAreaItem"
                    class="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                    aria-hidden="true"
                  >
                    <Icon
                      v-if="loading"
                      name="lucide:loader-circle"
                      class="size-4 animate-spin opacity-60"
                    />
                    <Icon v-else name="lucide:upload" class="size-4 opacity-60" />
                  </Motion>
                  <Motion as="p" :variants="dropAreaItem" class="mb-1 text-sm font-medium">
                    {{ loading ? 'Procesando…' : 'Subir archivo' }}
                  </Motion>
                  <Motion as="p" :variants="dropAreaItem" class="text-muted-foreground text-xs">
                    Arrastra o haz clic (máx. {{ formatBytes(maxSize) }})
                  </Motion>
                  <AnimatePresence>
                    <Motion
                      v-if="currentFile && !loading"
                      key="message"
                      layout="position"
                      :variants="dropAreaItem"
                      as="p"
                      class="mt-1 text-center text-xs text-sky-500"
                    >
                      Elimina el archivo actual para subir otro.
                    </Motion>
                  </AnimatePresence>
                </div>
              </div>
            </Motion>

            <!-- Validation errors -->
            <Motion
              v-if="errors.length > 0"
              key="errors"
              layout="position"
              :variants="listItem"
              initial="hidden"
              animate="visible"
              class="text-destructive flex items-center gap-1 text-xs"
              role="alert"
            >
              <Icon name="lucide:circle-alert" class="size-3 shrink-0" />
              <span>{{ errors[0] }}</span>
            </Motion>

            <!-- Upload error message -->
            <Motion
              v-if="errorMsg"
              key="upload-error"
              layout="position"
              :variants="listItem"
              initial="hidden"
              animate="visible"
              class="text-destructive flex items-center gap-1 text-xs"
              role="alert"
            >
              <Icon name="lucide:circle-alert" class="size-3 shrink-0" />
              <span>{{ errorMsg }}</span>
            </Motion>

            <!-- File list -->
            <Motion
              v-if="currentFile"
              key="file-list"
              layout="position"
              :variants="listItem"
              initial="hidden"
              animate="visible"
              class="space-y-2"
            >
              <div class="flex items-center justify-between gap-2 rounded-lg border px-4 py-2">
                <div class="flex items-center gap-3 overflow-hidden">
                  <Icon
                    name="lucide:file-spreadsheet"
                    class="size-4 shrink-0 opacity-60"
                    aria-hidden="true"
                  />
                  <div class="min-w-0">
                    <p class="truncate text-[13px] font-medium">
                      {{ currentFile.file.name }}
                    </p>
                  </div>
                </div>

                <UiButton
                  size="icon"
                  variant="ghost"
                  class="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent"
                  aria-label="Remove file"
                  @click="removeFile(currentFile.id)"
                >
                  <Icon name="lucide:x" class="size-4" aria-hidden="true" />
                </UiButton>
              </div>
            </Motion>
          </Motion>
        </LayoutGroup>
      </div>
    </div>

    <!-- Result section -->
    <AnimatePresence>
      <Motion
        v-if="resultUrl"
        key="result-section"
        :variants="listItem"
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
