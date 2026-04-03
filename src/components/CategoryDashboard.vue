<script setup lang="ts">
import type { IDashboard } from "@/utils/types/IDashboard.ts";
import useWhirlpoolStore from "@/stores/whirlpools.ts";

type CategoryDashboardProps = {
	dashboard: IDashboard;
};

const whirlpoolStore = useWhirlpoolStore();
const { dashboard } = defineProps<CategoryDashboardProps>();

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
</script>

<template>
	<VCard>
		<VCardTitle>{{ dashboard.categoryName }}</VCardTitle>
		<VCardSubtitle>{{ dashboard.selectedStatusOne.name }}</VCardSubtitle>
		<VList>
			<VListItem v-for="item in statusOneWhirlpools" :key="item.id">
				{{ item.title }}
			</VListItem>
		</VList>
		<VDivider v-if="statusTwoWhirlpools.length > 0" />
		<VCardSubtitle v-if="statusTwoWhirlpools.length > 0">{{
			dashboard.selectedStatusTwo.name
		}}</VCardSubtitle>
		<VList v-if="statusTwoWhirlpools.length > 0">
			<VListItem v-for="item in statusTwoWhirlpools" :key="item.id">{{ item.title }}</VListItem>
		</VList>
	</VCard>
</template>

<style scoped></style>
