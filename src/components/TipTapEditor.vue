<script setup lang="ts">
import { EditorContent, useEditor } from "@tiptap/vue-3"
import { StarterKit } from "@tiptap/starter-kit"

const model = defineModel({
	type: Object,
	default: () => ({ type: "doc", content: [] })
})

const editor = useEditor({
	extensions: [StarterKit],
	onUpdate({ editor }) {
		model.value = editor.getJSON()
	},
	editorProps: {
		attributes: {
			class: "editor-container"
		}
	}
})
</script>

<template>
	<div class="border-2 border-gray-200 w-full">
		<div>Tiptap editor</div>
		<!--		Toolbar wrapper -->
		<div class="border-b-1 border-gray-200">Toolbar</div>
		<!--		Editor wrapper-->
		<div class="overflow-y-auto max-h-40">
			<EditorContent :editor="editor" />
		</div>
	</div>
</template>

<style scoped>
/* https://github.com/ueberdosis/tiptap/issues/526#issuecomment-1146048772 */
::v-deep(.ProseMirror:focus-visible) {
	outline: none;
}
</style>
