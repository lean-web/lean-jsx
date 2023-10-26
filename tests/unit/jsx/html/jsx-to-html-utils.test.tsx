import { JSXToHTMLUtils } from "@/jsx/html/jsx-to-html";
import { describe, expect, test } from "@jest/globals";
import { JSDOM } from "jsdom";

describe("JSXToHTMLUtils", () => {
    const testCases = [
        [<p>Hello</p>, "<p></p>"],
        [<p data-some-attr="true">Hello</p>, '<p data-some-attr="true"></p>'],
        [
            <button onclick={ev => console.log(ev)}>Click me</button>,
            "<button></button>"
        ],
        [
            <button data-action="click" onclick={ev => console.log(ev)}>
                Click me
            </button>,
            '<button data-action="click"></button>'
        ],
        [
            <div style={{ backgroundColor: "red" }}></div>,
            '<div style="background-color: red;"></div>'
        ],
        [
            <div
                style={{
                    backgroundColor: "red",
                    fontFamily: "Arial, Helvetica"
                }}
            ></div>,
            '<div style="background-color: red; font-family: Arial, Helvetica;"></div>'
        ],
        [
            <div
                style={{ backgroundColor: "red" }}
                onload={() => console.log("Loaded")}
            ></div>,
            '<div style="background-color: red;"></div>'
        ],
        [
            <div
                style={{ backgroundColor: "red" }}
                data-onclick="click"
                onload={() => console.log("Loaded")}
            ></div>,
            '<div style="background-color: red;" data-onclick="click"></div>'
        ],
        [
            <div
                style={{ backgroundColor: "red" }}
                data-onclick="click"
                ariaLabel="div"
                onload={() => console.log("Loaded")}
            ></div>,
            '<div style="background-color: red;" data-onclick="click" aria-label="div"></div>'
        ]
    ];

    test("generated outerHTML is valid", () => {
        testCases.forEach(([tc, result]) => {
            const [start, close] = JSXToHTMLUtils.jsxNodeToHTMLTag(
                tc as SXL.StaticElement
            );
            const html = `${start}${close}`;
            const element = JSDOM.fragment(html);
            expect(element).toBeTruthy();
            expect(html).toBe(result);
        });
    });
});
