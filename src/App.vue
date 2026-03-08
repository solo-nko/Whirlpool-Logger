<script setup lang="ts"></script>

<template>
	<VApp>
		<VAppBar>
			<VAppBarTitle>Whirlpool Logger</VAppBarTitle>
		</VAppBar>
		<VMain><RouterView /></VMain>
		<VBottomNavigation grow order="-1" tag="footer">
			<VBtn to="home">
				<VIcon icon="mdi-home" />
				<span>Home</span>
			</VBtn>
			<VBtn to="entry" icon="mdi-plus">
				<VIcon icon="mdi-plus" />
				<span>Entry</span>
			</VBtn>
			<VBtn to="records">
				<VIcon icon="mdi-table" />
				<span>Records</span>
			</VBtn>
			<VBtn to="settings">
				<VIcon icon="mdi-cog" />
				<span>Settings</span>
			</VBtn>
		</VBottomNavigation>
	</VApp>
</template>

<style scoped></style>
