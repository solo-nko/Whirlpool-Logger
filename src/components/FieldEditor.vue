<script setup lang="ts">
import { ulid } from "ulid";
import { FieldType, type IField } from "@/utils/types/IField.ts";
import { GetFieldRules, HasValue, TOAST_TIMEOUT } from "@/utils/Utilities.ts";

type FieldEditorProps = {
	fieldData?: IField;
};
const blankField: IField = {
	id: ulid(),
	label: "",
	type: FieldType.TEXT,
	placeholder: undefined,
	hidden: false,
	maxLength: undefined
};

const props = defineProps<FieldEditorProps>();
const isNewField = computed(() => props.fieldData === undefined);
const emits = defineEmits(["updateField", "addField", "removeField"]);

const fieldModel = ref<IField>(
	props.fieldData ? structuredClone(toRaw(props.fieldData)) : blankField
);
const formValidationStatus = ref(false);
const formRef = ref();
const validationToastDisplayed = ref(false);

const maxLengthApplicable = computed(() => fieldModel.value.type === FieldType.TEXT);

const deleteButtonStatus = ref<"normal" | "confirm">("normal");

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
	deleteButtonStatus.value = "normal";
};

const addField = async () => {
	if (!formValidationStatus.value) {
		validationToastDisplayed.value = true;
		if (formRef.value) await formRef.value.validate();
		return;
	}
	emits("addField", fieldModel.value);
	fieldModel.value = blankField;
};

const updateField = async () => {
	if (!formValidationStatus.value) {
		validationToastDisplayed.value = true;
		if (formRef.value) await formRef.value.validate();
		return;
	}
	emits("updateField", fieldModel.value);
};

const removeField = () => {
	deleteButtonStatus.value = "confirm";
};

const reallyRemoveField = () => {
	emits("removeField", fieldModel.value);
	deleteButtonStatus.value = "normal";
};
</script>

<template>
	<VContainer>
		<VForm ref="formRef" v-model="formValidationStatus">
			<VRow>
				<VCol>
					<VTextField
						v-model="fieldModel.label"
						density="compact"
						label="Label"
						:rules="[(value: string) => HasValue(value, 'Label')]"
					/>
				</VCol>
			</VRow>
			<VRow>
				<!--			TODO: WIP -->
				<!--			<VCol>-->
				<!--				<VTextField-->
				<!--					v-model="fieldModel.placeholder"-->
				<!--					density="compact"-->
				<!--					label="Placeholder (Optional)"-->
				<!--					messages="Default value to use."-->
				<!--				/>-->
				<!--			</VCol>-->
				<VCol>
					<VNumberInput
						v-if="maxLengthApplicable"
						v-model="fieldModel.maxLength"
						density="compact"
						label="Max Characters (Optional)"
						:min="0"
						messages="Setting this to 0 causes it to have no effect."
					/>
				</VCol>
			</VRow>

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
				<VCol cols="2">
					<VSwitch v-model="fieldModel.required">
						<template v-slot:label>Required</template>
					</VSwitch>
				</VCol>
				<VCol cols="2">
					<VSwitch v-model="fieldModel.hidden">
						<!-- TODO: mess with the orientation of this to work better on mobile -->
						<template v-slot:label><div>Hidden</div></template>
					</VSwitch>
				</VCol>
			</VRow>
		</VForm>
		<div>Preview</div>
		<VTextField
			v-if="fieldModel.type === FieldType.TEXT"
			:label="fieldModel.label"
			:placeholder="fieldModel.placeholder"
			:counter="fieldModel.maxLength && fieldModel.maxLength > 0"
			:rules="GetFieldRules(fieldModel)"
		/>
		<VNumberInput
			v-else-if="fieldModel.type === FieldType.NUMBER"
			:label="fieldModel.label"
			:rules="GetFieldRules(fieldModel)"
		/>
		<VTextField
			v-else-if="fieldModel.type === FieldType.DATE"
			:label="fieldModel.label"
			type="date"
			:rules="GetFieldRules(fieldModel)"
		/>
		<VCheckbox v-else-if="fieldModel.type === FieldType.BOOL" :label="fieldModel.label" />

		<div class="flex justify-end">
			<div v-if="!isNewField">
				<VBtn v-if="deleteButtonStatus === 'normal'" @click="removeField">
					<template v-slot:prepend> <VIcon icon="$close" /></template>
					Delete
				</VBtn>
				<VBtn v-else @click="reallyRemoveField()">
					<template v-slot:prepend> <VIcon icon="$close" /></template>
					Are you sure?
				</VBtn>
			</div>

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
	<VSnackbar v-model="validationToastDisplayed" :timeout="TOAST_TIMEOUT">
		A required field is missing, or a field has invalid input.
	</VSnackbar>
</template>

<style scoped></style>
