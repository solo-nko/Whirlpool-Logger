<script setup lang="ts">
type ActionButtonProps = {
	defaultText: string;
	confirmText?: string;
	onClick: (...params: never[]) => void;
};

const { defaultText, confirmText, onClick } = defineProps<ActionButtonProps>();
const showConfirm = ref(false);
const onClickDefault = () => {
	if (confirmText) {
		showConfirm.value = true;
	} else {
		onClick();
	}
};
</script>

<template>
	<VBtn v-if="showConfirm === false" variant="text" tabindex="-1" @click.prevent="onClickDefault()">
		{{ defaultText }}
	</VBtn>
	<!--	Implement fade transition -->
	<VBtn
		v-else
		variant="text"
		tabindex="-1"
		@click.prevent="
			() => {
				showConfirm = false;
				onClick();
			}
		"
	>
		{{ confirmText ?? "Confirm?" }}
	</VBtn>
</template>

<style scoped></style>
