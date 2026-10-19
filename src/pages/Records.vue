<script setup lang="ts">
import useCategoriesStore from "@/stores/categories.ts";
import useSettingsStore from "@/stores/settings.ts";
import type { Category } from "@/utils/types/Category.ts";

const AsyncWhirlpoolTableAg = defineAsyncComponent(
	() => import("@/components/records/WhirlpoolTableAg.vue")
);

const categoriesStore = useCategoriesStore();
const settingsStore = useSettingsStore();
const currentTab = ref<Category>();

watch(
	() => settingsStore.defaultTableCategory,
	(loadedDefault) => {
		if (loadedDefault && categoriesStore.clientCategories.length > 0 && !currentTab.value) {
			currentTab.value =
				categoriesStore.clientCategories.find((category) => category.id === loadedDefault) ??
				categoriesStore.clientCategories[0];
		}
	},
	{ immediate: true }
);

// // if a tab is unselected, and defaultCategory isn't set, set the tab to the first category
// watch(
// 	() => categoriesStore.clientCategories,
// 	(loadedCategories) => {
// 		if (!currentTab.value && !settingsStore.defaultTableCategory && loadedCategories.length > 0) {
// 			currentTab.value = loadedCategories[0];
// 		}
// 	}
// );
</script>

<template>
	<VContainer>
		<VRow class="justify-center">
			<VTabs v-model="currentTab" mandatory>
				<VTab
					v-for="category in categoriesStore.clientCategories"
					:key="category.id"
					:value="category"
				>
					{{ category.name }}
				</VTab>
			</VTabs>
		</VRow>
		<VRow>
			<VCol>
				<VCard>
					<VTabsWindow v-model="currentTab">
						<VTabsWindowItem
							v-for="category in categoriesStore.clientCategories"
							:key="category.id"
							:value="category"
						>
							<AsyncWhirlpoolTableAg :category-id="category.id" />
						</VTabsWindowItem>
					</VTabsWindow>
				</VCard>
			</VCol>
		</VRow>
	</VContainer>
</template>

<style scoped></style>
