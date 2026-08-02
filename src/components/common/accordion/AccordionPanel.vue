<script setup lang="ts">
import { injectionKey } from "@/components/common/accordion/CollapseItemListUtils.ts";

type AccordionPanelProps = {
	title?: string;
	value: string | number;
	action?: {
		showAction: boolean;
		onClickAction: () => void;
	};
	/** Justify-contents property value to apply to contents */
	justify?:
		| "flex-start"
		| "flex-end"
		| "space-between"
		| "space-around"
		| "space-evenly"
		| "center";
};
const parentData = inject(injectionKey);
const { title, value, justify, action } = defineProps<AccordionPanelProps>();
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
				<div v-if="action?.showAction">
					<button @click="action.onClickAction()">Action</button>
				</div>
				<!-- Collapse/Open-->
				<div>
					<button @click="parentData?.TogglePanel(value)">Open</button>
				</div>
			</div>
		</div>
		<!-- Content area -->
		<Transition>
			<div v-if="isOpen" class="panel-body">
				<slot></slot>
			</div>
		</Transition>
	</div>
</template>

<style scoped>
.panel-body {
	overflow: hidden;
	display: flex;
	justify-content: v-bind('justify ?? "center"');
}

.v-enter-from,
.v-leave-to {
	opacity: 0;
}

.v-enter-to,
.v-leave.from {
	opacity: 1;
}

.v-enter-active,
.v-leave-active {
	transition:
		opacity 0.3s,
		max-height 0.3s,
		transform 0.3s;
}

.v-leave-to,
.v-enter-from {
	transform: translateY(-30%);
}
</style>
