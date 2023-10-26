import { isFragmentNode, unwrapFragments } from "@/jsx/html/jsx-utils";
import { describe, expect, test } from "@jest/globals";
describe("jsx-utils.test", () => {
    test("unwrapFragments", () => {
        const children = unwrapFragments(<>Hello</>);

        expect(children).toMatchInlineSnapshot(`
[
  "Hello",
]
`);
    });

    test("isFragmentNode", () => {
        function WithFragment() {
            return <>Hello</>;
        }
        const testCases: [SXL.Element, boolean][] = [
            [<></>, true],
            [<>Hello</>, true],
            [
                <>
                    <>Hello</>
                </>,
                true
            ],
            [<p>Hello</p>, false],
            [
                <p>
                    <>Hello</>
                </p>,
                false
            ],
            [<WithFragment />, false]
        ];

        testCases.forEach(([arg, expected]) => {
            expect(isFragmentNode(arg)).toBe(expected);
        });
    });

    test("unwrapFragments", () => {
        const children = unwrapFragments(
            <>
                <>Hello</>
            </>
        );

        expect(children).toMatchInlineSnapshot(`
[
  "Hello",
]
`);
    });

    test("unwrapFragments", () => {
        const children = unwrapFragments(
            <>
                <p data-arg="one">Hello</p>
            </>
        );

        expect(children).toMatchInlineSnapshot(`
[
  {
    "children": [
      "Hello",
    ],
    "props": {
      "data-arg": "one",
      "dataset": {},
    },
    "type": "p",
  },
]
`);
    });
});
