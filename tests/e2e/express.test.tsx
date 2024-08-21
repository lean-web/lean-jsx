/* eslint-disable @typescript-eslint/no-misused-promises */
import { describe, expect, test, beforeAll, afterAll } from "@jest/globals";
import puppeteer, { Browser, Page } from "puppeteer";
import { startExpress, waitForAndAssertExists } from "./setup";
import { App, wait } from "./test-app";
import type { Server } from "net";

describe("express.test", () => {
  let browser: Browser | undefined;
  let page: Page | undefined;
  let expressApp: Server | undefined;

  async function setup() {
    browser = await puppeteer.launch({
      headless: false,
      args: ["--auto-open-devtools-for-tabs"],
    });
    page = await browser.newPage();
    return page;
  }

  beforeAll(async () => {
    expressApp = await startExpress((app, engine) => {
      app.get("/", async (req, res) => {
        await engine.renderWithTemplate(
          req,
          res,
          <App loadtime={100} />,
          {},
          {
            templateName: "index",
          },
        );
      });
    });
    await setup();
  });

  afterAll(async () => {
    expressApp?.close();
    await browser?.close();
  });

  test("e2e: Each kind of component works as expected", async () => {
    if (!page) {
      throw new Error("Pupeeteer not started");
    }

    const pageLoaded = page.goto("http://localhost:3333", {
      waitUntil: "domcontentloaded",
    });

    // Evaluate elements that may exist while page loads:
    await waitForAndAssertExists(page, "#loading");
    await waitForAndAssertExists(page, "#loading2");
    await waitForAndAssertExists(page, "#loading3");

    // wait for DOMContentLoaded
    await pageLoaded;

    page
      .on("console", (message) =>
        console.log(
          `${message.type().substr(0, 3).toUpperCase()} ${message.text()}`,
        ),
      )
      .on("pageerror", ({ message, ...rest }) => console.log(message, rest))
      .on("response", (response) =>
        console.log(`${response.status()} ${response.url()}`),
      )
      .on("requestfailed", (request) =>
        console.log(`${request?.failure()?.errorText} ${request.url()}`),
      );

    // Evaluate static components:
    const title = await page.$("p");
    await expect(page.$("p")).resolves.toBeTruthy();
    await expect(title?.evaluate((el) => el.textContent)).resolves.toMatch(
      "Hello world",
    );

    // Evaluated loaded async component:
    await expect(page.$("#slow1")).resolves.toBeTruthy();

    await expect(page.$("#loaded")).resolves.toBeTruthy();

    // Evaluated dynamic component:
    await waitForAndAssertExists(page, "#loaded2");
    await waitForAndAssertExists(page, "#loaded3");

    await page.click("#click1");
    const wasCalled = await page.evaluate(
      () => window.sessionStorage.getItem("clicked") === "true",
    );

    await page.click("#click2");
    const wasCalledWithData = await page.evaluate(
      () => window.sessionStorage.getItem("serverData") === "bar",
    );
    expect(wasCalled).toBeTruthy();
    expect(wasCalledWithData).toBeTruthy();

    await waitForAndAssertExists(page, "#click3");

    {
      const n = await page.$("#click3");
      if (!n) {
        throw new Error("no click 3");
      }
      const t = await (await n.getProperty("textContent")).jsonValue();
      console.log({ t });

      expect(t).toContain("Reloads: 0");
    }
    await page.click("#click3");

    {
      const n = await page.$("#click3");
      if (!n) {
        throw new Error("no click 3");
      }
      const t = await (await n.getProperty("textContent")).jsonValue();
      console.log({ t });

      expect(t).toContain("Reloads: 1");
    }
  }, 120000);
});
