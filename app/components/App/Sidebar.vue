<template>
  <aside class="h-screen w-[300px] border-r">
    <UiScrollArea class="size-full">
      <div class="flex h-screen flex-col pt-7">
        <NuxtLink to="/" class="flex w-full items-center gap-3 px-5">
          <UiAvatar src="/icon.png" alt="Company Logo" class="size-7 rounded object-contain" />
          <span class="text-xl font-bold">{{ COMPANY_NAME }}</span>
        </NuxtLink>

        <div class="my-6 px-5">
          <UiVeeInput v-model="search" placeholder="Buscar..." icon="lucide:search" />
        </div>

        <div class="flex h-full grow flex-col px-5 pb-8">
          <div class="mb-10 flex flex-col gap-10">
            <nav class="flex flex-col gap-1">
              <template v-for="(n, i) in topNav" :key="i">
                <UiButton v-if="!n.items" :to="n.link" size="default" variant="ghost"
                  class="nav-btn justify-start gap-4 px-3">
                  <Icon v-if="n.icon" :name="n.icon" class="text-muted-foreground size-4" />
                  <span>{{ n.title }}</span>
                </UiButton>
                <UiCollapsible v-if="n.items" :default-open="isTuaOpen">
                  <UiCollapsibleTrigger as-child>
                    <UiButton size="default" variant="ghost" class="group w-full justify-start gap-4 px-3">
                      <Icon v-if="n.icon" :name="n.icon" class="text-muted-foreground size-4" />
                      <span>{{ n.title }}</span>
                      <Icon name="lucide:chevron-down"
                        class="text-muted-foreground ml-auto size-4 transition group-data-[state=open]:rotate-180" />
                    </UiButton>
                  </UiCollapsibleTrigger>
                  <UiCollapsibleContent class="flex flex-col gap-1.5 pr-2 pl-4">
                    <template v-for="(item, index) in n.items" :key="index">
                      <UiButton :to="item.link" size="sm" variant="ghost" class="sub-btn justify-start gap-4 px-3">
                        <Icon v-if="item.icon" :name="item.icon" class="text-muted-foreground size-4" />
                        <span>{{ item.title }}</span>
                      </UiButton>
                    </template>
                  </UiCollapsibleContent>
                </UiCollapsible>
              </template>
            </nav>
            <nav class="mt-auto flex flex-col gap-1">
              <template v-for="(n, i) in bottomNav" :key="i">
                <UiButton v-if="!n.items" :to="n.link" size="default" variant="ghost"
                  class="nav-btn justify-start gap-4 px-3">
                  <Icon v-if="n.icon" :name="n.icon" class="text-muted-foreground size-4" />
                  <span>{{ n.title }}</span>
                </UiButton>
                <UiCollapsible v-if="n.items">
                  <UiCollapsibleTrigger as-child>
                    <UiButton size="default" variant="ghost" class="group w-full justify-start gap-4 px-3">
                      <Icon v-if="n.icon" :name="n.icon" class="text-muted-foreground size-4" />
                      <span>{{ n.title }}</span>
                      <Icon name="lucide:chevron-down"
                        class="text-muted-foreground ml-auto size-4 transition group-data-[state=open]:rotate-180" />
                    </UiButton>
                  </UiCollapsibleTrigger>
                  <UiCollapsibleContent class="flex flex-col gap-1.5 pr-2 pl-4">
                    <template v-for="(item, index) in n.items" :key="index">
                      <UiButton :to="item.link" size="sm" variant="ghost" class="sub-btn justify-start gap-4 px-3">
                        <Icon v-if="item.icon" :name="item.icon" class="text-muted-foreground size-4" />
                        <span>{{ item.title }}</span>
                      </UiButton>
                    </template>
                  </UiCollapsibleContent>
                </UiCollapsible>
              </template>
            </nav>
          </div>

          <div class="bg-muted/50 mt-auto rounded-lg p-4 text-sm">
            <div class="flex items-center justify-between">
              <p class="font-semibold">Used space</p>
              <UiButton class="size-6" size="icon-sm" variant="ghost">
                <Icon name="lucide:x" class="text-muted-foreground size-4" />
              </UiButton>
            </div>
            <p class="text-muted-foreground mt-3">
              Your team has used 80% of your available space. Need more?
            </p>
            <UiProgress class="my-4 h-2" :model-value="80" />

            <div class="flex items-center gap-1">
              <UiButton class="px-2" variant="ghost" size="sm">Dismiss</UiButton>
              <UiButton class="px-2 text-sky-500 hover:text-sky-600" variant="ghost" size="sm">Upgrade plan</UiButton>
            </div>
          </div>

          <UiDivider class="my-6" />

          <div class="flex items-center gap-3 pb-8">
            <div class="flex items-center gap-3">
              <UiAvatar :src="user.avatar" class="size-10" />
              <div>
                <p class="text-sm font-semibold" v-html="user.username" />
                <p class="text-muted-foreground text-sm" v-html="user.email" />
              </div>
            </div>
            <UiTooltip>
              <UiTooltipTrigger as-child>
                <UiButton class="ml-auto shrink-0" size="icon-sm" variant="ghost">
                  <Icon name="lucide:log-out" class="text-muted-foreground size-4" />
                </UiButton>
              </UiTooltipTrigger>
              <UiTooltipContent side="right" align="center">Cerrar sesión</UiTooltipContent>
            </UiTooltip>
          </div>
        </div>
      </div>
    </UiScrollArea>
  </aside>
</template>

<script lang="ts" setup>
const route = useRoute();
const search = ref("");

const user = {
  avatar: "https://randomuser.me/api/portraits/med/men/2.jpg",
  username: "Jane Doe",
  email: "muzcad@he.tg",
};

interface NavItem {
  title: string;
  icon?: string;
  link?: string;
  items?: { title: string; link: string; icon?: string }[];
}

const topNav: NavItem[] = [
  { title: "Inicio", icon: "lucide:home", link: "/" },
  {
    title: "Gestionar TUA",
    icon: "lucide:clipboard-check",
    items: [
      { title: "Limpiar Roles de turno", link: "/gestionar-tua/limpiar-roles-turno", icon: "lucide:sparkles" },
      { title: "Generar Data", link: "/gestionar-tua/generar-data", icon: "lucide:database" },
    ],
  },
];

const bottomNav: NavItem[] = [];

const isTuaOpen = computed(() => route.path.startsWith("/gestionar-tua"));
</script>

<style scoped>
.nav-btn:deep(.router-link-exact-active),
.sub-btn:deep(.router-link-active) {
  background-color: color-mix(in oklch, var(--accent) 80%, transparent);
  color: var(--primary);
  font-weight: 600;
}

.sub-btn:deep(.router-link-active)::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  translate: 0 -50%;
  width: 3px;
  height: 14px;
  border-radius: 0 3px 3px 0;
  background-color: var(--primary);
}
</style>
