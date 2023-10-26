import { v4 as uuidv4 } from "uuid";

const ENV = process.env.ENV ?? "DEV";

export class UIDGenerator {
  static new(intialIndex?: number) {
    let i = intialIndex ?? 0;
    function* syntId() {
      while (i < i + 10000) {
        yield `element-${i++}`;
      }
    }
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
