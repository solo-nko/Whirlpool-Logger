<script setup lang="ts">
import type { ICategory } from "@/utils/types/ICategory.ts";
import FieldEditor from "@/components/FieldEditor.vue";
import DefaultFieldEditor from "@/components/DefaultFieldEditor.vue";

type CategoryEditorProps = {
	category: ICategory;
};

const props = defineProps<CategoryEditorProps>();
const editingModel = ref<ICategory>(props.category);

watch(
	() => props.category,
	(newValue) => {
		if (newValue) {
			editingModel.value = { ...newValue };
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
					v-model="editingModel.order"
					type="number"
					label="Display Order"
					control-variant="stacked"
				/>
			</VRow>

			<VExpansionPanels>
				<VExpansionPanel
					v-for="(modifiedDefault, index) in editingModel.modifiedFields"
					:key="index"
				>
					<VExpansionPanelTitle>{{ modifiedDefault.field }} (Default Field)</VExpansionPanelTitle>
					<VExpansionPanelText>
						<DefaultFieldEditor :field-data="modifiedDefault" />
					</VExpansionPanelText>
				</VExpansionPanel>
				<VExpansionPanel v-for="field in editingModel.extraFields" :key="field.id">
					<VExpansionPanelTitle>{{ field.label }}</VExpansionPanelTitle>
					<VExpansionPanelText>
						<FieldEditor :default="false" :field-data="field" />
					</VExpansionPanelText>
				</VExpansionPanel>
				<VExpansionPanel>
					<VExpansionPanelTitle>Add New Field</VExpansionPanelTitle>
					<VExpansionPanelText>
						<FieldEditor :default="false" />
					</VExpansionPanelText>
				</VExpansionPanel>
			</VExpansionPanels>
		</VContainer>
		<VCardActions>
			<VBtn>Save</VBtn>
		</VCardActions>
	</VCard>
</template>

<style scoped></style>
