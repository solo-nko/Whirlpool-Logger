<script setup lang="ts">
import useCategoriesStore from "@/stores/categories.ts";
import useSettingsStore from "@/stores/settings.ts";

const settingsStore = useSettingsStore();
const categoryStore = useCategoriesStore();
const categories = categoryStore.clientCategories;
</script>

<template>
	<VRadioGroup label="Default Entry Category"> </VRadioGroup>
	<VRadioGroup v-model="settingsStore.defaultTableCategory" label="Default Table Category">
		<p>Which category would you like to be displayed by default on the Records page?</p>
		<VRadio
			v-for="category in categories"
			:key="category.id"
			:label="category.name"
			:value="category"
		/>
	</VRadioGroup>
</template>

<style scoped></style>
