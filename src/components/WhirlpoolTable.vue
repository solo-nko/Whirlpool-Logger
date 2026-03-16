<script setup lang="ts">
import useWhirlpoolStore from "@/stores/whirlpools.ts";
import { WhirlpoolLog } from "@/utils/types/WhirlpoolLog.ts";
import useCategoriesStore from "@/stores/categories.ts";
import EntryForm from "@/components/EntryForm.vue";

type HeaderItem = {
	title: string;
	value?: string;
	key?: string;
	sortable?: boolean;
	sortRaw?: (a: WhirlpoolLog, b: WhirlpoolLog) => number;
};

type WhirlPoolTableProps = {
	categoryId: string;
};

const { categoryId } = defineProps<WhirlPoolTableProps>();

const categoryStore = useCategoriesStore();
const whirlpoolsStore = useWhirlpoolStore();
const tableItems = computed(() => {
	return whirlpoolsStore.clientWhirlpools.filter(
		(whirlpool) => whirlpool.categoryId === categoryId
	);
});
const tableHeaders = ref<HeaderItem[]>([
	{ title: "Title", value: "title", sortable: true },
	{ title: "Last Updated", value: "updatedOn", sortable: false },
	{ title: "Actions", key: "actions", sortable: false }
]);

const tableCategory = computed(() => {
	return categoryStore.clientCategories.find((category) => category.id === categoryId);
});
const isEntryModalOpen = ref(false);
const modalEntry = ref<WhirlpoolLog>();

const openModal = (item: WhirlpoolLog) => {
	modalEntry.value = item;
	isEntryModalOpen.value = true;
};

const closeModal = () => {
	isEntryModalOpen.value = false;
};

const getDate = (item: WhirlpoolLog, type: "updated" | "created") => {
	return type === "updated"
		? WhirlpoolLog.DateTimeToString(item.updatedOn)
		: WhirlpoolLog.DateTimeToString(item.createdOn);
};
</script>

<template>
	<VDataTable :headers="tableHeaders" :items="tableItems">
		<template v-slot:item.actions="{ item }">
			<VBtnGroup>
				<VBtn @click="openModal(item)">Edit</VBtn>
				<VBtn>Delete</VBtn>
			</VBtnGroup>
		</template>
		<template v-slot:item.updatedOn="{ item }">
			<span>{{ getDate(item, "updated") }}</span>
		</template>
	</VDataTable>
	<VDialog v-if="tableCategory && modalEntry" v-model="isEntryModalOpen" scrollable persistent>
		<EntryForm :existing-entry="modalEntry" :category="tableCategory" @close="closeModal" />
	</VDialog>
</template>

<style scoped></style>
