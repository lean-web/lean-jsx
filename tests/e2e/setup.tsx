/* eslint-disable @typescript-eslint/no-misused-promises */
import express, {type Express} from "express";
import { LeanJSX, buildApp } from "@/server/express";
import fs from "fs";
import { SXLGlobalContext } from "@/types/context";
import { Page } from "puppeteer";
import { expect } from "@jest/globals";
import { Server } from "net";

function loadScript() {
    const scriptContent = fs.readFileSync(
        require.resolve("lean-jsx/lib/web/sxl.global.js"),
        "utf-8"
    );
    return scriptContent;
}

export function getTestLeanEngine<G extends SXLGlobalContext>():LeanJSX<G> {
    return buildApp({
        templates: {
            index: {
                head: `<head>
                    <script>
                       ${loadScript()}
                    </script>
                </head><body>`,
                tail: '<div id="eop"></div></body>'
            }
        },
        logging: {
            defaultLogLevel: "info"
        }
    });
}

export async function startExpress<G extends SXLGlobalContext>(decorate: (app:Express, engine:LeanJSX<G>) => void): Promise<Server> {
    const engine = getTestLeanEngine();

    const app = express();

    decorate(app, engine)

    return new Promise(resolve => {
        const server = app.listen(3333, "localhost", () => {
            resolve(server);
        });
    });
}


export async function waitForAndAssertExists(page:Page, selector:string) {
    await page.waitForSelector(selector);
    await expect(page.$(selector)).resolves.toBeTruthy();
}