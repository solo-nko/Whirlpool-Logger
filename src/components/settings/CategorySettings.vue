<script setup lang="ts">
import useCategoriesStore from "@/stores/categories.ts";
import CategoryEditor from "@/components/CategoryEditor.vue";

const categoryStore = useCategoriesStore();
const settingCategoryId = ref<string>();
const settingCategory = computed(() => {
	if (settingCategoryId.value !== undefined)
		return categoryStore.clientCategories.find(
			(category) => category.id === settingCategoryId.value
		);
	else if (categoryStore.clientCategories.length > 0) {
		const firstCategory = categoryStore.clientCategories[0];
		settingCategoryId.value = firstCategory?.id;
		return categoryStore.clientCategories[0];
	} else return undefined;
});
</script>

<template>
	<VContainer>
		<h2>Category Settings</h2>
		<VSelect
			v-if="categoryStore.clientCategories.length > 0"
			v-model="settingCategoryId"
			label="Select Category"
			:items="categoryStore.clientCategories ?? []"
			item-title="name"
			item-value="id"
		/>
		<CategoryEditor v-if="settingCategory" :category="settingCategory" />
	</VContainer>
</template>

<style scoped></style>
