<script setup lang="ts">
import { ulid } from "ulid";
import type { ITag } from "@/utils/types/ITag.ts";

type TagEditorProps = {
	tags: ITag[];
};

const newTag: ITag = { id: "new", label: "", color: "", description: "" };
const { tags } = defineProps<TagEditorProps>();
const emits = defineEmits(["updateTags"]);

const editingTags = ref<ITag[]>(structuredClone(toRaw(tags)));
const selectedTag = ref<ITag>();
const editingTag = ref<ITag>(newTag);

const isEditingNewTag = computed<boolean>(() => {
	return selectedTag.value === undefined;
});

const addTag = () => {
	editingTags.value.push({ ...editingTag.value, id: ulid() });
	emits("updateTags", toRaw(editingTags.value));
};

// TODO: add form validation
const updateTag = () => {
	editingTags.value = editingTags.value.map((tag) => {
		if (editingTag.value.id === tag.id) return editingTag.value;
		return tag;
	});
	editingTag.value = newTag;
	selectedTag.value = undefined;
	emits("updateTags", toRaw(editingTags.value));
};

const deleteTag = () => {
	selectedTag.value = undefined;
	editingTags.value = editingTags.value.filter((tag) => {
		return tag.id !== editingTag.value.id;
	});
	emits("updateTags", toRaw(editingTags.value));
};

watch(
	() => tags,
	(newTags) => {
		editingTags.value = newTags.slice();
	}
);
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
					<div v-if="editingTags.length === 0" class="self-center grow text-center">
						No Tags Currently
					</div>
					<div v-else>
						<VChipGroup v-model="selectedTag" column>
							<VChip
								v-for="tag in editingTags"
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
