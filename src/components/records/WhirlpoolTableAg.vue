<script setup lang="ts">
import { AgGridVue } from "ag-grid-vue3";
import {
	AllCommunityModule,
	type ColDef,
	type GridApi,
	type GridOptions,
	type GridReadyEvent,
	ModuleRegistry,
	themeQuartz,
	type DoesFilterPassParams
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
import TagsFilter from "@/components/records/TagsFilter.vue";
import EntryForm from "@/components/EntryForm.vue";
import ConfirmCard from "@/components/common/ConfirmCard.vue";
import LoggerDatabase from "@/utils/database/LoggerDatabase.ts";
import useSyncStore from "@/stores/sync.ts";
import useSettingsStore from "@/stores/settings.ts";
import { SortWhirlpoolByUserUpdated, TransformVariableName } from "@/utils/MiscUtils.ts";
import type { WhirlpoolFields } from "@/utils/DefaultFieldUtils.ts";
import { IsDefaultFieldHiddenInTable } from "@/utils/database/DatabaseUtils.ts";
import type { TagFilterModel, WhirlPoolTableProps } from "@/components/records/GridUtils.ts";

const appTheme = useTheme();
const categoryStore = useCategoriesStore();
const whirlpoolStore = useWhirlpoolStore();
const syncStore = useSyncStore();
const settingsStore = useSettingsStore();

const fontSize = computed(() => (settingsStore.display.mobile ? "1.5rem" : "1rem"));

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

const gridApi = shallowRef<GridApi | null>(null);
const onGridReady = (params: GridReadyEvent) => {
	gridApi.value = params.api;
};

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

function DetermineIfDefaultHidden(fieldName: WhirlpoolFields) {
	if (tableCategory.value === undefined) return false;
	const field = tableCategory.value.modifiedFields.find((item) => item.field === fieldName);
	if (field === undefined) return IsDefaultFieldHiddenInTable(fieldName);
	return field.hideInTable;
}

function GetHeaderName(fieldName: WhirlpoolFields) {
	const defaultName = TransformVariableName(fieldName as string);
	if (tableCategory.value === undefined) return defaultName;
	const field = tableCategory.value.modifiedFields.find((item) => item.field === fieldName);
	if (field === undefined) return defaultName;
	return field.rename ?? defaultName;
}

function DoesTagsFilterPass(params: DoesFilterPassParams<WhirlpoolLog, unknown, TagFilterModel>) {
	const { model, node } = params;
	if (model === null) return false;
	const rowTagLabels = node.data?.tags.map((tag) => tag.id);
	if (
		model.and &&
		model.filterTagLabels.every((filterTagLabel) => rowTagLabels?.includes(filterTagLabel))
	) {
		return true;
	}
	if (
		!model.and &&
		model.filterTagLabels.some((filterTagLabel) => rowTagLabels?.includes(filterTagLabel))
	) {
		return true;
	}

	return false;
}

const columnDefinitions = computed<ColDef<WhirlpoolLog>[]>(() => {
	return [
		{
			field: "title",
			headerName: "Title",
			flex: 1,
			minWidth: 200,
			filter: "agTextColumnFilter",
			cellClass: "title-cell",
			sort: "asc",
			initialSortIndex: 1
		},
		{
			headerName: GetHeaderName("status"),
			valueGetter: (params) => params.data?.status?.name ?? "No status",
			filter: "agTextColumnFilter",
			width: 200,
			hide: DetermineIfDefaultHidden("status")
		},
		{
			field: "chapter",
			headerName: GetHeaderName("chapter"),
			filter: "agNumberColumnFilter",
			hide: DetermineIfDefaultHidden("chapter")
		},
		{
			field: "volume",
			headerName: GetHeaderName("volume"),
			filter: "agNumberColumnFilter",
			hide: DetermineIfDefaultHidden("volume")
		},
		{
			headerName: `${GetHeaderName("tags")} (3 max)`,
			cellRenderer: TagsCell,
			wrapText: true,
			autoHeight: true,
			filter: { component: TagsFilter, doesFilterPass: DoesTagsFilterPass },
			filterParams: {
				category: tableCategory.value
			},
			sortable: false,
			hide: DetermineIfDefaultHidden("tags"),
			valueGetter: (params) => params.data?.tags.map((tag) => tag.label).join(", ")
		},
		{
			headerName: GetHeaderName("rating"),
			valueGetter: (params) => params.data?.rating ?? "No rating",
			cellRenderer: RatingCell,
			filter: "agNumberColumnFilter",
			width: 100,
			hide: DetermineIfDefaultHidden("rating")
		},
		{
			field: "series",
			headerName: GetHeaderName("series"),
			filter: "agTextColumnFilter",
			hide: DetermineIfDefaultHidden("series")
		},
		{
			headerName: GetHeaderName("userUpdatedOn"),
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
			field: "progress",
			headerName: GetHeaderName("progress"),
			filter: "agTextColumnFilter",
			hide: DetermineIfDefaultHidden("progress")
		},
		// TODO: consider how to add notes column
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
	];
});

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
	domLayout: "autoHeight",
	enableFilterHandlers: true
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
	<!--	eslint-disable vue/v-on-event-hyphenation -->
	<VTextField
		density="compact"
		label="Quick Search"
		clearable
		hide-details
		class="mt-2"
		@update:modelValue="
			(text: unknown) => {
				if (gridApi === null) return;
				gridApi.setGridOption('quickFilterText', text as string);
			}
		"
	>
		<template v-slot:prepend-inner>
			<VIcon icon="$search" />
		</template>
	</VTextField>
	<!-- eslint-enable		vue/v-on-event-hyphenation-->
	<AgGridVue :grid-options="gridOptions" :row-data="validTableItems" @grid-ready="onGridReady" />
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
:deep(.ag-cell) {
	display: flex;
	align-items: center;
	font-size: v-bind(fontSize);
}

:deep(.ag-header-cell-label) {
	justify-content: center;
}

:deep(.centered-cell) {
	justify-content: center;
	text-align: center;
}

:deep(.title-cell) {
	justify-content: flex-start;
	text-align: left;
}

:deep(.ag-sort-order) {
	text-decoration: underline;
}
</style>
