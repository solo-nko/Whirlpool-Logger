<script setup lang="ts">
import { AgGridVue } from "ag-grid-vue3";
import {
	AllCommunityModule,
	type ColDef,
	type GridOptions,
	ModuleRegistry,
	themeQuartz
} from "ag-grid-community";
import { useDisplay, useTheme } from "vuetify";
import useCategoriesStore from "@/stores/categories.ts";
import useWhirlpoolStore from "@/stores/whirlpools.ts";
import type { WhirlpoolLog } from "@/utils/types/WhirlpoolLog.ts";
import ActionCell from "@/components/records/ActionCell.vue";

const appTheme = useTheme();
const display = useDisplay();

const fontSize = computed(() => (display.mobile.value ? "2rem" : "1rem"));

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
	{ field: "title", flex: 1, filter: "agTextColumnFilter" },
	{
		field: "status",
		valueGetter: (params) => params.data?.status?.name ?? "No status",
		filter: "agTextColumnFilter",
		width: 200
	},
	{
		headerName: "Rating",
		valueGetter: (params) => params.data?.rating ?? "No rating",
		filter: "agNumberColumnFilter",
		width: 100
	},
	{
		headerName: "Actions",
		sortable: false,
		resizable: false,
		cellRenderer: ActionCell,
		valueGetter: (params) => params.data,
		cellRendererParams: {
			onEdit: OnClickEdit,
			onDelete: OnClickDelete
		},
		width: 150
	}
]);

const gridTheme = themeQuartz.withParams({
	backgroundColor: appTheme.current.value.colors.surface as string,
	foregroundColor: appTheme.current.value.colors["on-surface"] as string,
	accentColor: appTheme.current.value.colors["surface-light"] as string,
	iconButtonActiveColor: appTheme.current.value.colors["on-surface"] as string,
	iconButtonActiveIndicatorColor: appTheme.current.value.colors.success as string
});

const gridOptions: GridOptions<WhirlpoolLog> = {
	pagination: true,
	paginationPanels: display.mobile.value
		? ["pageSize", "pageSummary"]
		: ["pageSize", "rowSummary", "pageSummary"],
	paginationPageSizeSelector: [15, 30, 50, 100],
	paginationPageSize: 15,
	columnDefs: columnDefinitions.value,
	theme: gridTheme,
	rowHeight: display.mobile.value ? 80 : 50,
	rowClass: "TEST"
};
</script>
<template>
	<AgGridVue :grid-options="gridOptions" :row-data="validTableItems" style="height: 70vh" />
</template>

<style scoped>
::v-deep(.ag-cell) {
	display: flex;
	align-items: center;
	font-size: v-bind(fontSize);
}
</style>
