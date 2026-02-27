<script setup lang="ts"></script>

<template>
	<VCard>
		<VCardTitle>Test Card</VCardTitle>
		<VContainer>
			<VRow>
				<VTextField label="Title"></VTextField>
			</VRow>
			<VRow>
				<VTextField label="Status"></VTextField>
			</VRow>
			<VRow>
				<VCol>
					<VNumberInput label="Chapter" control-variant="stacked" loading :min="0">
						<template v-slot:loader>
							<!--							TODO: experiment with this-->
							<VProgressLinear max="50"></VProgressLinear>
						</template>
					</VNumberInput>
				</VCol>
				<VCol>
					<VNumberInput label="Volume" control-variant="stacked" :min="0" />
				</VCol>
				<VCol>
					<VTextField label="Series"></VTextField>
				</VCol>
			</VRow>
			<VRow>
				<!-- TODO: Experiment with using date picker instead -->
				<VTextField type="date">
					<template v-slot:append>
						<VBtn>Today</VBtn>
					</template>
				</VTextField>
			</VRow>
		</VContainer>
		<VCardActions>
			<VBtn>Save</VBtn>
			<VBtn>Cancel</VBtn>
		</VCardActions>
	</VCard>
</template>

<style scoped></style>
