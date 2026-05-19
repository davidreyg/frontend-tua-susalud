<script lang="ts" setup>
import { AnimatePresence, Motion } from 'motion-v'
import type { GenerarDataResponse } from '~/utils/api-types'
import { tuaService } from '~/services/tua.service'

const steps = [
  { step: 1, title: 'Subir archivo', description: 'Excel + hoja de cálculo' },
  { step: 2, title: 'Resultados', description: 'Registros generados' },
]

const currentStep = ref(1)
const loading = ref(false)
const response = ref<GenerarDataResponse | null>(null)
const errorMsg = ref<string>()

const tuaLoaded = computed(() => !!response.value)

watch(currentStep, (val, oldVal) => {
  if (val === 1 && oldVal === 2) {
    response.value = null
    errorMsg.value = undefined
  }
})

async function handleGenerate(file: File, sheet: string) {
  loading.value = true
  errorMsg.value = undefined

  try {
    response.value = await tuaService.generateData(file, sheet)
    currentStep.value = 2
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Error al procesar el archivo'
  } finally {
    loading.value = false
  }
}

function handleReset() {
  response.value = null
  errorMsg.value = undefined
  currentStep.value = 1
}
</script>

<template>
  <div>
    <AppPageHeader
      section="Gestionar TUA"
      title="Generar Data"
      description="Genera datos TUA desde un archivo Excel. Selecciona el archivo, indica la hoja y procesa los registros."
    />

    <!-- Stepper header -->
    <UiStepper v-model="currentStep" orientation="horizontal" class="w-full">
      <div class="flex w-full">
        <template v-for="{ step, title, description } in steps" :key="step">
          <UiStepperItem
            :step="step"
            :disabled="step === 2 && !tuaLoaded"
            class="relative flex-1 flex-col!"
          >
            <UiStepperTrigger class="flex-col gap-3 rounded pb-3">
              <UiStepperIndicator />
              <div class="space-y-0.5 px-2">
                <UiStepperTitle>{{ title }}</UiStepperTitle>
                <UiStepperDescription class="max-sm:hidden">
                  {{ description }}
                </UiStepperDescription>
              </div>
            </UiStepperTrigger>
            <UiStepperSeparator
              v-if="step < steps.length"
              class="absolute inset-x-0 top-3 left-[calc(50%+0.75rem+0.125rem)] -order-1 m-0 -translate-y-1/2"
            />
          </UiStepperItem>
        </template>
      </div>
    </UiStepper>

    <!-- Content panels -->
    <div class="mt-10 w-full">
      <AnimatePresence mode="wait">
        <Motion
          v-if="currentStep === 1"
          :key="'step-upload'"
          :initial="{ opacity: 0, y: 16 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0, y: -8 }"
          :transition="{ duration: 0.25 }"
        >
          <StepsGenerarDataStepUpload
            :loading="loading"
            :error="errorMsg"
            @generate="handleGenerate"
          />
        </Motion>

        <Motion
          v-else-if="currentStep === 2 && tuaLoaded"
          :key="'step-results'"
          :initial="{ opacity: 0, y: 16 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0, y: -8 }"
          :transition="{ duration: 0.25 }"
        >
          <StepsGenerarDataStepResults :data="response" @reset="handleReset" />
          <div class="mt-8 flex justify-center">
            <UiButton variant="outline" @click="handleReset">
              <Icon name="lucide:arrow-left" class="size-4" />
              Anterior
            </UiButton>
          </div>
        </Motion>
      </AnimatePresence>
    </div>

    <AnimatePresence mode="wait">
      <Motion
        v-if="errorMsg && currentStep === 1"
        :key="'error'"
        :initial="{ opacity: 0, y: 8 }"
        :animate="{ opacity: 1, y: 0 }"
        :exit="{ opacity: 0, y: -8 }"
        :transition="{ duration: 0.25 }"
        class="border-destructive/20 bg-destructive/5 mt-6 flex items-center gap-3 rounded-xl border px-6 py-4 text-sm"
        role="alert"
      >
        <div class="bg-destructive/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
          <Icon name="lucide:alert-circle" class="text-destructive size-5" />
        </div>
        <p class="text-destructive flex-1">{{ errorMsg }}</p>
      </Motion>
    </AnimatePresence>
  </div>
</template>
