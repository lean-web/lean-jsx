import type { InlineConfig } from "vite";
import type { BuildOptions as ESBuildOptions } from "esbuild";

export default interface BuildOptions {
    web: InlineConfig;
    server: {
        main: string;
        esbuildOptions: ESBuildOptions;
    };
}
