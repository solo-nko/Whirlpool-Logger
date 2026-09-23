<script setup lang="ts">
import { injectionKey } from "@/components/common/accordion/CollapseItemListUtils";

type AccordionContainerProps = {
	/** Open multiple panels at once */
	multiOpen?: boolean;
	defaultOpenPanels?: (string | number)[];
};

const { multiOpen, defaultOpenPanels } = defineProps<AccordionContainerProps>();
/** Which panel is open atm */
const openPanels = ref<(number | string)[]>(defaultOpenPanels ?? []);

/** Toggles panel open or closed */
function TogglePanel(key: number | string) {
	// If panel is open, close it
	if (openPanels.value.includes(key)) {
		openPanels.value = openPanels.value.filter((panelKey) => panelKey !== key);
	}
	// If panel is closed, open it
	else {
		if (multiOpen) {
			openPanels.value.push(key);
		} else {
			openPanels.value = [key];
		}
	}
}

// similar to useContext in React
provide(injectionKey, {
	openPanels,
	TogglePanel
});
</script>

<template>
	<div class="flex flex-col gap-3 items-stretch flex-auto">
		<slot />
	</div>
</template>

<style scoped>
.slot-container {
	flex: 1;
}
</style>
