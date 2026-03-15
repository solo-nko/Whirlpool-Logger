<script setup lang="ts">
import type { DefaultField } from "@/utils/types/ICategory.ts";

type FieldEditorProps = {
	fieldData: DefaultField;
};

const { fieldData } = defineProps<FieldEditorProps>();
const emits = defineEmits(["updateField"]);
const fieldModel = ref<DefaultField>(structuredClone(toRaw(fieldData)));
const undoChanges = () => {
	if (fieldData) fieldModel.value = structuredClone(toRaw(fieldData));
};

const updateField = () => {
	emits("updateField", fieldModel.value);
};
</script>

<template>
	<VContainer>
		<VTextField v-model="fieldModel.rename" density="compact" label="Label" />
		<VRow class="items-center">
			<VSwitch v-model="fieldModel.hidden">
				<template v-slot:label><div>Hidden</div></template>
			</VSwitch>
		</VRow>
		<div class="flex justify-end">
			<VBtn class="ml-3" @click="undoChanges">
				<template v-slot:prepend>
					<VIcon icon="mdi-arrow-u-left-top" />
				</template>
				Revert
			</VBtn>
			<VBtn class="ml-3" @click="updateField">
				<template v-slot:prepend>
					<VIcon icon="mdi-check" />
				</template>
				<template #default> Save </template>
			</VBtn>
		</div>
	</VContainer>
</template>

<style scoped></style>
