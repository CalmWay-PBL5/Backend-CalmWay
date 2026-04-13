import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import * as hbs from "handlebars";
import * as fs from "fs/promises";
import * as path from "path";

@Injectable()
export class MailBuilderService {
  private readonly logger = new Logger(MailBuilderService.name);
  private readonly templateCache = new Map<string, hbs.TemplateDelegate>();

  async buildTemplate(
    templateName: string,
    context: Record<string, any>,
  ): Promise<string> {
    try {
      let compiledTemplate = this.templateCache.get(templateName);

      if (!compiledTemplate) {
        this.logger.debug(
          `Template cache miss. Loading from disk: ${templateName}`,
        );
        compiledTemplate = await this.loadAndCompile(templateName);
        this.templateCache.set(templateName, compiledTemplate);
      }

      return compiledTemplate(context);
    } catch (error: unknown) {
      const stack =
        error instanceof Error ? error.stack : "No stack trace available";

      this.logger.error(`Failed to build template: ${templateName}`, stack);
      throw new InternalServerErrorException(
        "Email template compilation failed.",
      );
    }
  }

  private async loadAndCompile(
    templateName: string,
  ): Promise<hbs.TemplateDelegate> {
    const templatePaths = [
      path.join(__dirname, "templates", `${templateName}.hbs`),
      path.join(
        process.cwd(),
        "dist",
        "src",
        "shared",
        "mailer",
        "templates",
        `${templateName}.hbs`,
      ),
      path.join(
        process.cwd(),
        "src",
        "shared",
        "mailer",
        "templates",
        `${templateName}.hbs`,
      ),
    ];

    for (const templatePath of templatePaths) {
      try {
        const templateSource = await fs.readFile(templatePath, "utf-8");
        return hbs.compile(templateSource);
      } catch (error: unknown) {
        if (this.isNodeError(error) && error.code === "ENOENT") {
          continue;
        }
        throw error;
      }
    }

    throw new Error(
      `Template file not found. Checked paths: ${templatePaths.join(", ")}`,
    );
  }

  private isNodeError(error: unknown): error is NodeJS.ErrnoException {
    return error instanceof Error;
  }
}
