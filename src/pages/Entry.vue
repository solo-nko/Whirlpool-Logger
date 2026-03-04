<script setup lang="ts">
import EntryForm from "@/components/EntryForm.vue";
import useCategoriesStore from "@/stores/categories.ts";
const categoriesStore = useCategoriesStore();
const currentTab = ref();
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
