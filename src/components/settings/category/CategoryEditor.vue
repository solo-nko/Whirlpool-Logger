<script setup lang="ts">
import { DateTime } from "luxon";
import type { UpdateSpec } from "dexie";
import type { Category } from "@/utils/types/Category.ts";
import FieldEditor from "@/components/settings/category/FieldEditor.vue";
import DefaultFieldEditor from "@/components/settings/category/DefaultFieldEditor.vue";
import type { IEditingField, IField } from "@/utils/types/IField.ts";
import LoggerDatabase from "@/utils/database/LoggerDatabase.ts";
import { DatabaseStatus } from "@/utils/database/models/DatabaseStatus.ts";
import StatusEditor from "@/components/settings/category/StatusEditor.vue";
import TagEditor from "@/components/settings/category/TagEditor.vue";
import { DeepToRaw, TransformWhirlpoolFieldName } from "@/utils/MiscUtils.ts";
import type { IEditingTag, ITag } from "@/utils/types/ITag.ts";
import type { IEditingStatus, IStatus } from "@/utils/types/IStatus.ts";
import { type DefaultField, DefaultFields } from "@/utils/DefaultFieldUtils.ts";
import useSettingsStore from "@/stores/settings.ts";
import useWhirlpoolStore from "@/stores/whirlpools.ts";
import type { DatabaseWhirlpool } from "@/utils/database/models/DatabaseWhirlpool.ts";
import useSyncStore from "@/stores/sync.ts";

type CategoryEditorProps = {
	category: Category;
};
const settingsStore = useSettingsStore();
const whirlpoolStore = useWhirlpoolStore();
const syncStore = useSyncStore();

interface EditingCategory extends Category {
	availableStatuses: IEditingStatus[];
	tags: IEditingTag[];
	extraFields: IEditingField[];
}

interface BulkUpdateInterface {
	key: string;
	changes: UpdateSpec<DatabaseWhirlpool>;
}

/** Create a version of the category data just for editing within the component. */
function ConvertToEditingCategory(input: Category) {
	return {
		id: input.id,
		name: input.name,
		modifiedFields: input.modifiedFields,
		extraFields:
			input.extraFields.length > 0
				? input.extraFields.map(
						(field): IEditingField => ({ ...field, deleted: false, updated: false })
					)
				: [],
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
const openPanel = ref<string>();

const addExtraField = (input: IEditingField) => {
	editingModel.value.extraFields.push(input);
	settingsStore.DisplayToast("Custom field added. Save the category to save your changes.");
};

const updateExtraField = (updatedField: IEditingField) => {
	const findFieldToUpdate = editingModel.value.extraFields.find(
		(field) => field.id === updatedField.id
	);
	if (findFieldToUpdate) {
		editingModel.value.extraFields = editingModel.value.extraFields.map((field) => {
			if (field.id === findFieldToUpdate.id) return updatedField;
			return field;
		});
		settingsStore.DisplayToast("Custom fields updated. Save the category to save your changes.");
	}
};

const updateDefaultField = (input: DefaultField) => {
	const fieldIndexToUpdate = editingModel.value.modifiedFields.findIndex(
		(field) => field.field === input.field
	);
	// TODO: use ToSpliced instead
	if (fieldIndexToUpdate >= 0 && editingModel.value.modifiedFields[fieldIndexToUpdate])
		editingModel.value.modifiedFields.splice(fieldIndexToUpdate, 1, input);
	else editingModel.value.modifiedFields.push(input);
	settingsStore.DisplayToast("Default fields updated. Save the category to save your changes.");
};

const updateEditingStatuses = (newStatuses: IEditingStatus[]) => {
	editingModel.value.availableStatuses = newStatuses;
	settingsStore.DisplayToast("Statuses updated. Save the category to save your changes.");
};

const updateEditingTags = (newTags: IEditingTag[]) => {
	editingModel.value.tags = newTags;
	settingsStore.DisplayToast("Tags updated. Save the category to save your changes.");
};

/** Uses the `updated` and `deleted` flags to find existing Whirlpools in the database which have those tags attached. It then either removes the tags if they've been deleted, or modifies them if they've been updated. */
async function UpdateWhirlpoolTags() {
	const deletedTags = new Map(
		editingModel.value.tags.filter((tag) => tag.deleted).map((t) => [t.id, t])
	);
	const updatedTags = new Map(
		editingModel.value.tags.filter((tag) => tag.updated).map((t) => [t.id, t])
	);
	if (deletedTags.size === 0 && updatedTags.size === 0) return;

	// get whirlpools under this category
	const getClientWhirlpools = whirlpoolStore.clientWhirlpools.filter(
		(whirlpool) => whirlpool.categoryId === editingModel.value.id
	);
	// find whirlpools with at least one tag that has either been deleted or modified
	const whirlpoolsWithStaleTags = getClientWhirlpools.filter((whirlpool) =>
		whirlpool.tags.some((tag) => deletedTags.has(tag.id) || updatedTags.has(tag.id))
	);

	// If no whirlpools exist with outdated tags, there's no point proceeding past this point.
	if (whirlpoolsWithStaleTags.length === 0) return;

	const tagUpdates: BulkUpdateInterface[] = whirlpoolsWithStaleTags.map(
		(whirlpool): BulkUpdateInterface => ({
			key: whirlpool.id,
			changes: {
				tags: DeepToRaw(
					whirlpool.tags
						.filter((tag) => !deletedTags.has(tag.id))
						.map((oldTag) => {
							const updatedTag = updatedTags.get(oldTag.id);
							return updatedTag ? { ...updatedTag, updated: null } : oldTag;
						})
				)
			}
		})
	);

	await LoggerDatabase.whirlpools.bulkUpdate(tagUpdates);
}

/** Combs through whirlpools to remove statuses that have been deleted ('deleted' flag in IEditingStatus set to true) or updated ('updated' flag in IEditingStatus set to true). */
async function UpdateWhirlpoolStatuses() {
	const deletedStatuses = new Map<string, IEditingStatus>(
		editingModel.value.availableStatuses
			.filter((status) => status.deleted)
			.map((status) => [status.id, status])
	);

	const updatedStatuses = new Map<string, IEditingStatus>(
		editingModel.value.availableStatuses
			.filter((status) => status.updated)
			.map((status) => [status.id, status])
	);

	const getClientWhirlpools = whirlpoolStore.clientWhirlpools.filter(
		(whirlpool) => whirlpool.categoryId === editingModel.value.id
	);

	const whirlpoolsWithStaleStatuses = getClientWhirlpools.filter(
		(whirlpool) =>
			whirlpool.status &&
			(deletedStatuses.has(whirlpool.status.id) || updatedStatuses.has(whirlpool.status.id))
	);

	// skip the rest of the function if there are no whirlpools with outdated statuses
	if (whirlpoolsWithStaleStatuses.length === 0) return;

	const getNewStatus = (existingStatus: IStatus | undefined) => {
		if (existingStatus === undefined) return existingStatus;
		const findDeleted = deletedStatuses.get(existingStatus.id);
		if (findDeleted) return { ...existingStatus, deletedOn: DateTime.now() };

		const findUpdated = updatedStatuses.get(existingStatus.id);
		if (findUpdated) return findUpdated;

		return existingStatus;
	};

	const statusUpdates: BulkUpdateInterface[] = whirlpoolsWithStaleStatuses.map(
		(whirlpool): BulkUpdateInterface => {
			const newStatus = getNewStatus(whirlpool.status);
			return {
				key: whirlpool.id,
				changes: {
					status: newStatus ? DatabaseStatus.ConvertStatusForDatabase(newStatus) : undefined
				}
			};
		}
	);

	await LoggerDatabase.whirlpools.bulkUpdate(statusUpdates);
}

async function UpdateWhirlpoolExtraFields() {
	const deletedFields = new Map<string, IEditingField>(
		editingModel.value.extraFields
			.filter((field) => field.deleted)
			.map((field) => [field.id, field])
	);

	const updatedFields = new Map<string, IEditingField>(
		editingModel.value.extraFields
			.filter((field) => field.updated)
			.map((field) => [field.id, field])
	);

	const getClientWhirlpools = whirlpoolStore.clientWhirlpools.filter(
		(whirlpool) => whirlpool.categoryId === editingModel.value.id
	);

	const whirlpoolsWithStaleFields = getClientWhirlpools.filter((whirlpool) =>
		whirlpool.extraFieldValues.some(
			(field) => deletedFields.has(field.fieldId) || updatedFields.has(field.fieldId)
		)
	);

	if (whirlpoolsWithStaleFields.length === 0) return;

	const fieldUpdates: BulkUpdateInterface[] = whirlpoolsWithStaleFields.map(
		(whirlpool): BulkUpdateInterface => ({
			key: whirlpool.id,
			changes: {
				extraFieldValues: DeepToRaw(
					whirlpool.extraFieldValues.filter((field) => !deletedFields.has(field.fieldId))
				)
			}
		})
	);

	await LoggerDatabase.whirlpools.bulkUpdate(fieldUpdates);
}

const updateCategory = async () => {
	try {
		await LoggerDatabase.transaction(
			"rw",
			[LoggerDatabase.whirlpools, LoggerDatabase.categories],
			async () => {
				// I'd actually prefer to update the whirlpools AFTER updating the category itself, but I found that in between the category update occurring and the whirlpool updates beginning, the category prop had already been refreshed. This meant the watcher below had already been triggered, and consequently the "updated/deleted" flags had already been wiped clean.
				await UpdateWhirlpoolTags();
				await UpdateWhirlpoolStatuses();
				await UpdateWhirlpoolExtraFields();
				await LoggerDatabase.categories.update(editingModel.value.id, {
					// Dexie internally uses structuredClone for its put and add operations. structuredClone can't be used on Proxies, and Vue creates Proxies of object refs to maintain reactivity. Thus, when using a ref (or reactive) that refers to an object, it is likely necessary to use DeepRaw, or Vue's provided toRaw function to pull the object out from the reactive Proxy. Otherwise, Dexie won't be able to operate on it. This should not be an issue for refs based on primitive values such as strings and numbers, which is why name and displayOrder do not need this treatment.
					// TODO: actual change detection
					name: editingModel.value.name,
					displayOrder: editingModel.value.displayOrder,
					modifiedFields: DeepToRaw(editingModel.value.modifiedFields),
					extraFields: editingModel.value.extraFields
						.filter((extraField) => extraField.deleted === false)
						.map((extraField): IField => {
							// eslint-disable-next-line @typescript-eslint/no-unused-vars
							const { deleted, updated, ...normalField } = extraField;
							return normalField;
						}),
					availableStatuses: editingModel.value.availableStatuses
						.filter((status) => status.deleted === false)
						.map((status): DatabaseStatus => {
							// eslint-disable-next-line @typescript-eslint/no-unused-vars
							const { deleted, updated, ...normalStatus } = status;
							return DatabaseStatus.ConvertStatusForDatabase(normalStatus);
						}),
					tags: editingModel.value.tags
						.filter((tag) => tag.deleted === false)
						.map((tag): ITag => {
							// eslint-disable-next-line @typescript-eslint/no-unused-vars
							const { deleted, updated, ...normalTag } = tag;
							return normalTag;
						}),
					deletedOn: editingModel.value.deletedOn ? editingModel.value.deletedOn.toISO() : null,
					updatedOn: DateTime.now().toISO(),
					createdOn: editingModel.value.createdOn.toISO() ?? "unknown",
					unsyncedChanges: true
				});
			}
		);

		settingsStore.UpdateDashboardsTable(editingModel.value);
		if (syncStore.autoSyncEnabled) await syncStore.AutoSync();
		settingsStore.DisplayToast("Category saved.");
	} catch (error) {
		settingsStore.OutputToConsole(error, true);
		settingsStore.DisplayToast("An error has occurred. Please check the console.");
	}
};

watch(
	() => category.id,
	(newId, oldId) => {
		if (newId && newId !== oldId) {
			editingModel.value = ConvertToEditingCategory(category);
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
					<VCard variant="outlined">
						<VCardTitle>Field Settings</VCardTitle>
						<VCardSubtitle>
							Here you can modify the category's default fields by renaming or hiding them. You can
							also add custom fields of your own.
						</VCardSubtitle>
						<VExpansionPanels v-model="openPanel" variant="inset">
							<VExpansionPanel
								v-for="defaultField in DefaultFields"
								:key="defaultField.field"
								:value="`default-${defaultField.field}`"
							>
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
							<VExpansionPanel
								v-for="customField in editingModel.extraFields"
								:key="customField.id"
								:value="`custom-${customField.id}`"
							>
								<VExpansionPanelTitle>
									<s v-if="customField.deleted">{{ customField.label }}</s>
									<span v-else>{{ customField.label }}</span>
								</VExpansionPanelTitle>
								<VExpansionPanelText>
									<FieldEditor
										:field-data="customField"
										@update-field="updateExtraField"
										@remove-field="updateExtraField"
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
					<VCard variant="flat">
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
					<VCard variant="flat">
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
	</VCard>
</template>

<style scoped>
:deep(.v-card-subtitle) {
	white-space: wrap;
}
</style>
