import { tool } from "ai";
import { z } from "zod/v3";
import { StagehandPage } from "../../StagehandPage";

export const createFillFormTool = (
  stagehandPage: StagehandPage,
  executionModel?: string,
) =>
  tool({
    description: `📝 FORM FILL - SPECIALIZED MULTI-FIELD INPUT TOOL

     CRITICAL: Use this for ANY form with 2+ input fields (text inputs, textareas, etc.)

    WHY THIS TOOL EXISTS:
    • Forms are the #1 use case for multi-field input
    • Optimized specifically for input/textarea elements
    • 4-6x faster than individual typing actions

    Use fillForm: Pure form filling (inputs, textareas only)


    MANDATORY USE CASES (always use fillForm for these):
    Registration forms: name, email, password fields
    Contact forms: name, email, message fields  
    Checkout forms: address, payment info fields
    Profile updates: multiple user data fields
    Search filters: multiple criteria inputs



    PARAMETER DETAILS:
    • fields: Array of { action, value } objects.
      – action: short description of where to type (e.g. "type 'john@example.com' into the email input").
      – value: the exact text to enter.
 `,
    parameters: z.object({
      fields: z
        .array(
          z.object({
            action: z
              .string()
              .describe(
                'Description of the typing action, e.g. "type foo into the bar field"',
              ),
            value: z.string().describe("Text to type into the target field"),
          }),
        )
        .min(1, "Provide at least one field to fill"),
    }),

    execute: async ({ fields }) => {
      const instruction = `Return observation results for the following actions: ${fields
        .map((field) => field.action)
        .join(", ")}`;

      const observeResults = executionModel
        ? await stagehandPage.page.observe({
            instruction,
            modelName: executionModel,
          })
        : await stagehandPage.page.observe(instruction);

      const completedActions = [];
      for (const result of observeResults) {
        const action = await stagehandPage.page.act(result);
        completedActions.push(action);
      }

      return { success: true, actions: completedActions };
    },
  });
