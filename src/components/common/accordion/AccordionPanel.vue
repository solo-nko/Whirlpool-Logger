<script setup lang="ts">
import { injectionKey } from "@/components/common/accordion/CollapseItemListUtils.ts";

type AccordionPanelProps = {
	title?: string;
	value: string | number;
	action?: {
		showAction: boolean;
		actionText: string;
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
const titleEditing = ref(false);
const titleModel = ref<string>(title ?? "");
const emits = defineEmits<{
	updateTitle: [newTitle: string];
}>();

const onCancel = () => {
	titleModel.value = title ?? "";
	titleEditing.value = false;
};

const onSave = () => {
	emits("updateTitle", titleModel.value);
	titleEditing.value = false;
};
</script>

<template>
	<div class="panel-container">
		<!-- Title area-->
		<div class="flex justify-between items-center mb-3">
			<!-- Title -->
			<div class="title">
				<VTextField
					v-model="titleModel"
					:readonly="titleEditing === false"
					hide-details
					density="compact"
				>
					<template v-slot:append-inner>
						<VIcon v-if="!titleEditing" icon="$edit" @click="() => (titleEditing = true)" />
						<VIcon v-else icon="$editOff" @click="onCancel()" />
					</template>
					<template v-slot:append>
						<VIcon v-if="titleEditing" icon="$save" @click="onSave()" />
					</template>
				</VTextField>
			</div>
			<div class="flex items-center gap-1">
				<!-- Action -->
				<div v-if="action?.showAction">
					<button @click.prevent="action.onClickAction()">
						{{ action.actionText ?? "Action" }}
					</button>
				</div>
				<!-- Collapse/Open-->
				<div>
					<button @click.prevent="parentData?.TogglePanel(value)">
						{{ isOpen ? "Close" : "Open" }}
					</button>
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
.panel-container {
	flex: 1;
}

.title {
	width: 35%;
}

@media screen and (max-width: 600px) {
	.title {
		width: 50%;
	}
}

@media screen and (max-width: 400px) {
	.title {
		width: unset;
		flex: 1;
	}
}

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
