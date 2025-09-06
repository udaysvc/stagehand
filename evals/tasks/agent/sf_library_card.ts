import { EvalFunction } from "@/types/evals";
import { Evaluator } from "../../evaluator";

export const sf_library_card: EvalFunction = async ({
  debugUrl,
  sessionUrl,
  stagehand,
  logger,
  agent,
}) => {
  try {
    await stagehand.page.goto("https://sflib1.sfpl.org/selfreg");

    const agentResult = await agent.execute({
      instruction:
        "Fill in the 'Residential Address' field with '166 Geary St'",
      maxSteps: Number(process.env.AGENT_EVAL_MAX_STEPS) || 3,
    });
    logger.log(agentResult);

    await stagehand.page.mouse.wheel(0, -1000);
    const evaluator = new Evaluator(stagehand);
    const result = await evaluator.ask({
      question:
        "Does the page show the 'Residential Address' field filled with '166 Geary St'?",
    });

    if (result.evaluation !== "YES" && result.evaluation !== "NO") {
      return {
        _success: false,
        observations: "Evaluator provided an invalid response",
        debugUrl,
        sessionUrl,
        logs: logger.getLogs(),
      };
    }

    if (result.evaluation === "YES") {
      return {
        _success: true,
        observations: result.reasoning,
        debugUrl,
        sessionUrl,
        logs: logger.getLogs(),
      };
    } else {
      return {
        _success: false,
        observations: result.reasoning,
        debugUrl,
        sessionUrl,
        logs: logger.getLogs(),
      };
    }
  } catch (error) {
    return {
      _success: false,
      error: error,
      debugUrl,
      sessionUrl,
      logs: logger.getLogs(),
    };
  } finally {
    await stagehand.close();
  }
};
