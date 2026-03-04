<script setup lang="ts">
import { ulid } from "ulid";
import { FieldType, type IField } from "@/utils/types/IField.ts";

type FieldEditorProps = {
	/** Whether this is a default field or not.	 */
	default: boolean;
	fieldData?: IField;
};

const props = defineProps<FieldEditorProps>();
const isNewField = computed(() => props.fieldData === undefined);

const fieldModel = ref<IField>(
	props.fieldData
		? structuredClone(toRaw(props.fieldData))
		: {
				id: ulid(),
				label: "",
				type: FieldType.STRING,
				placeholder: "",
				hidden: false
			}
);

const translatedLabels = [
	{
		type: FieldType.STRING,
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

function UndoChanges() {
	if (props.fieldData) fieldModel.value = structuredClone(toRaw(props.fieldData));
}
</script>

<template>
	<VContainer>
		<VTextField v-model="fieldModel.label" density="compact" label="Label" />
		<VTextField v-model="fieldModel.placeholder" density="compact" label="Placeholder (optional)" />
		<VRow class="items-center">
			<VCol cols="8">
				<VRadioGroup v-if="!props.default" v-model="fieldModel.type" inline>
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
			v-if="fieldModel.type === FieldType.STRING"
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
			<VBtn v-if="!props.default && !isNewField">
				<template v-slot:prepend> <VIcon icon="mdi-close" /></template>
				Delete
			</VBtn>
			<VBtn v-if="!isNewField" class="ml-3" @click="UndoChanges">
				<template v-slot:prepend>
					<VIcon icon="mdi-arrow-u-left-top" />
				</template>
				Revert
			</VBtn>
			<VBtn class="ml-3">
				<template v-slot:prepend>
					<VIcon v-if="isNewField" icon="mdi-plus" />
					<VIcon v-else icon="mdi-check" />
				</template>
				<template #default>
					{{ isNewField ? "Add" : "Save" }}
				</template>
			</VBtn>
		</div>
	</VContainer>
</template>

<style scoped></style>
