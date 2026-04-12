<script setup lang="ts">
import useSettingsStore from "@/stores/settings.ts";
import CategoryDashboard from "@/components/CategoryDashboard.vue";
import { WhirlpoolLog } from "@/utils/types/WhirlpoolLog.ts";
import type { Category } from "@/utils/types/Category.ts";
import ConfirmCard from "@/components/ConfirmCard.vue";
import EntryForm from "@/components/EntryForm.vue";
const settingsStore = useSettingsStore();

const isEditModalOpen = ref(false);
const modalEntry = ref<WhirlpoolLog>();
const modalCategory = ref<Category>();

const openEditModal = (params: { whirlpool: WhirlpoolLog; category: Category }) => {
	modalEntry.value = params.whirlpool;
	modalCategory.value = params.category;
	isEditModalOpen.value = true;
};

const closeEditModal = () => {
	isEditModalOpen.value = false;
};
</script>

<template>
	<VContainer>
		<div>This is the dashboard!</div>
		<VRow>
			<VCol v-for="(dash, index) in settingsStore.displayedDashboards" :key="index">
				<CategoryDashboard :dashboard="dash" @edit-whirlpoool="openEditModal" />
			</VCol>
		</VRow>
	</VContainer>
	<VDialog
		v-if="modalCategory"
		v-model="isEditModalOpen"
		persistent
		scrollable
		:fullscreen="settingsStore.display.mobile"
	>
		<EntryForm :category="modalCategory" :existing-entry="modalEntry" @close="closeEditModal" />
	</VDialog>
</template>
