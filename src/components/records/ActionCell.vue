<script setup lang="ts">
import type { ICellRendererParams } from "ag-grid-community";
import type { WhirlpoolLog } from "@/utils/types/WhirlpoolLog.ts";

interface ActionCellProps extends ICellRendererParams<WhirlpoolLog> {
	onEdit: (rowData: WhirlpoolLog | undefined) => void;
	onDelete: (rowData: WhirlpoolLog | undefined) => void;
}

const { params } = defineProps<{ params: ActionCellProps }>();
</script>

<template>
	<VBtnGroup>
		<VBtn icon="$edit" @click="params.onEdit(params.data)" />
		<VBtn icon="$trash" @click="params.onDelete(params.data)" />
	</VBtnGroup>
</template>

<style scoped></style>
