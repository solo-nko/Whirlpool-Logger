<script setup lang="ts">
import { injectionKey } from "@/components/common/accordion/CollapseItemListUtils.ts";

const openPanel = ref<number | string | null>(null);

function TogglePanel(key: number | string) {
	if (openPanel.value === key) openPanel.value = null;
	else openPanel.value = key;
}

provide(injectionKey, {
	openPanel,
	TogglePanel
});
</script>

<template>
	<div>
		<slot />
	</div>
</template>

<style scoped></style>
