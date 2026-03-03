<script setup lang="ts">
import TipTapEditor from "@/components/TipTapEditor.vue"
import type { ICategory } from "@/utils/types/ICategory.ts"
import type { IWhirlpoolLog } from "@/utils/types/IWhirlpoolLog.ts"

type EntryFormProps = {
	category?: ICategory
	existingEntry?: IWhirlpoolLog
}

const isEditMode = computed(() => props.existingEntry !== undefined)
const chapterFieldMods = computed(() => {
	if (!props.category) return null
	// TODO: can prolly turn this into a shared function
	const fieldMod = props.category.modifiedFields.find((field) => field.field === "chapter")
	if (!fieldMod) return null
	return fieldMod
})

const props = defineProps<EntryFormProps>()
</script>

<template>
	<VCard>
		<VCardTitle>{{ isEditMode ? "Edit Entry" : "Add Entry" }}</VCardTitle>
		<VContainer>
			<VRow>
				<VTextField label="Title"></VTextField>
			</VRow>
			<VRow>
				<VAutocomplete label="Status" :items="props.category?.statuses ?? []" item-title="name" />
			</VRow>
			<VRow>
				<VCol v-if="chapterFieldMods?.hidden !== true">
					<VNumberInput label="Chapter" control-variant="stacked" loading :min="0">
						<template v-slot:loader>
							<!--							TODO: experiment with this-->
							<VProgressLinear max="50"></VProgressLinear>
						</template>
					</VNumberInput>
				</VCol>
				<VCol>
					<VNumberInput label="Volume" control-variant="stacked" :min="0" />
				</VCol>
				<VCol>
					<VTextField label="Series"></VTextField>
				</VCol>
			</VRow>
			<VRow>
				<TipTapEditor />
			</VRow>
			<VRow>
				<!-- TODO: Experiment with using date picker instead -->
				<VTextField type="date">
					<template v-slot:append>
						<VBtn>Today</VBtn>
					</template>
				</VTextField>
			</VRow>
		</VContainer>
		<VCardActions>
			<VBtn>Save</VBtn>
			<VBtn v-if="isEditMode">Cancel</VBtn>
		</VCardActions>
	</VCard>
</template>

<style scoped></style>
