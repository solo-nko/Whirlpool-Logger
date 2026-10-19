<script setup lang="ts">
import { ulid } from "ulid";
import type { IEditingTag } from "@/utils/types/ITag.ts";
import useSettingsStore from "@/stores/settings.ts";
import { CheckMaxLength, HasValue } from "@/utils/MiscUtils.ts";

type TagEditorProps = {
	tags: IEditingTag[];
};

const newTag: IEditingTag = {
	id: "new",
	label: "",
	color: "",
	description: "",
	deleted: false,
	updated: true
};

const settingsStore = useSettingsStore();

const { tags } = defineProps<TagEditorProps>();
const emits = defineEmits<{
	updateTags: [updated: IEditingTag[]];
}>();

const displayedEditingTags = computed(() => tags.filter((tag) => !tag.deleted));
const selectedTag = ref<IEditingTag>();
const editingTag = ref<IEditingTag>(newTag);
const formRef = ref();
const formValidationStatus = ref<boolean>(false);

const isEditingNewTag = computed<boolean>(() => {
	return selectedTag.value === undefined;
});

const addTag = () => {
	if (!formValidationStatus.value) {
		settingsStore.DisplayToast("A required field is missing, or a field has invalid input.");
		if (formRef.value) formRef.value.validate();
		return;
	}
	const newTagsList = [...displayedEditingTags.value, { ...editingTag.value, id: ulid() }];
	emits("updateTags", newTagsList);
};

const updateTag = () => {
	if (!formValidationStatus.value) {
		settingsStore.DisplayToast("A required field is missing, or a field has invalid input.");
		if (formRef.value) formRef.value.validate();
		return;
	}
	const newTagsList = displayedEditingTags.value.map((tag) => {
		if (editingTag.value.id === tag.id) return { ...editingTag.value, updated: true };
		return tag;
	});
	editingTag.value = newTag;
	selectedTag.value = undefined;
	emits("updateTags", newTagsList);
};

const deleteTag = () => {
	const newTagsList = displayedEditingTags.value.map((tag) => {
		if (editingTag.value.id === tag.id) return { ...editingTag.value, deleted: true };
		return tag;
	});
	editingTag.value = newTag;
	selectedTag.value = undefined;
	emits("updateTags", newTagsList);
};

watch(selectedTag, (newSelection) => {
	if (newSelection === undefined) {
		editingTag.value = newTag;
	} else {
		editingTag.value = { ...newSelection };
	}
});
</script>

<template>
	<VContainer>
		<VRow>
			<VCol cols="12" md="3">
				<div
					class="border border-gray-200/50 rounded-lg min-h-32 max-h-40 overflow-y-auto flex w-full px-2"
				>
					<div v-if="displayedEditingTags.length === 0" class="self-center grow text-center">
						No Tags Currently
					</div>
					<div v-else>
						<VChipGroup v-model="selectedTag" column filter>
							<VChip
								v-for="tag in displayedEditingTags"
								:key="tag.id"
								:value="tag"
								:base-color="tag.color ?? undefined"
								:variant="selectedTag?.id === tag.id ? 'elevated' : 'flat'"
								size="small"
							>
								{{ tag.label }}
							</VChip>
						</VChipGroup>
					</div>
				</div>
			</VCol>
			<VCol cols="12" md="9">
				<VCard variant="outlined" class="px-5">
					<VForm ref="formRef" v-model="formValidationStatus">
						<VCardTitle>{{ isEditingNewTag ? "Add Tag" : "Edit Tag" }}</VCardTitle>
						<VTextField
							v-model="editingTag.label"
							class="mb-5"
							label="Label"
							:rules="[
								(value: string) => HasValue({ input: value, fieldName: 'Label' }),
								(value: string) =>
									CheckMaxLength({ input: value, fieldName: 'Label', maxLength: 25 })
							]"
							counter
						/>
						<VTextField v-model="editingTag.description" label="Description (Optional)" />
						<VExpansionPanels>
							<VExpansionPanel title="Color (Optional)">
								<VExpansionPanelText>
									<VColorPicker
										v-model="editingTag.color"
										landscape
										mode="hex"
										:modes="['hex']"
										label="Color"
									/>
								</VExpansionPanelText>
							</VExpansionPanel>
						</VExpansionPanels>
					</VForm>
					<VCardActions>
						<VBtn v-if="!isEditingNewTag" @click="deleteTag">
							<template v-slot:prepend> <VIcon icon="$close" /></template>
							Delete
						</VBtn>
						<VBtn @click="isEditingNewTag ? addTag() : updateTag()">
							<template v-slot:prepend>
								<VIcon v-if="isEditingNewTag" icon="$plus" />
								<VIcon v-else icon="$check" />
							</template>
							<template #default>
								{{ isEditingNewTag ? "Add" : "Save" }}
							</template>
						</VBtn>
					</VCardActions>
				</VCard>
			</VCol>
		</VRow>
	</VContainer>
</template>

<style scoped></style>
