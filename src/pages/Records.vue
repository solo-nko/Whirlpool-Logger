<script setup lang="ts">
import useCategoriesStore from "@/stores/categories.ts";
import useSettingsStore from "@/stores/settings.ts";
import WhirlpoolTable from "@/components/WhirlpoolTable.vue";

const categoriesStore = useCategoriesStore();
const settingsStore = useSettingsStore();
const currentTab = ref();

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
		<VRow>
			<VCol>
				<VCard>
					<VTabsWindow v-model="currentTab">
						<VTabsWindowItem
							v-for="category in categoriesStore.clientCategories"
							:key="category.id"
							:value="category"
						>
							<WhirlpoolTable :category-id="category.id" />
						</VTabsWindowItem>
					</VTabsWindow>
				</VCard>
			</VCol>
		</VRow>
	</VContainer>
</template>

<style scoped></style>
