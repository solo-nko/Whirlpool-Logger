<script setup lang="ts">
import type { IDashboard } from "@/utils/types/IDashboard.ts";
import useWhirlpoolStore from "@/stores/whirlpools.ts";
import type { WhirlpoolLog } from "@/utils/types/WhirlpoolLog.ts";
import useCategoriesStore from "@/stores/categories.ts";

type CategoryDashboardProps = {
	dashboard: IDashboard;
};

const whirlpoolStore = useWhirlpoolStore();
const categoriesStore = useCategoriesStore();
const { dashboard } = defineProps<CategoryDashboardProps>();
const emits = defineEmits(["edit-whirlpoool"]);

const statusOneWhirlpools = computed(() =>
	whirlpoolStore.clientWhirlpools.filter(
		(whirlpool) =>
			whirlpool.category.id === dashboard.categoryId &&
			whirlpool.status?.id === dashboard.selectedStatusOne.id
	)
);

const statusTwoWhirlpools = computed(() =>
	whirlpoolStore.clientWhirlpools.filter(
		(whirlpool) =>
			whirlpool.category.id === dashboard.categoryId &&
			whirlpool.status?.id === dashboard.selectedStatusTwo.id
	)
);

const onEditClick = (editingWhirlpool: WhirlpoolLog) => {
	const getCategory = categoriesStore.clientCategories.find(
		(category) => category.id === dashboard.categoryId
	);
	if (getCategory) emits("edit-whirlpoool", { whirlpool: editingWhirlpool, category: getCategory });
	// TODO: else, float toast that category couldn't be found
};
</script>

<template>
	<VCard>
		<VCardTitle>{{ dashboard.categoryName }}</VCardTitle>
		<VCardSubtitle>{{ dashboard.selectedStatusOne.name }}</VCardSubtitle>
		<VList>
			<VListItem v-for="item in statusOneWhirlpools" :key="item.id">
				<div class="flex items-center justify-between">
					<p class="m-0">{{ item.title }}</p>
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
				<div class="flex items-center justify-between">
					<p class="m-0">{{ item.title }}</p>
					<VBtn icon="$edit" variant="text" @click="onEditClick(item)" />
				</div>
			</VListItem>
		</VList>
	</VCard>
</template>

<style scoped></style>
