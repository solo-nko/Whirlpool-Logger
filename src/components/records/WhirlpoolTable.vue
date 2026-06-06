<script setup lang="ts">
import { DateTime } from "luxon";
import useWhirlpoolStore from "@/stores/whirlpools.ts";
import useSettingsStore from "@/stores/settings.ts";
import { WhirlpoolLog } from "@/utils/types/WhirlpoolLog.ts";
import useCategoriesStore from "@/stores/categories.ts";
import EntryForm from "@/components/EntryForm.vue";
import LoggerDatabase from "@/utils/database/LoggerDatabase.ts";
import ConfirmCard from "@/components/common/ConfirmCard.vue";
import type { IHeaderItem } from "@/utils/types/IHeaderItem.ts";
import { SortWhirlpoolByUserUpdated } from "@/utils/MiscUtils.ts";
import type { ISortItem } from "@/utils/types/ISortItem.ts";
import type { ITag } from "@/utils/types/ITag.ts";
import useSyncStore from "@/stores/sync.ts";

const settings = useSettingsStore();
const syncStore = useSyncStore();

type WhirlPoolTableProps = {
	categoryId: string;
};

const { categoryId } = defineProps<WhirlPoolTableProps>();

const categoryStore = useCategoriesStore();
const whirlpoolsStore = useWhirlpoolStore();
const tableItems = computed(() => {
	return whirlpoolsStore.clientWhirlpools.filter(
		(whirlpool) => whirlpool.categoryId === categoryId && whirlpool.deletedOn === null
	);
});

const basicHeader: IHeaderItem = {
	title: "none",
	// this is a tailwind selector targeting the v-data-table-header__content class
	headerProps: { class: "*:justify-center" },
	cellProps: { class: "text-center" }
} as IHeaderItem;

const itemsPerPageOptions: { title: string; value: number }[] = [
	{ title: "10", value: 10 },
	{ title: "25", value: 25 },
	{ title: "50", value: 50 }
];

/**
 * Custom filter function for handling tags.
 * Useful StackExchange thread on the topic: https://stackoverflow.com/questions/64405434/vuetify-data-table-how-are-header-filter-functions-applied
 * */
function filterTags(value: ITag[], query: string) {
	if (value.length === 0 || query === null) return false;
	const tagLabels = value.map((tag) => tag.label.toLowerCase());
	return tagLabels.some((tagLabel) => tagLabel.includes(query.toLowerCase()));
}

const tableHeaders = ref<IHeaderItem[]>([
	{
		...basicHeader,
		title: "Title",
		value: "title",
		sortable: true,
		cellProps: { class: "text-left" }
	},
	{ ...basicHeader, title: "Status", value: "status", sortable: true },
	{ ...basicHeader, title: "Tags (3 Max)", value: "tags", sortable: false, filter: filterTags },
	{
		...basicHeader,
		title: "Last Updated",
		value: "userUpdatedOn",
		sortable: true,
		sortRaw: SortWhirlpoolByUserUpdated
	},
	{ ...basicHeader, title: "Actions", key: "actions", sortable: false }
]);

const defaultSortOrder: ISortItem[] = [{ key: "updatedOn", order: "desc" }];

const tableCategory = computed(() => {
	return categoryStore.clientCategories.find((category) => category.id === categoryId);
});
const isEntryModalOpen = ref(false);
const modalEntry = ref<WhirlpoolLog>();
const preparedToDelete = ref<WhirlpoolLog | undefined>();
const isDeleteConfirmModalOpen = ref(false);
const searchValue = ref<string | undefined>();

const openModal = (item: WhirlpoolLog) => {
	modalEntry.value = item;
	isEntryModalOpen.value = true;
};

const closeModal = () => {
	isEntryModalOpen.value = false;
};

const prepareToDelete = (item: WhirlpoolLog) => {
	preparedToDelete.value = item;
	isDeleteConfirmModalOpen.value = true;
};

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

const getDate = (item: WhirlpoolLog, type: "updated" | "created") => {
	return type === "updated"
		? WhirlpoolLog.DateTimeToString(item.updatedOn, true)
		: WhirlpoolLog.DateTimeToString(item.createdOn, true);
};
</script>

<template>
	<VDataTable
		v-model:items-per-page="settings.itemsPerPage"
		:headers="tableHeaders"
		:items="tableItems"
		:sort-by="defaultSortOrder"
		:search="searchValue"
		:filter-keys="['title', 'status.name', 'tags']"
		:filter-mode="'union'"
	>
		<!--	 eslint-disable vue/valid-v-slot -->
		<template v-slot:item.status="{ item }">
			<span v-if="item.status">{{ item.status.name }}</span>
			<span v-else><em>No Status</em></span>
		</template>
		<template v-slot:item.tags="{ item }">
			<span v-if="item.tags.length === 0"><em>No Tags</em></span>
			<span v-else>
				<VChip
					v-for="tag in item.tags.slice(0, 3)"
					:key="tag.id"
					:color="tag.color ?? undefined"
					size="small"
					density="compact"
					variant="flat"
				>
					{{ tag.label }}
				</VChip>
			</span>
		</template>
		<template v-slot:item.actions="{ item }">
			<VBtnGroup>
				<VBtn icon="$edit" @click="openModal(item)" />
				<VBtn icon="$trash" @click="prepareToDelete(item)" />
			</VBtnGroup>
		</template>
		<template v-slot:item.updatedOn="{ item }">
			<span>{{ getDate(item, "updated") }}</span>
		</template>
		<template v-slot:bottom>
			<VRow class="items-center xs:max-md:flex-col">
				<VCol cols="4" class="xs:max-md:w-full xs:max-md:mt-3">
					<VTextField
						v-model="searchValue"
						class="px-4"
						density="compact"
						label="Search (title, status, tags)"
						clearable
						hide-details
					/>
				</VCol>
				<VCol> <VDataTableFooter :items-per-page-options="itemsPerPageOptions" /> </VCol>
			</VRow>
		</template>
	</VDataTable>
	<!--		 eslint-enable vue/valid-v-slot -->
	<VDialog
		v-if="tableCategory && modalEntry"
		v-model="isEntryModalOpen"
		persistent
		scrollable
		:fullscreen="settings.display.mobile"
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

<style scoped></style>
