<script setup lang="ts">
import type { DefaultField } from "@/utils/DefaultFieldUtils.ts";
import { HasValue } from "@/utils/MiscUtils.ts";

type FieldEditorProps = {
	fieldData: DefaultField;
};

const { fieldData } = defineProps<FieldEditorProps>();
const emits = defineEmits<{ updateField: [updated: DefaultField] }>();
const fieldModel = ref<DefaultField>(structuredClone(toRaw(fieldData)));
const undoChanges = () => {
	if (fieldData) fieldModel.value = structuredClone(toRaw(fieldData));
};
const formRef = ref();
const formValidationStatus = ref<boolean>(false);

const updateField = () => {
	emits("updateField", fieldModel.value);
};
</script>

<template>
	<VContainer>
		<VForm ref="formRef" v-model="formValidationStatus">
			<VTextField
				v-model="fieldModel.rename"
				density="compact"
				label="Label"
				:rules="[(value: string) => HasValue({ input: value, fieldName: 'Label' })]"
			/>
			<VRow class="items-center">
				<VSwitch v-model="fieldModel.hideInEntryForm">
					<template v-slot:label><div>Hide from Entry view</div></template>
				</VSwitch>
				<VSwitch v-model="fieldModel.hideInTable">
					<template v-slot:label><div>Hide from Records view</div></template>
				</VSwitch>
			</VRow>
			<div class="flex justify-end">
				<VBtn class="ml-3" @click="undoChanges">
					<template v-slot:prepend>
						<VIcon icon="$revert" />
					</template>
					Revert
				</VBtn>
				<VBtn class="ml-3" @click="updateField">
					<template v-slot:prepend>
						<VIcon icon="$check" />
					</template>
					<template #default> Save </template>
				</VBtn>
			</div>
		</VForm>
	</VContainer>
</template>

<style scoped></style>
