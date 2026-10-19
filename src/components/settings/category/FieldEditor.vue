<script setup lang="ts">
import { ulid } from "ulid";
import { FieldType, type IEditingField } from "@/utils/types/IField.ts";
import { GetFieldRules, HasValue } from "@/utils/MiscUtils.ts";
import useSettingsStore from "@/stores/settings.ts";

type FieldEditorProps = {
	fieldData?: IEditingField;
};
const blankField: IEditingField = {
	id: "new",
	label: "",
	type: FieldType.TEXT,
	placeholder: undefined,
	hideInEntryForm: false,
	maxLength: undefined,
	deleted: false,
	updated: true,
	hideInTable: true
};

const settingsStore = useSettingsStore();

const props = defineProps<FieldEditorProps>();
const isNewField = computed(() => props.fieldData === undefined);
const emits = defineEmits<{
	updateField: [updated: IEditingField];
	addField: [added: IEditingField];
	removeField: [removed: IEditingField];
}>();

const fieldModel = ref<IEditingField>(
	props.fieldData
		? {
				id: props.fieldData.id,
				label: props.fieldData.label,
				type: props.fieldData.type,
				placeholder: props.fieldData.placeholder,
				hideInEntryForm: props.fieldData.hideInEntryForm,
				maxLength: props.fieldData.maxLength,
				deleted: false,
				updated: false,
				hideInTable: true
			}
		: blankField
);
const formValidationStatus = ref(false);
const formRef = ref();
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

const maxLengthApplicable = computed(() => fieldModel.value.type === FieldType.TEXT);

const undoChanges = () => {
	// return to the state of the initial prop value
	if (props.fieldData)
		fieldModel.value = {
			id: props.fieldData.id,
			label: props.fieldData.label,
			type: props.fieldData.type,
			placeholder: props.fieldData.placeholder,
			hideInEntryForm: props.fieldData.hideInEntryForm,
			maxLength: props.fieldData.maxLength,
			deleted: false,
			updated: false,
			hideInTable: true
		};
	deleteButtonStatus.value = "normal";
};

const addField = async () => {
	if (!formValidationStatus.value) {
		settingsStore.DisplayToast("A required field is missing, or a field has invalid input.");
		if (formRef.value) await formRef.value.validate();
		return;
	}
	emits("addField", { ...fieldModel.value, id: ulid() });
	fieldModel.value = blankField;
};

const updateField = async () => {
	if (!formValidationStatus.value) {
		settingsStore.DisplayToast("A required field is missing, or a field has invalid input.");
		if (formRef.value) await formRef.value.validate();
		return;
	}
	fieldModel.value.updated = true;
	emits("updateField", { ...fieldModel.value, updated: true });
};

const removeField = () => {
	deleteButtonStatus.value = "confirm";
};

const reallyRemoveField = () => {
	fieldModel.value.deleted = true;
	emits("removeField", { ...fieldModel.value, deleted: true });
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
						:rules="[(value: string) => HasValue({ input: value, fieldName: 'Label' })]"
					/>
				</VCol>
			</VRow>
			<VRow v-if="maxLengthApplicable">
				<VCol>
					<VNumberInput
						v-model="fieldModel.maxLength"
						density="compact"
						label="Max Characters (Optional)"
						:min="0"
						messages="Setting this to 0 causes it to have no effect."
					/>
				</VCol>
			</VRow>
			<VRow>
				<VCol>
					<VTextField
						v-model="fieldModel.placeholder"
						density="compact"
						label="Details (Optional)"
						messages="Add explanatory details."
					/>
				</VCol>
			</VRow>

			<!--		Desktop layout -->
			<VRow v-if="!settingsStore.display.mobile" class="items-center">
				<VCol cols="6">
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
				<VCol cols="6">
					<VSwitch v-model="fieldModel.required" hide-details>
						<template v-slot:label>Required</template>
					</VSwitch>
					<VSwitch v-model="fieldModel.hideInEntryForm" hide-details>
						<!-- TODO: mess with the orientation of this to work better on mobile -->
						<template v-slot:label><div>Hide from Entry view</div></template>
					</VSwitch>
					<VSwitch v-model="fieldModel.hideInTable" hide-details>
						<template v-slot:label><div>Hide from Records view</div></template>
					</VSwitch>
				</VCol>
			</VRow>
			<template v-else>
				<VRow>
					<VCol>
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
				</VRow>
				<VRow class="mt-0 mb-3">
					<VCol>
						<VSwitch v-model="fieldModel.required" hide-details>
							<template v-slot:label>Required</template>
						</VSwitch>
						<VSwitch v-model="fieldModel.hideInEntryForm" hide-details>
							<template v-slot:label><div>Hide from Entry view</div></template>
						</VSwitch>
						<VSwitch v-model="fieldModel.hideInTable" hide-details>
							<template v-slot:label><div>Hide from Records view</div></template>
						</VSwitch>
					</VCol>
				</VRow>
			</template>
		</VForm>
		<div>Preview</div>
		<VTextField
			v-if="fieldModel.type === FieldType.TEXT"
			:label="fieldModel.label"
			:messages="fieldModel.placeholder"
			:counter="fieldModel.maxLength && fieldModel.maxLength > 0"
			:rules="GetFieldRules(fieldModel)"
		/>
		<VNumberInput
			v-else-if="fieldModel.type === FieldType.NUMBER"
			:label="fieldModel.label"
			:messages="fieldModel.placeholder"
			:rules="GetFieldRules(fieldModel)"
		/>
		<VTextField
			v-else-if="fieldModel.type === FieldType.DATE"
			:label="fieldModel.label"
			:messages="fieldModel.placeholder"
			type="date"
			:rules="GetFieldRules(fieldModel)"
		/>
		<VCheckbox
			v-else-if="fieldModel.type === FieldType.BOOL"
			:label="fieldModel.label"
			:messages="fieldModel.placeholder"
		/>

		<!--		Desktop Layout -->
		<div v-if="!settingsStore.display.mobile" class="flex justify-end">
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

		<!--		Mobile Layout -->
		<div v-else class="flex flex-col items-center gap-2">
			<div v-if="!isNewField" class="w-full">
				<VBtn v-if="deleteButtonStatus === 'normal'" class="w-full" @click="removeField">
					<template v-slot:prepend> <VIcon icon="$close" /></template>
					Delete
				</VBtn>
				<VBtn v-else class="w-full" @click="reallyRemoveField()">
					<template v-slot:prepend> <VIcon icon="$close" /></template>
					Are you sure?
				</VBtn>
			</div>

			<VBtn v-if="!isNewField" class="w-full" @click="undoChanges">
				<template v-slot:prepend>
					<VIcon icon="$revert" />
				</template>
				Revert
			</VBtn>
			<VBtn class="w-full" @click="isNewField ? addField() : updateField()">
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
