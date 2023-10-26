import { Readable } from "stream";

/**
 * Reads all the text in a readable stream and returns it as a string,
 * via a Promise.
 * @param {stream.Readable} readable
 */
export function readableToString(
    readable: Readable,
    onData?: (chunk: string, currentContent: string) => void
): Promise<string> {
    return new Promise((resolve, reject) => {
        let data = "";
        readable.on("data", function (chunk) {
            if (typeof chunk !== "string" && chunk !== null) {
                throw new Error("Unsupported chunk type");
            }
            if (onData) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                onData(chunk, data);
            }
            data += chunk;
        });

        readable.on("end", function () {
            resolve(data.replace(/[ \t\n]+/g, " ").trim());
        });
        readable.on("error", function (err) {
            reject(err);
        });
    });
}
