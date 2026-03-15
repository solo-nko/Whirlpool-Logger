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

const whirlpoolsStore = useWhirlpoolStore();
const tableHeaders = ref<HeaderItem[]>([
	{ title: "Title", value: "title", sortable: true },
	{ title: "Actions", value: "actions", key: "actions", sortable: false }
]);
</script>

<template>
	<VDataTable :headers="tableHeaders" :items="whirlpoolsStore.clientWhirlpools"></VDataTable>
</template>

<style scoped></style>
