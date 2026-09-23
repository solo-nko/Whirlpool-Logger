<script setup lang="ts">
import { AgGridVue } from "ag-grid-vue3";
import { AllCommunityModule, type ColDef, ModuleRegistry } from "ag-grid-community";
import useCategoriesStore from "@/stores/categories.ts";
import useWhirlpoolStore from "@/stores/whirlpools.ts";
import type { WhirlpoolLog } from "@/utils/types/WhirlpoolLog.ts";

type WhirlPoolTableProps = {
	categoryId: string;
};

ModuleRegistry.registerModules([AllCommunityModule]);

const { categoryId } = defineProps<WhirlPoolTableProps>();

const categoryStore = useCategoriesStore();
const whirlpoolStore = useWhirlpoolStore();
const validTableItems = computed(() => {
	return whirlpoolStore.clientWhirlpools.filter(
		(whirlpool) => whirlpool.categoryId === categoryId && whirlpool.deletedOn === null
	);
});

const columnDefinitions = ref<ColDef<WhirlpoolLog>[]>([
	{ field: "title" },
	{ field: "status", valueGetter: (params) => params.data?.status?.name ?? "No status" },
	{ field: "rating" }
]);
</script>
<template>
	<AgGridVue :column-defs="columnDefinitions" :row-data="validTableItems" style="height: 500px" />
</template>
