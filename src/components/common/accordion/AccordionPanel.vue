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
