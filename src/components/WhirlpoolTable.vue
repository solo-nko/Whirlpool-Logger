<script setup lang="ts">
import useWhirlpoolStore from "@/stores/whirlpools.ts";
import type { WhirlpoolLog } from "@/utils/types/WhirlpoolLog.ts";

type HeaderItem = {
	title: string;
	value: string;
	key?: string;
	sortable?: boolean;
	sortRaw?: (a: WhirlpoolLog, b: WhirlpoolLog) => number;
};

type WhirlPoolTableProps = {
	categoryId: string;
};

const { categoryId } = defineProps<WhirlPoolTableProps>();

const whirlpoolsStore = useWhirlpoolStore();
const tableItems = computed(() => {
	return whirlpoolsStore.clientWhirlpools.filter(
		(whirlpool) => whirlpool.categoryId === categoryId
	);
});
const tableHeaders = ref<HeaderItem[]>([
	{ title: "Title", value: "title", sortable: true },
	{ title: "Actions", value: "actions", key: "actions", sortable: false }
]);
</script>

<template>
	<VDataTable :headers="tableHeaders" :items="tableItems"></VDataTable>
</template>

<style scoped></style>
