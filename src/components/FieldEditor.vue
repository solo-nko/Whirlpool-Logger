<script setup lang="ts">
import { ulid } from "ulid";
import { FieldType, type IField } from "@/utils/types/IField.ts";

type FieldEditorProps = {
	fieldData?: IField;
};
const blankField: IField = {
	id: ulid(),
	label: "",
	type: FieldType.TEXT,
	placeholder: "",
	hidden: false
};

const props = defineProps<FieldEditorProps>();
const isNewField = computed(() => props.fieldData === undefined);
const emits = defineEmits(["updateField", "addField", "removeField"]);

const fieldModel = ref<IField>(
	props.fieldData ? structuredClone(toRaw(props.fieldData)) : blankField
);

const translatedLabels = [
	{
		type: FieldType.TEXT,
		label: "Text"
	},
	{
		type: FieldType.BOOL,
		label: "Checkbox"
	},
	{
		type: FieldType.DATE,
		label: "Date"
	},
	{
		type: FieldType.NUMBER,
		label: "Number"
	}
];

const undoChanges = () => {
	if (props.fieldData) fieldModel.value = structuredClone(toRaw(props.fieldData));
};

const addField = () => {
	emits("addField", fieldModel.value);
	fieldModel.value = blankField;
};

const updateField = () => {
	emits("updateField", fieldModel.value);
};

const removeField = () => {
	emits("removeField", fieldModel.value);
};
</script>

<template>
	<VContainer>
		<VTextField v-model="fieldModel.label" density="compact" label="Label" />
		<VTextField v-model="fieldModel.placeholder" density="compact" label="Placeholder (Optional)" />
		<VRow class="items-center">
			<VCol cols="8">
				<VRadioGroup v-model="fieldModel.type" inline>
					<template v-slot:label>
						<div>Field Type</div>
					</template>
					<VRadio
						v-for="label in translatedLabels"
						:key="label.type"
						:value="label.type"
						:label="label.label"
					/>
				</VRadioGroup>
			</VCol>
			<VCol cols="4">
				<VSwitch v-model="fieldModel.hidden">
					<!-- TODO: mess with the orientation of this to work better on mobile -->
					<template v-slot:label><div>Hidden</div></template>
				</VSwitch>
			</VCol>
		</VRow>
		<div>Preview</div>
		<VTextField
			v-if="fieldModel.type === FieldType.TEXT"
			:label="fieldModel.label"
			:placeholder="fieldModel.placeholder"
		/>
		<VNumberInput v-else-if="fieldModel.type === FieldType.NUMBER" :label="fieldModel.label" />
		<VTextField
			v-else-if="fieldModel.type === FieldType.DATE"
			:label="fieldModel.label"
			type="date"
		/>
		<VCheckbox v-else-if="fieldModel.type === FieldType.BOOL" :label="fieldModel.label" />

		<div class="flex justify-end">
			<VBtn v-if="!isNewField" @click="removeField">
				<template v-slot:prepend> <VIcon icon="$close" /></template>
				Delete
			</VBtn>
			<VBtn v-if="!isNewField" class="ml-3" @click="undoChanges">
				<template v-slot:prepend>
					<VIcon icon="$revert" />
				</template>
				Revert
			</VBtn>
			<VBtn class="ml-3" @click="isNewField ? addField() : updateField()">
				<template v-slot:prepend>
					<VIcon v-if="isNewField" icon="$plus" />
					<VIcon v-else icon="$check" />
				</template>
				<template #default>
					{{ isNewField ? "Add" : "Save" }}
				</template>
			</VBtn>
		</div>
	</VContainer>
</template>

<style scoped></style>
