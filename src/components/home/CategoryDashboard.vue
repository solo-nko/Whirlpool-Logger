<script setup lang="ts">
import type { IDashboard } from "@/utils/types/IDashboard.ts";
import useWhirlpoolStore from "@/stores/whirlpools.ts";
import type { WhirlpoolLog } from "@/utils/types/WhirlpoolLog.ts";
import useCategoriesStore from "@/stores/categories.ts";
import useSettingsStore from "@/stores/settings.ts";

type CategoryDashboardProps = {
	dashboard: IDashboard;
};

const whirlpoolStore = useWhirlpoolStore();
const categoriesStore = useCategoriesStore();
const settingsStore = useSettingsStore();
const { dashboard } = defineProps<CategoryDashboardProps>();
const emits = defineEmits(["edit-whirlpool"]);

const statusOneWhirlpools = computed(() =>
	whirlpoolStore.clientWhirlpools.filter(
		(whirlpool) =>
			whirlpool.categoryId === dashboard.categoryId &&
			whirlpool.status?.id === dashboard.selectedStatusOne.id &&
			whirlpool.deletedOn === null
	)
);

const statusTwoWhirlpools = computed(() =>
	whirlpoolStore.clientWhirlpools.filter(
		(whirlpool) =>
			whirlpool.categoryId === dashboard.categoryId &&
			whirlpool.status?.id === dashboard.selectedStatusTwo.id &&
			whirlpool.deletedOn === null
	)
);

const onEditClick = (editingWhirlpool: WhirlpoolLog) => {
	const getCategory = categoriesStore.clientCategories.find(
		(category) => category.id === dashboard.categoryId
	);
	if (getCategory) emits("edit-whirlpool", { whirlpool: editingWhirlpool, category: getCategory });
	else settingsStore.DisplayToast("There was an issue opening this whirlpool.");
};
</script>

<template>
	<VCard class="min-w-50">
		<VCardTitle>{{ dashboard.categoryName }}</VCardTitle>
		<VCardSubtitle>{{ dashboard.selectedStatusOne.name }}</VCardSubtitle>
		<VList>
			<VListItem v-for="item in statusOneWhirlpools" :key="item.id">
				<div class="flex flex-nowrap items-center justify-between">
					<p class="m-0 font-bold">{{ item.title }}</p>
					<VBtn icon="$edit" variant="text" @click="onEditClick(item)" />
				</div>
			</VListItem>
		</VList>
		<VDivider v-if="statusTwoWhirlpools.length > 0" />
		<VCardSubtitle v-if="statusTwoWhirlpools.length > 0">{{
			dashboard.selectedStatusTwo.name
		}}</VCardSubtitle>
		<VList v-if="statusTwoWhirlpools.length > 0">
			<VListItem v-for="item in statusTwoWhirlpools" :key="item.id">
				<div class="flex flex-nowrap items-center justify-between">
					<p class="m-0 font-bold">{{ item.title }}</p>
					<VBtn icon="$edit" variant="text" @click="onEditClick(item)" />
				</div>
			</VListItem>
		</VList>
	</VCard>
</template>

<style scoped></style>
