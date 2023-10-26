import fs from "fs";
import { IErrorHandler } from "../degradation/error-handler";

type FileTemplateConfig = {
    path: string;
    contentPlaceholder: string;
};

type StringTemplateConfig = {
    head: string;
    tail: string;
};

export type TemplateConfig = FileTemplateConfig | StringTemplateConfig;

function isFileTemplate(config: TemplateConfig): config is FileTemplateConfig {
    return "path" in config;
}

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

    getHeadAndTail(templateName: string): [string, string] {
        const templateConf = this.templates[templateName];
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
