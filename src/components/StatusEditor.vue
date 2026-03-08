<script setup lang="ts">
import { ulid } from "ulid";
import { DateTime } from "luxon";
import type { IStatus } from "@/utils/types/IStatus.ts";

type StatusEditorProps = {
	statuses: IStatus[];
};

const newStatus: IStatus = {
	id: ulid(),
	name: "",
	createdOn: DateTime.now()
};

const emits = defineEmits(["update", "add", "delete"]);
const { statuses } = defineProps<StatusEditorProps>();
const editingStatuses = ref([...statuses]);
const selectedStatus = ref<IStatus[]>(editingStatuses.value.slice(0, 1) || [newStatus]);

// determine whether user is currently editing an existing status, or adding a new one
const isNewStatus = computed(() => {
	return !editingStatuses.value.find((status) => status.id === selectedStatus.value[0]?.id);
});

const addStatus = () => {
	// ensure there's a unique id at point of adding
	editingStatuses.value.push({ ...newStatus, id: ulid() });
	emits("add", editingStatuses);
};

const updateStatus = () => {
	editingStatuses.value = editingStatuses.value.map((status) => {
		if (selectedStatus.value[0] && status.id === selectedStatus.value[0].id)
			return selectedStatus.value[0];
		return status;
	});
	emits("update", editingStatuses);
};

const deleteStatus = () => {
	editingStatuses.value = editingStatuses.value.filter((status) => {
		return !(selectedStatus.value[0] && status.id === selectedStatus.value[0].id);
	});
	emits("delete", editingStatuses);
};

watch(
	() => statuses,
	(newStatuses) => {
		editingStatuses.value = [...newStatuses];
	}
);
</script>

<template>
	<VContainer>
		<VRow>
			<VCol cols="12" md="3">
				<VList
					v-model:selected="selectedStatus"
					selectable
					density="compact"
					class="border border-gray-200/50 rounded-lg max-h-60 overflow-y-auto"
					mandatory
				>
					<VListItem v-for="status in editingStatuses" :key="status.id" :value="status">{{
						status.name
					}}</VListItem>
					<VDivider></VDivider>
					<VListItem :value="newStatus">Add New</VListItem>
				</VList>
			</VCol>
			<VCol cols="12" md="9">
				<VCard>
					<!--	TODO: At the moment this live-updates the name in the selection box, which I don't like. -->
					<VTextField v-model="selectedStatus[0]!.name" label="Name" />
					<VTextarea
						v-model="selectedStatus[0]!.description"
						label="Description (Optional)"
						placeholder="What does this status mean?"
						rows="2"
						row-height="20"
						no-resize
					/>
					<VCardActions>
						<VBtn v-if="!isNewStatus" @click="deleteStatus">
							<template v-slot:prepend> <VIcon icon="mdi-close" /></template>
							Delete
						</VBtn>
						<VBtn @click="isNewStatus ? addStatus() : updateStatus()">
							<template v-slot:prepend>
								<VIcon v-if="isNewStatus" icon="mdi-plus" />
								<VIcon v-else icon="mdi-check" />
							</template>
							<template #default>
								{{ isNewStatus ? "Add" : "Save" }}
							</template>
						</VBtn>
					</VCardActions>
				</VCard>
			</VCol>
		</VRow>
	</VContainer>
</template>

<style scoped></style>
