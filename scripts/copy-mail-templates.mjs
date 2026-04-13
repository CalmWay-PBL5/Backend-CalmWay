import { cp, mkdir } from "node:fs/promises";
import path from "node:path";

const sourceDir = path.resolve("src/shared/mailer/templates");
const targetDir = path.resolve("dist/src/shared/mailer/templates");

async function main() {
  await mkdir(targetDir, { recursive: true });
  await cp(sourceDir, targetDir, { recursive: true });
  console.log(`[copy-mail-templates] copied templates to ${targetDir}`);
}

main().catch((error) => {
  console.error("[copy-mail-templates] failed to copy templates", error);
  process.exit(1);
});
