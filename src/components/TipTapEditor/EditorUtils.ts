import { StarterKit } from "@tiptap/starter-kit";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { Highlight } from "@tiptap/extension-highlight";
import { Placeholder } from "@tiptap/extensions";

export const editorExtensions = [
	StarterKit.configure({
		paragraph: {
			HTMLAttributes: {
				class: "my-0"
			}
		},
		orderedList: {
			HTMLAttributes: {
				class: "my-0"
			}
		},
		bulletList: {
			HTMLAttributes: {
				class: "my-0"
			}
		}
	}),
	Placeholder.configure({
		placeholder: "Write down your thoughts..."
	}),
	TextStyle,
	Color,
	Highlight.configure({
		multicolor: true
	})
];
