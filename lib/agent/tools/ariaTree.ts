import { tool } from "ai";
import { z } from "zod/v3";
import { StagehandPage } from "../../StagehandPage";

export const createAriaTreeTool = (stagehandPage: StagehandPage) =>
  tool({
    description:
      "gets the accessibility (ARIA) tree from the current page. this is useful for understanding the page structure and accessibility features. it should provide full context of what is on the page",
    parameters: z.object({}),
    execute: async () => {
      const { page_text } = await stagehandPage.page.extract();
      const pageUrl = stagehandPage.page.url();

      let content = page_text;
      const MAX_CHARACTERS = 70000;

      const estimatedTokens = Math.ceil(content.length / 4);

      if (estimatedTokens > MAX_CHARACTERS) {
        const maxCharacters = MAX_CHARACTERS * 4;
        content =
          content.substring(0, maxCharacters) +
          "\n\n[CONTENT TRUNCATED: Exceeded 70,000 token limit]";
      }

      return {
        content,
        pageUrl,
      };
    },
    experimental_toToolResultContent: (result) => {
      const content = typeof result === "string" ? result : result.content;
      return [{ type: "text", text: `Accessibility Tree:\n${content}` }];
    },
  });
