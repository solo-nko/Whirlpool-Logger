<script setup lang="ts">
import useCategoriesStore from "@/stores/categories.ts";
import useSettingsStore from "@/stores/settings.ts";

const categoriesStore = useCategoriesStore();
const settingsStore = useSettingsStore();
const currentTab = ref();

watch(
	() => settingsStore.defaultTableCategory,
	(loadedDefault) => {
		if (loadedDefault && !currentTab.value) {
			currentTab.value = loadedDefault;
		}
	},
	{ immediate: true }
);
</script>

<template>
	<VContainer>
		<VRow class="justify-center">
			<VTabs v-model="currentTab">
				<VTab
					v-for="category in categoriesStore.clientCategories"
					:key="category.id"
					:value="category"
				>
					{{ category.name }}
				</VTab>
			</VTabs>
		</VRow>
	</VContainer>
</template>

<style scoped></style>
