<script setup lang="ts">
import { AgGridVue } from "ag-grid-vue3";
import {
	AllCommunityModule,
	type ColDef,
	type GridOptions,
	ModuleRegistry,
	themeQuartz
} from "ag-grid-community";
import { useTheme } from "vuetify";
import { DateTime } from "luxon";
import useCategoriesStore from "@/stores/categories.ts";
import useWhirlpoolStore from "@/stores/whirlpools.ts";
import { WhirlpoolLog } from "@/utils/types/WhirlpoolLog.ts";
import ActionCell from "@/components/records/ActionCell.vue";
import { FieldType } from "@/utils/types/IField.ts";
import RatingCell from "@/components/records/RatingCell.vue";
import TagsCell from "@/components/records/TagsCell.vue";
import EntryForm from "@/components/EntryForm.vue";
import ConfirmCard from "@/components/common/ConfirmCard.vue";
import LoggerDatabase from "@/utils/database/LoggerDatabase.ts";
import useSyncStore from "@/stores/sync.ts";
import useSettingsStore from "@/stores/settings.ts";
import whirlpools from "@/stores/whirlpools.ts";
import { SortWhirlpoolByUserUpdated } from "@/utils/MiscUtils.ts";

const appTheme = useTheme();
const categoryStore = useCategoriesStore();
const whirlpoolStore = useWhirlpoolStore();
const syncStore = useSyncStore();
const settingsStore = useSettingsStore();

const fontSize = computed(() => (settingsStore.display.mobile ? "1.5rem" : "1rem"));

type WhirlPoolTableProps = {
	categoryId: string;
};

ModuleRegistry.registerModules([AllCommunityModule]);

const { categoryId } = defineProps<WhirlPoolTableProps>();

const validTableItems = computed(() => {
	return whirlpoolStore.clientWhirlpools.filter(
		(whirlpool) => whirlpool.categoryId === categoryId && whirlpool.deletedOn === null
	);
});

const tableCategory = computed(() => {
	return categoryStore.clientCategories.find((category) => category.id === categoryId);
});

function GetFilterType(fieldType: FieldType) {
	switch (fieldType) {
		case FieldType.TEXT:
			return "agTextColumnFilter";
		case FieldType.NUMBER:
			return "agNumberColumnFilter";
		case FieldType.DATE:
			return "agDateColumnFilter";
		default:
			return undefined;
	}
}

// Generate columns for custom fields
const extraFieldColumns = computed(() => {
	return tableCategory.value?.extraFields.map((extraField): ColDef<WhirlpoolLog> => {
		return {
			headerName: extraField.label,
			valueGetter: (params) => {
				return (
					params.data?.extraFieldValues.find((value) => value.fieldId === extraField.id)?.value ??
					"No data"
				);
			},
			hide: extraField.hideInTable,
			filter: extraField.type === FieldType.BOOL ? undefined : GetFilterType(extraField.type)
		};
	});
});

const columnDefinitions = ref<ColDef<WhirlpoolLog>[]>([
	{
		field: "title",
		flex: 1,
		filter: "agTextColumnFilter",
		cellClass: "title-cell",
		sort: "asc",
		initialSortIndex: 1
	},
	{
		field: "status",
		valueGetter: (params) => params.data?.status?.name ?? "No status",
		filter: "agTextColumnFilter",
		width: 200
	},
	{
		headerName: "Tags (3 max)",
		cellRenderer: TagsCell,
		wrapText: true,
		autoHeight: true,
		sortable: false
	},
	{
		headerName: "Rating",
		valueGetter: (params) => params.data?.rating ?? "No rating",
		cellRenderer: RatingCell,
		filter: "agNumberColumnFilter",
		width: 100
	},
	{
		headerName: "Last Updated",
		valueGetter: (params) => {
			if (params.data) {
				return params.data.userUpdatedOn;
			}
		},
		comparator: (_value1, _value2, row1, row2) => {
			if (row1.data && row2.data) {
				return SortWhirlpoolByUserUpdated(row1.data, row2.data);
			} else return 0;
		},
		sort: "desc",
		initialSortIndex: 0
	},
	...(extraFieldColumns.value ?? []),
	{
		headerName: "Actions",
		sortable: false,
		resizable: false,
		cellRenderer: ActionCell,
		valueGetter: (params) => params.data,
		cellRendererParams: {
			onEdit: OpenModal,
			onDelete: PrepareToDelete
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
	defaultColDef: {
		cellClass: "centered-cell"
	},
	pagination: true,
	paginationPanels: settingsStore.display.mobile
		? ["pageSize", "pageSummary"]
		: ["pageSize", "rowSummary", "pageSummary"],
	paginationPageSizeSelector: [15, 30, 50, 100],
	paginationPageSize: 15,
	columnDefs: columnDefinitions.value,
	theme: gridTheme,
	rowHeight: settingsStore.display.mobile ? 80 : 50,
	rowClass: "TEST"
};

// dialog operations

const isEntryModalOpen = ref(false);
const modalEntry = ref<WhirlpoolLog>();
const preparedToDelete = ref<WhirlpoolLog | undefined>();
const isDeleteConfirmModalOpen = ref(false);

function OpenModal(item: WhirlpoolLog) {
	modalEntry.value = item;
	isEntryModalOpen.value = true;
}

const closeModal = () => {
	isEntryModalOpen.value = false;
};

function PrepareToDelete(item: WhirlpoolLog) {
	preparedToDelete.value = item;
	isDeleteConfirmModalOpen.value = true;
}

const unprepareToDelete = () => {
	preparedToDelete.value = undefined;
	isDeleteConfirmModalOpen.value = false;
};

const deleteEntry = async () => {
	if (preparedToDelete.value) {
		await LoggerDatabase.whirlpools.update(preparedToDelete.value.id, {
			unsyncedChanges: true,
			deletedOn: DateTime.now().toISO()
		});
		isDeleteConfirmModalOpen.value = false;
		if (syncStore.autoSyncEnabled === true) {
			await syncStore.AutoSync();
		}
	} else {
		isDeleteConfirmModalOpen.value = false;
	}
};
</script>
<template>
	<AgGridVue :grid-options="gridOptions" :row-data="validTableItems" style="height: 70vh" />
	<VDialog
		v-if="tableCategory && modalEntry"
		v-model="isEntryModalOpen"
		persistent
		scrollable
		:fullscreen="settingsStore.display.mobile"
	>
		<EntryForm :existing-entry="modalEntry" :category-id="tableCategory.id" @close="closeModal" />
	</VDialog>
	<VDialog v-model="isDeleteConfirmModalOpen">
		<ConfirmCard
			title="Delete Whirlpool"
			message="Are you sure you want to delete this?"
			@ok="deleteEntry"
			@cancel="unprepareToDelete"
		/>
	</VDialog>
</template>

<style scoped>
::v-deep(.ag-cell) {
	display: flex;
	align-items: center;
	font-size: v-bind(fontSize);
}

::v-deep(.ag-header-cell-label) {
	justify-content: center;
}

::v-deep(.centered-cell) {
	justify-content: center;
	text-align: center;
}

::v-deep(.title-cell) {
	justify-content: flex-start;
	text-align: left;
}
</style>
