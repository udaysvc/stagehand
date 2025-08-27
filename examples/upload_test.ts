import path from "node:path";
import fs from "node:fs";
// Import directly from local dist to ensure latest build is used
import { Stagehand } from "../dist";
import type { Page as PlaywrightPage } from "playwright";
import StagehandConfig from "../stagehand.config";

async function downloadFile(url: string, filename: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  const filePath = path.join(process.cwd(), "downloads", filename);

  // Ensure downloads directory exists
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  fs.writeFileSync(filePath, Buffer.from(buffer));
  return filePath;
}

async function main() {
  // Accept file URL as command line argument or use default
  const fileUrl = process.argv[2] || "https://www.orimi.com/pdf-test.pdf";
  const targetPage =
    process.argv[3] || "https://ps.uci.edu/~franklin/doc/file_upload.html";

  console.log(`Downloading file from: ${fileUrl}`);
  console.log(`Target page: ${targetPage}`);

  const stagehand = new Stagehand({ ...StagehandConfig, verbose: 1 });
  await stagehand.init();
  const page = stagehand.page;

  try {
    // Download the file dynamically
    const filename = path.basename(fileUrl) || "downloaded_file";
    const filePath = await downloadFile(fileUrl, filename);
    console.log(`File downloaded to: ${filePath}`);

    // Navigate to the target page
    await page.goto(targetPage, {
      waitUntil: "domcontentloaded",
    });

    // Debug: check presence of file inputs before calling upload
    const count = await page.locator('input[type="file"]').count();
    console.log("file input count:", count);

    // Debug: log accessibility tree (full)
    try {
      const pw = page as unknown as PlaywrightPage;
      const ax = await pw.accessibility.snapshot({ interestingOnly: false });
      console.log("AX tree:");
      console.log(JSON.stringify(ax, null, 2));
    } catch (e) {
      console.log("Failed to snapshot accessibility tree:", e);
    }

    // Upload using the new helper - let observe find the right input
    const result = await stagehand.upload("Upload this file", filePath);
    console.log("upload result:", result);

    // Try to submit the form using observe to find the submit button
    try {
      const [submitAction] = await page.observe(
        "Find and click the submit or send button",
      );
      if (submitAction?.selector) {
        console.log(
          `Found submit button with selector: ${submitAction.selector}`,
        );

        // Avoid mixed-content warning by upgrading http action → https when possible
        try {
          await page.evaluate(() => {
            const form = document.querySelector(
              "form",
            ) as HTMLFormElement | null;
            if (
              form &&
              typeof form.action === "string" &&
              form.action.startsWith("http://")
            ) {
              form.action = form.action.replace("http://", "https://");
            }
          });
        } catch {
          // ignore non-fatal submit upgrade errors
        }

        await page.act(submitAction);
        console.log("Form submitted successfully");
      } else {
        console.log("No submit button found via observe");
      }
    } catch (e) {
      console.log("Failed to find submit button via observe:", e);
    }

    await page.waitForTimeout(1500);
  } finally {
    // Clean up downloaded file
    try {
      const filePath = path.join(
        process.cwd(),
        "downloads",
        path.basename(fileUrl) || "downloaded_file",
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("Cleaned up downloaded file");
      }
    } catch (e) {
      console.log("Failed to clean up file:", e);
    }

    await stagehand.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
