<script setup lang="ts">
import type { ICellRendererParams } from "ag-grid-community";
import type { WhirlpoolLog } from "@/utils/types/WhirlpoolLog.ts";

const { params } = defineProps<{ params: ICellRendererParams<WhirlpoolLog> }>();
</script>

<template>
	<VProgressCircular v-if="params.data?.rating" :model-value="params.data.rating * 10" rounded>
		{{ params.data.rating }}
	</VProgressCircular>
	<span v-else class="italic">No Rating</span>
</template>

<style scoped></style>
