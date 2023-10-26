import { UIDGenerator } from "@/jsx/html/uuid";
import { describe, expect, test } from "@jest/globals";

describe("uuid", () => {
    test.only("uuid generates for DEV", () => {
        const gen = UIDGenerator.new();
        expect(gen()).toEqual("element-0");
        expect(gen()).toEqual("element-1");
    });
});
