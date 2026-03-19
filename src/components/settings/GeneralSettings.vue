<script setup lang="ts">
import useCategoriesStore from "@/stores/categories.ts";
import useSettingsStore from "@/stores/settings.ts";
import type { Category } from "@/utils/types/Category.ts";

const settingsStore = useSettingsStore();
const categoryStore = useCategoriesStore();
const entryCategories = ref<Category[]>([]);
const tableCategories = ref<Category[]>([]);

watch(
	() => categoryStore.clientCategories,
	(loadedCategories) => {
		if (loadedCategories.length > 0) {
			if (entryCategories.value.length === 0) entryCategories.value.push(...loadedCategories);
			if (tableCategories.value.length === 0) tableCategories.value.push(...loadedCategories);
		}
	},
	{ immediate: true }
);

const sendToEntryStoreFunction = (input: Category | null) => {
	if (input !== null) settingsStore.SetDefaultEntryToLocalStorage(input);
};
const sendToTableStoreFunction = (input: Category | null) => {
	if (input !== null) settingsStore.SetDefaultTableToLocalStorage(input);
};
</script>

<template>
	<h2>Display Defaults</h2>
	<VRow>
		<VCol>
			<VRadioGroup
				v-model="settingsStore.defaultEntryCategory"
				label="Default Entry Category"
				@update:model-value="sendToEntryStoreFunction"
			>
				<VRadio
					v-for="category in entryCategories"
					:key="category.id"
					:label="category.name"
					:value="category"
				/>
			</VRadioGroup>
		</VCol>
		<VCol>
			<VRadioGroup
				v-model="settingsStore.defaultTableCategory"
				label="Default Table Category"
				@update:model-value="sendToTableStoreFunction"
			>
				<VRadio
					v-for="category in tableCategories"
					:key="category.id"
					:label="category.name"
					:value="category"
				/>
			</VRadioGroup>
		</VCol>
	</VRow>
</template>

<style scoped></style>
