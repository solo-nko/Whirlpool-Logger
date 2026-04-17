<script setup lang="ts">
import { DateTime } from "luxon";
import type { Category } from "@/utils/types/Category.ts";
import FieldEditor from "@/components/FieldEditor.vue";
import DefaultFieldEditor from "@/components/DefaultFieldEditor.vue";
import type { IField } from "@/utils/types/IField.ts";
import LoggerDatabase from "@/utils/database/LoggerDatabase.ts";
import { DatabaseStatus } from "@/utils/database/models/DatabaseStatus.ts";
import StatusEditor from "@/components/StatusEditor.vue";
import TagEditor from "@/components/TagEditor.vue";
import { DeepToRaw, TOAST_TIMEOUT, TransformWhirlpoolFieldName } from "@/utils/Utilities.ts";
import type { IEditingTag, ITag } from "@/utils/types/ITag.ts";
import type { IEditingStatus, IStatus } from "@/utils/types/IStatus.ts";
import { type DefaultField, DefaultFields } from "@/utils/types/DefaultFieldUtils.ts";
import useSettingsStore from "@/stores/settings.ts";
import useWhirlpoolStore from "@/stores/whirlpools.ts";

type CategoryEditorProps = {
	category: Category;
};
const settingsStore = useSettingsStore();
const whirlpoolStore = useWhirlpoolStore();

interface EditingCategory extends Category {
	availableStatuses: IEditingStatus[];
	tags: IEditingTag[];
}

/** Create a version of the category data just for editing within the component. */
function ConvertToEditingCategory(input: Category) {
	return {
		id: input.id,
		name: input.name,
		modifiedFields: input.modifiedFields,
		extraFields: input.extraFields,
		displayOrder: input.displayOrder,
		availableStatuses:
			input.availableStatuses.length > 0
				? input.availableStatuses.map(
						(status): IEditingStatus => ({ ...status, deleted: false, updated: false })
					)
				: [],
		tags:
			input.tags.length > 0
				? input.tags.map((tag) => ({ ...tag, deleted: false, updated: false }))
				: [],
		color: input.color,
		syncCode: input.syncCode,
		unsyncedChanges: input.unsyncedChanges,
		updatedOn: input.updatedOn,
		createdOn: input.createdOn,
		deletedOn: input.deletedOn
	};
}

const { category } = defineProps<CategoryEditorProps>();
/** The model used for making edits. This will be saved to the category when the save button is pressed. */
const editingModel = ref<EditingCategory>(ConvertToEditingCategory(category));

/** Tracks which field panels are open. */
const openPanels = ref([]);
const addExtraField = (input: IField) => {
	editingModel.value.extraFields.push(input);
};
const toastDisplayed = ref(false);
const toastMessage = ref("Category Saved!");

function DisplayToast(message: string) {
	toastMessage.value = message;
	toastDisplayed.value = true;
}

const updateExtraField = (input: IField) => {
	const fieldIndexToUpdate = editingModel.value.extraFields.findIndex(
		(field) => field.id === input.id
	);
	if (fieldIndexToUpdate >= 0) editingModel.value.extraFields.splice(fieldIndexToUpdate, 1, input);
};

const removeExtraField = (input: string) => {
	openPanels.value = [];
	const fieldIndexToUpdate = editingModel.value.extraFields.findIndex(
		(field) => field.id === input
	);
	if (fieldIndexToUpdate >= 0) editingModel.value.extraFields.splice(fieldIndexToUpdate, 1);
};

const updateDefaultField = (input: DefaultField) => {
	const fieldIndexToUpdate = editingModel.value.modifiedFields.findIndex(
		(field) => field.field === input.field
	);
	if (fieldIndexToUpdate >= 0 && editingModel.value.modifiedFields[fieldIndexToUpdate])
		editingModel.value.modifiedFields.splice(fieldIndexToUpdate, 1, input);
	else editingModel.value.modifiedFields.push(input);
};

const updateEditingStatuses = (newStatuses: IEditingStatus[]) => {
	editingModel.value.availableStatuses = newStatuses;
	DisplayToast("Statuses updated. Save the category to save your changes.");
};

const updateEditingTags = (newTags: IEditingTag[]) => {
	editingModel.value.tags = newTags;
	DisplayToast("Tags updated. Save the category to save your changes.");
};

/** Uses the `updated` and `deleted` flags to find existing Whirlpools in the database which have those tags attached. It then either removes the tags if they've been deleted, or modifies them if they've been updated. */
async function UpdateWhirlpoolTags() {
	const deletedTags: IEditingTag[] = editingModel.value.tags.filter((tag) => tag.deleted === true);
	const updatedTags: IEditingTag[] = editingModel.value.tags.filter((tag) => tag.updated === true);
	// get whirlpools under this category
	const getClientWhirlpools = whirlpoolStore.clientWhirlpools.filter(
		(whirlpool) => whirlpool.category.id === editingModel.value.id
	);
	// find whirlpools with at least one tag that has either been deleted or modified
	const whirlpoolsWithStaleTags = getClientWhirlpools.filter((whirlpool) =>
		whirlpool.tags.some(
			(tag) =>
				deletedTags.some((deletedTag) => deletedTag.id === tag.id) ||
				updatedTags.some((updatedTag) => updatedTag.id === tag.id)
		)
	);

	// If no whirlpools exist with outdated tags, there's no point proceeding past this point.
	if (whirlpoolsWithStaleTags.length === 0) return;

	const postTagUpdateWhirlpools = whirlpoolsWithStaleTags.map((whirlpool) => {
		return {
			...whirlpool,
			tags: whirlpool.tags
				// filter out deleted tags
				.filter((tag) => !deletedTags.some((deletedTag) => deletedTag.id === tag.id))
				// modify updated tags
				.map((oldTag) => {
					const newTag = updatedTags.find((updatedTag) => updatedTag.id === oldTag.id);
					// return the new version if there is one, else return the existing version
					return newTag ? { ...newTag, updated: null } : oldTag;
				})
		};
	});

	await LoggerDatabase.whirlpools.bulkUpdate(
		postTagUpdateWhirlpools.map((whirlpool) => ({
			key: whirlpool.id,
			changes: {
				tags: DeepToRaw(whirlpool.tags)
			}
		}))
	);
}

async function UpdateWhirlpoolStatuses() {
	const deletedStatuses: IEditingStatus[] = editingModel.value.availableStatuses.filter(
		(status) => status.deleted === true
	);
	const updatedStatuses: IEditingStatus[] = editingModel.value.availableStatuses.filter(
		(status) => status.updated === true
	);

	const getClientWhirlpools = whirlpoolStore.clientWhirlpools.filter(
		(whirlpool) => whirlpool.category.id === editingModel.value.id
	);

	const whirlpoolsWithStaleStatuses = getClientWhirlpools.filter(
		(whirlpool) =>
			deletedStatuses.some((status) => whirlpool.status?.id === status.id) ||
			updatedStatuses.some((status) => whirlpool.status?.id === status.id)
	);

	// skip the rest of the function if there are no whirlpools with outdated statuses
	if (whirlpoolsWithStaleStatuses.length === 0) return;

	const getNewStatus = (existingStatus: IStatus | undefined) => {
		if (existingStatus === undefined) return existingStatus;
		const findDeleted = deletedStatuses.find(
			(deletedStatus) => deletedStatus.id === existingStatus.id
		);
		if (findDeleted) return { ...existingStatus, deletedOn: DateTime.now() };
		const findUpdated = updatedStatuses.find(
			(updatedStatus) => updatedStatus.id === existingStatus.id
		);
		if (findUpdated) return findUpdated;
		return existingStatus;
	};

	const postStatusUpdateWhirlpools = whirlpoolsWithStaleStatuses.map((whirlpool) => {
		return {
			...whirlpool,
			status: getNewStatus(whirlpool.status)
		};
	});

	await LoggerDatabase.whirlpools.bulkUpdate(
		postStatusUpdateWhirlpools.map((whirlpool) => ({
			key: whirlpool.id,
			changes: {
				status: whirlpool.status
					? DatabaseStatus.ConvertStatusForDatabase(whirlpool.status)
					: undefined
			}
		}))
	);
}

const updateCategory = async () => {
	// TODO: clean up stale fields in existing whirlpools, like we currently do for statuses and tags
	try {
		// I'd actually prefer to update the whirlpools AFTER updating the category itself, but I found that inbetween the category update occurring and the whirlpool updates beginning, the category prop had already been refreshed, and the watcher below had already been triggered and consequently the "updated/deleted" flags had already been wiped clean.
		await UpdateWhirlpoolTags();
		await UpdateWhirlpoolStatuses();
		await LoggerDatabase.categories.update(editingModel.value.id, {
			// Dexie internally uses structuredClone for its put and add operations. structuredClone can't be used on Proxies, and Vue creates Proxies of object refs to maintain reactivity. Thus, when using a ref (or reactive) that refers to an object, it is likely necessary to use DeepRaw, or Vue's provided toRaw function to pull the object out from the reactive Proxy, or else Dexie won't be able to operate on it. This should not be an issue for refs based on primitive values such as strings and numbers, which is why name and displayOrder do not need this treatment.
			name: editingModel.value.name,
			displayOrder: editingModel.value.displayOrder,
			modifiedFields: DeepToRaw(editingModel.value.modifiedFields),
			extraFields: DeepToRaw(editingModel.value.extraFields),
			availableStatuses: editingModel.value.availableStatuses.map((status): DatabaseStatus => {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { deleted, updated, ...normalStatus } = status;
				return DatabaseStatus.ConvertStatusForDatabase(normalStatus);
			}),
			tags: editingModel.value.tags.map((tag): ITag => {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { deleted, updated, ...normalTag } = tag;
				return normalTag;
			}),
			deletedOn: editingModel.value.deletedOn ? editingModel.value.deletedOn.toJSDate() : undefined,
			updatedOn: DateTime.now().toJSDate(),
			createdOn: editingModel.value.createdOn.toJSDate(),
			unsyncedChanges: true
		});
		settingsStore.UpdateDashboardsTable(editingModel.value);
		DisplayToast("Category saved.");
	} catch (error) {
		// eslint-disable-next-line no-console
		console.log(error);
		DisplayToast("An error has occurred.");
	}
};

watch(
	() => category,
	(newValue) => {
		if (newValue) {
			editingModel.value = ConvertToEditingCategory(newValue);
		}
	}
);
</script>

<template>
	<VCard>
		<VContainer>
			<VRow>
				<VTextField v-model="editingModel.name" label="Rename Category" />
				<VNumberInput
					v-model="editingModel.displayOrder"
					type="number"
					label="Display Order (lower is higher)"
					control-variant="stacked"
				/>
			</VRow>
			<VRow>
				<VCol>
					<VCard>
						<VCardTitle>Field Settings</VCardTitle>
						<VCardSubtitle>
							Here you can modify the category's default fields by renaming or hiding them. You can
							also add custom fields of your own.
						</VCardSubtitle>
						<VExpansionPanels v-model="openPanels">
							<VExpansionPanel v-for="(defaultField, index) in DefaultFields" :key="index">
								<VExpansionPanelTitle>
									{{ TransformWhirlpoolFieldName(defaultField.field) }}
									&nbsp;
									<strong>(Default Field)</strong>
								</VExpansionPanelTitle>
								<VExpansionPanelText>
									<DefaultFieldEditor
										:field-data="
											editingModel.modifiedFields.find(
												(field) => field.field === defaultField.field
											) ?? defaultField
										"
										@update-field="updateDefaultField"
									/>
								</VExpansionPanelText>
							</VExpansionPanel>
							<VExpansionPanel v-for="field in editingModel.extraFields" :key="field.id">
								<VExpansionPanelTitle>{{ field.label }}</VExpansionPanelTitle>
								<VExpansionPanelText>
									<FieldEditor
										:field-data="field"
										@update-field="updateExtraField"
										@remove-field="removeExtraField"
									/>
								</VExpansionPanelText>
							</VExpansionPanel>
							<VExpansionPanel>
								<VExpansionPanelTitle>Add New Custom Field</VExpansionPanelTitle>
								<VExpansionPanelText>
									<FieldEditor @add-field="addExtraField" />
								</VExpansionPanelText>
							</VExpansionPanel>
						</VExpansionPanels>
					</VCard>
				</VCol>
			</VRow>
			<VRow>
				<VCol>
					<VCard>
						<VCardTitle>Status Settings</VCardTitle>
						<VCardSubtitle
							>Here you can modify the status fields attached to the category. Warning: Upon saving
							the category, all deleted statuses will be removed from any whirlpools they're
							attached to.
						</VCardSubtitle>
						<StatusEditor
							:statuses="editingModel.availableStatuses"
							@update-statuses="updateEditingStatuses"
						/>
					</VCard>
				</VCol>
			</VRow>
			<VRow>
				<VCol>
					<VCard>
						<VCardTitle>Tag Settings</VCardTitle>
						<VCardSubtitle
							>Here you can modify the tags attached to the category. Warning: Upon saving the
							category, all deleted tags will be removed from any whirlpools they're attached
							to.</VCardSubtitle
						>
						<TagEditor :tags="editingModel.tags" @update-tags="updateEditingTags" />
					</VCard>
				</VCol>
			</VRow>
		</VContainer>
		<VCardActions>
			<VBtn @click="updateCategory">Save Category</VBtn>
		</VCardActions>
		<VSnackbar v-model="toastDisplayed" :timeout="TOAST_TIMEOUT">{{ toastMessage }}</VSnackbar>
	</VCard>
</template>

<style scoped>
::v-deep(.v-card-subtitle) {
	white-space: wrap;
}
</style>
