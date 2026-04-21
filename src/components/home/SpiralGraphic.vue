<script setup lang="ts">
type SpiralGraphicProps = {
	strokeColor?: string;
};

const { strokeColor } = defineProps<SpiralGraphicProps>();
</script>

<template>
	<svg
		class="whirlpool-icon"
		viewBox="0 0 1080 1080"
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
		xml:space="preserve"
		xmlns:serif="http://www.serif.com/"
		style="
			fill-rule: evenodd;
			clip-rule: evenodd;
			stroke-linecap: round;
			stroke-linejoin: round;
			stroke-miterlimit: 1.5;
		"
	>
		<g transform="matrix(1.03523e-16,1.6577,-1.6577,1.03523e-16,540,540)">
			<path
				d="M315.412,0C315.412,174.197 174.197,315.412 -0,315.412C-163.95,315.412 -296.858,182.504 -296.858,18.554C-296.858,-134.467 -172.811,-258.514 -19.791,-258.514C122.3,-258.514 237.487,-143.327 237.487,-1.237C237.487,129.923 131.16,236.25 -0,236.25C-120.23,236.25 -217.696,138.784 -217.696,18.554C-217.696,-90.747 -129.091,-179.352 -19.791,-179.352C78.58,-179.352 158.325,-99.607 158.325,-1.237C158.324,86.203 87.44,157.088 -0,157.088C-76.51,157.088 -138.534,95.064 -138.534,18.554C-138.534,-47.027 -85.371,-100.19 -19.791,-100.19C34.86,-100.19 79.162,-55.887 79.162,-1.237C79.162,42.483 43.72,77.925 -0,77.925C-32.79,77.925 -59.372,51.344 -59.372,18.554C-59.372,-3.306 -41.651,-21.027 -19.791,-21.027C-8.861,-21.027 0,-12.167 -0,-1.237"
				:stroke="strokeColor ?? 'black'"
				fill="none"
				stroke-width="1rem"
			/>
		</g>
	</svg>
</template>

<style scoped>
@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

.whirlpool-icon {
	margin: 0 5%;
	position: fixed;
	animation: spin 20s linear infinite;
	transform-origin: center;
	pointer-events: none;
	opacity: 25%;
}
</style>
