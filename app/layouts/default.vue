<template>
  <div class="flex h-screen overflow-hidden">
    <AppSidebar />
    <main class="flex flex-1 flex-col overflow-auto pt-16 transition-all duration-300 lg:pt-0">
      <div class="w-full flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <NuxtPage v-slot="{ Component, route }">
          <TransitionSlide mode="out-in" appear :delay="250">
            <div :key="route.fullPath">
              <component :is="Component" />
            </div>
          </TransitionSlide>
        </NuxtPage>
      </div>
    </main>
  </div>
</template>
