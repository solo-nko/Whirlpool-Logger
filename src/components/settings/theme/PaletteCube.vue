<script setup lang="ts">
type PaletteCubeProps = {
	primaryColor: string;
	secondaryColor: string;
	thirdColor: string;
	label: string;
};

const { primaryColor, secondaryColor, thirdColor, label } = defineProps<PaletteCubeProps>();
</script>

<template>
	<VCard class="p-5 inline-flex flex-col items-center">
		<div class="grid grid-cols-2 h-20 w-20 border-dotted border">
			<div class="palette-primary col-span-2" />
			<div class="palette-secondary" />
			<div class="palette-tertiary" />
		</div>
		<div>{{ label }}</div>
	</VCard>
</template>

<style scoped>
.palette-primary {
	background-color: v-bind(primaryColor);
}

.palette-secondary {
	background-color: v-bind(secondaryColor);
}

.palette-tertiary {
	background-color: v-bind(thirdColor);
}
</style>
