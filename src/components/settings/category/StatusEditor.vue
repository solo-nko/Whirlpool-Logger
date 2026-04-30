<script setup lang="ts">
import { ulid } from "ulid";
import { DateTime } from "luxon";
import type { IEditingStatus } from "@/utils/types/IStatus.ts";
import { HasValue } from "@/utils/MiscUtils.ts";
import useSettingsStore from "@/stores/settings.ts";

type StatusEditorProps = {
	statuses: IEditingStatus[];
};

const settingsStore = useSettingsStore();

const newStatus: IEditingStatus = {
	id: "new",
	name: "",
	createdOn: DateTime.now(),
	deletedOn: null,
	deleted: false,
	updated: false
};

const emits = defineEmits(["updateStatuses"]);
const { statuses } = defineProps<StatusEditorProps>();
/** The component's own copy of the prop, for editing purposes. */
const displayedEditingStatuses = computed(() => statuses.filter((status) => !status.deleted));
/** ref for tracking which item is currently selected, if any */
const selectedStatus = ref<IEditingStatus[]>([newStatus]);
/** ref for holding data that's currently being edited */
const editingStatus = ref<IEditingStatus>(newStatus);
const formValidationStatus = ref<boolean>(false);
const formRef = ref();

// determine whether user is currently editing an existing status, or adding a new one
const isNewStatus = computed<boolean>(() => {
	return editingStatus.value.id === "new";
});

const addStatus = () => {
	if (!formValidationStatus.value) {
		settingsStore.DisplayToast("A required field is missing, or a field has invalid input.");
		if (formRef.value) formRef.value.validate();
		return;
	}
	// ensure there's a unique id at point of adding
	const newStatusesList = [...statuses, { ...editingStatus.value, id: ulid() }];
	emits("updateStatuses", newStatusesList);
};

const updateStatus = () => {
	if (!formValidationStatus.value) {
		settingsStore.DisplayToast("A required field is missing, or a field has invalid input.");
		if (formRef.value) formRef.value.validate();
		return;
	}
	const newStatusesList = statuses.map((status) => {
		if (status.id === editingStatus.value.id) return { ...editingStatus.value, updated: true };
		return status;
	});
	emits("updateStatuses", newStatusesList);
};

const deleteStatus = () => {
	const newStatusesList = statuses.map((status) => {
		if (status.id === editingStatus.value.id) return { ...editingStatus.value, deleted: true };
		return status;
	});
	editingStatus.value = newStatus;
	selectedStatus.value = [newStatus];
	emits("updateStatuses", newStatusesList);
};

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
					<VListItem :value="newStatus">Add New</VListItem>
					<VDivider />
					<VListItem v-for="status in displayedEditingStatuses" :key="status.id" :value="status">
						{{ status.name }}
					</VListItem>
				</VList>
			</VCol>
			<VCol cols="12" md="9">
				<VCard>
					<VForm ref="formRef" v-model="formValidationStatus">
						<VTextField
							v-model="editingStatus.name"
							label="Name"
							:rules="[(value) => HasValue(value, 'Name')]"
						/>
						<VTextarea
							v-model="editingStatus.description"
							label="Description (Optional)"
							placeholder="What does this status mean?"
							rows="2"
							row-height="20"
							no-resize
						/>
					</VForm>
					<VCardActions>
						<VBtn v-if="!isNewStatus" @click="deleteStatus">
							<template v-slot:prepend> <VIcon icon="$close" /></template>
							Delete
						</VBtn>
						<VBtn @click="isNewStatus ? addStatus() : updateStatus()">
							<template v-slot:prepend>
								<VIcon v-if="isNewStatus" icon="$plus" />
								<VIcon v-else icon="$check" />
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
