<script setup lang="ts">
import { ulid } from "ulid";
import type { IEditingTag } from "@/utils/types/ITag.ts";

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
const { tags } = defineProps<TagEditorProps>();
const emits = defineEmits(["updateTags"]);

const displayedEditingTags = computed(() => tags.filter((tag) => !tag.deleted));
const selectedTag = ref<IEditingTag>();
const editingTag = ref<IEditingTag>(newTag);

const isEditingNewTag = computed<boolean>(() => {
	return selectedTag.value === undefined;
});

const addTag = () => {
	const newTagsList = [...displayedEditingTags.value, { ...editingTag.value, id: ulid() }];
	emits("updateTags", newTagsList);
};

// TODO: add form validation
const updateTag = () => {
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
						<VChipGroup v-model="selectedTag" column>
							<VChip
								v-for="tag in displayedEditingTags"
								:key="tag.id"
								:value="tag"
								:color="tag.color ? tag.color : undefined"
								variant="flat"
							>
								{{ tag.label }}
							</VChip>
						</VChipGroup>
					</div>
				</div>
			</VCol>
			<VCol cols="12" md="9">
				<VCard>
					<VCardTitle>{{ isEditingNewTag ? "Add Tag" : "Edit Tag" }}</VCardTitle>
					<VTextField v-model="editingTag.label" label="Label" />
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
