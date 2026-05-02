<script setup lang="ts">
type ConfirmCardProps = {
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
};

const { title, message, confirmText, cancelText } = defineProps<ConfirmCardProps>();
defineEmits(["ok", "cancel"]);
</script>

<template>
	<VCard>
		<VCardTitle>{{ title }}</VCardTitle>
		<VCardText>{{ message }}</VCardText>
		<VCardActions>
			<VBtn @click="$emit('ok')">{{ confirmText ?? "Confirm" }}</VBtn>
			<VBtn @click="$emit('cancel')">{{ cancelText ?? "Cancel" }}</VBtn>
		</VCardActions>
	</VCard>
</template>

<style scoped></style>
