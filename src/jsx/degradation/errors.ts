import { v4 as uuidv4 } from "uuid";

export class LeanError extends Error {
  uuid: string;
  constructor(message: string) {
    super(message);
    this.uuid = uuidv4();
  }
}

export class RenderError extends LeanError {
  componentName: string | undefined;
  constructor(message: string, componentName?: string) {
    super(message);
    this.componentName = componentName;
  }
}
