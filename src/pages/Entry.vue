<script setup lang="ts">
import EntryForm from "@/components/EntryForm.vue";
import useCategoriesStore from "@/stores/categories.ts";
import useSettingsStore from "@/stores/settings.ts";
const categoriesStore = useCategoriesStore();
const settingsStore = useSettingsStore();
const currentTab = ref();

watch(
	() => settingsStore.defaultEntryCategory,
	(loadedDefault) => {
		if (loadedDefault && categoriesStore.clientCategories.length > 0 && !currentTab.value) {
			currentTab.value =
				categoriesStore.clientCategories.find((category) => category.id === loadedDefault) ??
				categoriesStore.clientCategories[0];
		}
	},
	{ immediate: true }
);
</script>

<template>
	<VContainer>
		<VRow justify="center">
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
		<VRow>
			<VCol>
				<VTabsWindow v-model="currentTab">
					<VTabsWindowItem
						v-for="category in categoriesStore.clientCategories"
						:key="category.id"
						:value="category"
					>
						<EntryForm :category="category" />
					</VTabsWindowItem>
				</VTabsWindow>
			</VCol>
		</VRow>
	</VContainer>
</template>

<style scoped></style>
