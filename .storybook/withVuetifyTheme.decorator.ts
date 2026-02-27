import { h } from "vue"
import StoryWrapper from "./StoryWrapper.vue"

export const withVuetifyTheme = (storyFunc, context) => {
	const story = storyFunc()
	return () => {
		return h(
			StoryWrapper,
			{},
			{
				story: () => h(story, { ...context.args })
			}
		)
	}
}
