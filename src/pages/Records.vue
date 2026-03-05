<script setup lang="ts">
import useCategoriesStore from "@/stores/categories.ts";

const categoriesStore = useCategoriesStore();
const currentTab = ref(categoriesStore.clientCategories[0]);
</script>

<template>
	<VContainer>
		<VRow class="justify-center">
			<VTabs v-model="currentTab">
				<VTab v-for="category in categoriesStore.clientCategories" :key="category.id">
					{{ category.name }}
				</VTab>
			</VTabs>
		</VRow>
	</VContainer>
</template>

<style scoped></style>
