<script setup lang="ts">
import { injectionKey } from "@/components/common/accordion/CollapseItemListUtils.ts";

type CollapseListItemProps = {
	title?: string;
	value: string | number;
};
const parentData = inject(injectionKey);
const { title, value } = defineProps<CollapseListItemProps>();
const isOpen = computed(() => parentData?.openPanel.value === value);
</script>

<template>
	<div>
		<!-- Title area-->
		<div class="flex justify-between items-center">
			<!-- Title -->
			<div>{{ title }}</div>
			<div class="flex items-center gap-1">
				<!-- Action -->
				<div>
					<button>Action</button>
				</div>
				<!-- Collapse/Open-->
				<div>
					<button @click="parentData?.TogglePanel(value)">Open</button>
				</div>
			</div>
		</div>
		<!-- Content area -->
		<div v-if="isOpen">
			<slot></slot>
		</div>
	</div>
</template>

<style scoped></style>
