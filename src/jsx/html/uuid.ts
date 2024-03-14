import { v4 as uuidv4 } from "uuid";

const ENV = process.env.ENV ?? "DEV";

function* syntId() {
  let i = 1;
  while (i < i + 100000) {
    yield `element-${i++}`;
  }
}

export class UIDGenerator {
  static new() {
    const devIdGen = syntId();
    return (type?: "PROD" | "DEV"): string => {
      if (type === "PROD" || ENV === "PROD") {
        return uuidv4();
      } else {
        return devIdGen.next().value as string;
      }
    };
  }
}
