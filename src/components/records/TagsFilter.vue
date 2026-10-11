<script setup lang="ts">
import { computed, ref } from "vue";
import type { FilterDisplayParams } from "ag-grid-community";
import type { ITag } from "@/utils/types/ITag.ts";
import type { WhirlpoolLog } from "@/utils/types/WhirlpoolLog.ts";
import type { Category } from "@/utils/types/Category.ts";
import type { TagFilterModel } from "@/components/records/GridUtils.ts";

interface CustomTagsFilterParams extends FilterDisplayParams<
	WhirlpoolLog,
	unknown,
	TagFilterModel
> {
	category: Category | undefined;
}

const props = defineProps<{
	params: CustomTagsFilterParams;
}>();
const selectedTags = ref<ITag[]>([]);
const requireAll = ref<boolean>(true);

const availableTags = computed<ITag[]>(() => {
	return props.params.category?.tags ?? [];
});

function UpdateModel() {
	const labels: string[] | null =
		selectedTags.value.length === 0 ? null : selectedTags.value.map((tag) => tag.id);
	const newModel: TagFilterModel =
		labels === null ? null : { filterTagLabels: labels, and: requireAll.value };
	props.params.onModelChange(newModel);
}

watch(selectedTags, () => {
	UpdateModel();
});

watch(requireAll, () => {
	UpdateModel();
});
</script>

<template>
	<div class="p-3 min-w-[280px]">
		<VAutocomplete
			v-model="selectedTags"
			:items="availableTags"
			label="Tags"
			chips
			clearable
			closable-chips
			multiple
			item-title="label"
			return-object
			no-data-text="No tags available. Create some in Category Settings."
			density="compact"
			hide-details
			:menu-props="{ contentClass: 'ag-custom-component-popup' }"
		>
			<template v-slot:chip="{ props: chipProps, item }">
				<VChip
					v-bind="chipProps"
					:color="item.color ?? undefined"
					size="small"
					density="compact"
					variant="flat"
				/>
			</template>
			<template v-slot:append>
				<VCheckbox v-model="requireAll" label="Match all" hide-details />
			</template>
		</VAutocomplete>
	</div>
</template>

<style scoped></style>
