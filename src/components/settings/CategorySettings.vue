<script setup lang="ts">
import useCategoriesStore from "@/stores/categories.ts";
import CategoryEditor from "@/components/CategoryEditor.vue";

const categoryStore = useCategoriesStore();
const settingCategoryId = ref<string>();
const settingCategory = computed(() => {
	return categoryStore.clientCategories.find((category) => category.id === settingCategoryId.value);
});
</script>

<template>
	<h1>Category Settings</h1>
	<VSelect
		v-model="settingCategoryId"
		label="Category"
		:items="categoryStore.clientCategories ?? []"
		item-title="name"
		item-value="id"
	/>
	<CategoryEditor v-if="settingCategory" :category="settingCategory" />
</template>

<style scoped></style>
