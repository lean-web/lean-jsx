import fs from "fs";
import { IErrorHandler } from "../degradation/error-handler";

/**
 * A file-based template.
 * e.g.
 * <pre>
 * templates: {
        index: {
            path: INDEX_HTML_PATH,
            contentPlaceholder: "&lt;!--EAGER_CONTENT-->"
        }
    }
    </pre>
 */
type FileTemplateConfig = {
  path: string;
  contentPlaceholder: string;
};

/**
 * A string-based template.
 * 
 * e.g.
 * 
 * <pre>
 * {
        index: {
          head: "&lt;body>",
          tail: "&lt;/body>",
        },
      },
      </pre>
 */
type StringTemplateConfig = {
  head: string;
  tail: string;
};

export type TemplateConfig = FileTemplateConfig | StringTemplateConfig;

function isFileTemplate(config: TemplateConfig): config is FileTemplateConfig {
  return !!config && typeof config === "object" && "path" in config;
}

/**
 * A utility class which finds and loads the skeleton of the HTML template.
 * 
 * An instance of this class is created from the "templates" parameter on the "buildApp" function:
 * 
 * <pre>
 * buildApp({
    templates: {
        index: {
            path: INDEX_HTML_PATH,
            contentPlaceholder: "<!--EAGER_CONTENT-->"
        }
    },
    ...
    </pre>
})
 * 
 */
export class TemplateManager {
  templates: Record<string, TemplateConfig>;
  errorHandler: IErrorHandler;

  constructor(
    templates: Record<string, TemplateConfig>,
    errorHandler: IErrorHandler
  ) {
    this.templates = templates;
    this.errorHandler = errorHandler;
  }

  /**
   * Returns the first and last parts of the template. Commonly, these are:
   * - head: The initial part of the HTML, including the <head> and opening <body> tag.
   * - tail: The end of the HTML, after rendering all JSX-based content.
   *
   * @param templateName - the key of the template to use during render.
   * @returns a typle with [head, tail]
   */
  getHeadAndTail(templateName: string): [string, string] {
    const templateConf = this.templates[templateName];

    if (!templateConf) {
      this.errorHandler.reportWarning(
        `The requested template key "${templateName}" does not exist. Make sure this is configured in the TemplateManager.`
      );
      return ["", ""];
    }

    if (!templateConf) {
      this.errorHandler.reportError(
        "TemplateError",
        new Error(`Template ${templateName} could not be found`)
      );
    }

    if (isFileTemplate(templateConf)) {
      const template = fs.readFileSync(templateConf.path, "utf-8");

      const [before, after] = template.split(
        templateConf.contentPlaceholder ?? "<!--EAGER_CONTENT-->"
      );
      return [before, after];
    } else {
      return [templateConf.head, templateConf.tail];
    }
  }
}
