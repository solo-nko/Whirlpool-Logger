<script setup lang="ts">
import { DateTime } from "luxon";
import useWhirlpoolStore from "@/stores/whirlpools.ts";
import useSettingsStore from "@/stores/settings.ts";
import { WhirlpoolLog } from "@/utils/types/WhirlpoolLog.ts";
import useCategoriesStore from "@/stores/categories.ts";
import EntryForm from "@/components/EntryForm.vue";
import LoggerDatabase from "@/utils/database/LoggerDatabase.ts";
import ConfirmCard from "@/components/ConfirmCard.vue";
import type { IHeaderItem } from "@/utils/types/IHeaderItem.ts";

const settings = useSettingsStore();

type WhirlPoolTableProps = {
	categoryId: string;
};

const { categoryId } = defineProps<WhirlPoolTableProps>();

const categoryStore = useCategoriesStore();
const whirlpoolsStore = useWhirlpoolStore();
const tableItems = computed(() => {
	return whirlpoolsStore.clientWhirlpools.filter(
		(whirlpool) => whirlpool.category.id === categoryId && whirlpool.deletedOn === null
	);
});
const tableHeaders = ref<IHeaderItem[]>([
	{ title: "Title", value: "title", sortable: true },
	{ title: "Last Updated", value: "updatedOn", sortable: false },
	{ title: "Status", value: "status", sortable: true },
	{ title: "Actions", key: "actions", sortable: false }
]);

const tableCategory = computed(() => {
	return categoryStore.clientCategories.find((category) => category.id === categoryId);
});
const isEntryModalOpen = ref(false);
const modalEntry = ref<WhirlpoolLog>();
const preparedToDelete = ref<WhirlpoolLog | undefined>();
const isConfirmModalOpen = ref(false);

const openModal = (item: WhirlpoolLog) => {
	modalEntry.value = item;
	isEntryModalOpen.value = true;
};

const closeModal = () => {
	isEntryModalOpen.value = false;
};

const prepareToDelete = (item: WhirlpoolLog) => {
	preparedToDelete.value = item;
	isConfirmModalOpen.value = true;
};

const unprepareToDelete = () => {
	preparedToDelete.value = undefined;
	isConfirmModalOpen.value = false;
};

const deleteEntry = async () => {
	if (preparedToDelete.value) {
		await LoggerDatabase.whirlpools.update(preparedToDelete.value.id, {
			unsyncedChanges: true,
			deletedOn: DateTime.now().toJSDate()
		});
	}
	isConfirmModalOpen.value = false;
};

const getDate = (item: WhirlpoolLog, type: "updated" | "created") => {
	return type === "updated"
		? WhirlpoolLog.DateTimeToString(item.updatedOn, true)
		: WhirlpoolLog.DateTimeToString(item.createdOn, true);
};
</script>

<template>
	<VDataTable :headers="tableHeaders" :items="tableItems">
		<!--	 eslint-disable vue/valid-v-slot -->
		<template v-slot:item.status="{ item }">
			<span>{{ item.status ? item.status.name : "Not Set" }}</span>
		</template>
		<template v-slot:item.actions="{ item }">
			<VBtnGroup>
				<VBtn @click="openModal(item)">Edit</VBtn>
				<VBtn @click="prepareToDelete(item)">Delete</VBtn>
			</VBtnGroup>
		</template>
		<template v-slot:item.updatedOn="{ item }">
			<span>{{ getDate(item, "updated") }}</span>
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
		<EntryForm :existing-entry="modalEntry" :category="tableCategory" @close="closeModal" />
	</VDialog>
	<VDialog v-model="isConfirmModalOpen">
		<ConfirmCard
			title="Delete Whirlpool"
			message="Are you sure you want to delete this?"
			@ok="deleteEntry"
			@cancel="unprepareToDelete"
		/>
	</VDialog>
</template>

<style scoped></style>
