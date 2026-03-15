<script setup lang="ts">
import { ulid } from "ulid";
import { DateTime } from "luxon";
import type { IStatus } from "@/utils/types/IStatus.ts";

type StatusEditorProps = {
	statuses: IStatus[];
};

const newStatus: IStatus = {
	id: "new",
	name: "",
	createdOn: DateTime.now()
};

const emits = defineEmits(["updateStatuses"]);
const { statuses } = defineProps<StatusEditorProps>();
/** The component's own copy of the prop, for editing purposes. */
const editingStatuses = ref(statuses.slice());
/** ref for tracking which item is currently selected, if any */
const selectedStatus = ref<IStatus[]>(editingStatuses.value.slice(0, 1) || [newStatus]);
/** ref for holding data that's currently being edited */
const editingStatus = ref<IStatus>(newStatus);

// determine whether user is currently editing an existing status, or adding a new one
const isNewStatus = computed<boolean>(() => {
	return editingStatus.value.id === "new";
});

const addStatus = () => {
	// ensure there's a unique id at point of adding
	editingStatuses.value.push({ ...editingStatus.value, id: ulid() });
	emits("updateStatuses", editingStatuses.value);
};

const updateStatus = () => {
	editingStatuses.value = editingStatuses.value.map((status) => {
		if (status.id === editingStatus.value.id) return editingStatus.value;
		return status;
	});
	emits("updateStatuses", editingStatuses.value);
};

const deleteStatus = () => {
	editingStatuses.value = editingStatuses.value.filter((status) => {
		return status.id !== editingStatus.value.id;
	});
	emits("updateStatuses", editingStatuses.value);
};

// TODO: add form validation
// TODO: something fishy's going on with the reactive object handling here. When a status is saved or selected, it changes from object to reactive.
// When props change, refresh the editing status
watch(
	() => statuses,
	(newStatuses) => {
		editingStatuses.value = newStatuses.slice();
		if (editingStatuses.value[0]) selectedStatus.value = [{ ...editingStatuses.value[0] }];
	}
);
// When selected status changes, change the status being edited (for the input fields)
watch(
	() => selectedStatus.value,
	(newSelection) => {
		if (newSelection[0]) {
			editingStatus.value = newSelection[0];
		}
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
					<VListItem v-for="status in editingStatuses" :key="status.id" :value="status">
						{{ status.name }}
					</VListItem>
					<VDivider></VDivider>
					<VListItem :value="newStatus">Add New</VListItem>
				</VList>
			</VCol>
			<VCol cols="12" md="9">
				<VCard>
					<VTextField v-model="editingStatus.name" label="Name" />
					<VTextarea
						v-model="editingStatus.description"
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
