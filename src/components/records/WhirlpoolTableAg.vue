<script setup lang="ts">
import { AgGridVue } from "ag-grid-vue3";
import { AllCommunityModule, type ColDef, ModuleRegistry, themeQuartz } from "ag-grid-community";
import useCategoriesStore from "@/stores/categories.ts";
import useWhirlpoolStore from "@/stores/whirlpools.ts";
import type { WhirlpoolLog } from "@/utils/types/WhirlpoolLog.ts";
import ActionCell from "@/components/records/ActionCell.vue";
import { useTheme } from "vuetify";

const theme = useTheme();

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

function OnClickEdit(rowData: WhirlpoolLog) {
	console.log(rowData);
}

function OnClickDelete(rowData: WhirlpoolLog) {
	console.log(rowData);
}

const columnDefinitions = ref<ColDef<WhirlpoolLog>[]>([
	{ field: "title" },
	{ field: "status", valueGetter: (params) => params.data?.status?.name ?? "No status" },
	{ field: "rating" },
	{
		headerName: "Actions",
		sortable: false,
		resizable: false,
		cellRenderer: ActionCell,
		valueGetter: (params) => params.data,
		cellRendererParams: {
			onEdit: OnClickEdit,
			onDelete: OnClickDelete
		}
	}
]);
</script>
<template>
	<AgGridVue
		:column-defs="columnDefinitions"
		:row-data="validTableItems"
		style="height: 500px; background-color: gray"
	/>
</template>
