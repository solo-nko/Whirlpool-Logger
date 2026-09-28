<script setup lang="ts">
import type { ICellRendererParams } from "ag-grid-community";
import type { WhirlpoolLog } from "@/utils/types/WhirlpoolLog.ts";

const { params } = defineProps<{ params: ICellRendererParams<WhirlpoolLog> }>();
</script>

<template>
	<div
		v-if="params.data && params.data.tags.length > 0"
		class="flex flex-wrap items-center gap-1 justify-center content-center"
	>
		<VChip
			v-for="tag in params.data.tags.slice(0, 3)"
			:key="tag.id"
			:color="tag.color ?? undefined"
			size="small"
			density="compact"
			variant="flat"
		>
			{{ tag.label }}
		</VChip>
	</div>
	<div v-else class="italic">No tags</div>
</template>

<style scoped></style>
