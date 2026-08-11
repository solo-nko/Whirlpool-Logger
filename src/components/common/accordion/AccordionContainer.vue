<script setup lang="ts">
import { injectionKey } from "@/components/common/accordion/CollapseItemListUtils.ts";

/** Which panel is open atm */
const openPanel = ref<number | string | null>(null);

/** Toggles panel open or closed */
function TogglePanel(key: number | string) {
	if (openPanel.value === key) openPanel.value = null;
	else openPanel.value = key;
}

// similar to useContext in React
provide(injectionKey, {
	openPanel,
	TogglePanel
});
</script>

<template>
	<div class="flex flex-col items-stretch flex-auto">
		<slot />
	</div>
</template>

<style scoped>
.slot-container {
	flex: 1;
}
</style>
