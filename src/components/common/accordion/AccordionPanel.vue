<script setup lang="ts">
import { injectionKey } from "@/components/common/accordion/CollapseItemListUtils.ts";
import ActionButton from "@/components/common/accordion/ActionButton.vue";

export type Action = {
	showAction: boolean;
	actionText: string;
	onClickAction: (...params: never[]) => void;
	confirmText?: string;
};

type AccordionPanelProps = {
	title?: string;
	value: string | number;
	actions: Action[];
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
const { title, value, justify, actions } = defineProps<AccordionPanelProps>();

const isOpen = computed(() => parentData?.openPanels.value.includes(value));
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

const displayedActions = computed(() => actions.filter((action) => action.showAction));
</script>

<template>
	<div class="panel-container border border-current/50 rounded-lg">
		<!-- Title area-->
		<div class="flex justify-between items-center">
			<!-- Title -->
			<div class="title">
				<VTextField
					v-model="titleModel"
					:tabindex="titleEditing ? 0 : -1"
					:readonly="!titleEditing"
					hide-details
					density="compact"
					:variant="titleEditing ? 'outlined' : 'plain'"
					@keydown.enter.prevent="onSave()"
					@keydown.esc.prevent="onCancel()"
				>
					<template v-slot:append-inner>
						<VIcon
							v-if="!titleEditing"
							icon="$edit"
							tabindex="-1"
							@click="() => (titleEditing = true)"
						/>
						<VIcon v-else icon="$editOff" tabindex="-1" @click="onCancel()" />
					</template>
					<template v-slot:append>
						<VIcon v-if="titleEditing" icon="$save" @click="onSave()" />
					</template>
				</VTextField>
			</div>
			<div class="flex items-center gap-1">
				<!-- Actions -->
				<ActionButton
					v-for="(action, index) in displayedActions"
					:key="index"
					:default-text="action.actionText"
					:on-click="action.onClickAction"
					:confirm-text="action.confirmText"
				/>
				<!-- Collapse/Open-->
				<div>
					<VBtn variant="tonal" tabindex="-1" @click.prevent="parentData?.TogglePanel(value)">
						{{ isOpen ? "Close" : "Open" }}
					</VBtn>
				</div>
			</div>
		</div>
		<!-- Content area -->
		<Transition>
			<div v-if="isOpen" class="panel-body mt-3">
				<slot></slot>
			</div>
		</Transition>
	</div>
</template>

<style scoped>
.panel-container {
	flex: 1;
	padding: 0.5rem;
}

.title {
	width: fit-content;
	max-width: 50%;
	display: inline-flex;
}

.title :deep(.v-input),
.title :deep(.v-field),
.title :deep(.v-field__input) {
	width: fit-content;
	field-sizing: content;
	min-width: 4rem;
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
