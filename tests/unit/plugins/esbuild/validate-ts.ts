/* eslint-disable @typescript-eslint/unbound-method */
import ts from "typescript";
import fs from "fs";
import path from "path";

function diagnosticToString(diagnostic: ts.Diagnostic | undefined) {
  if (!diagnostic) {
    return;
  }
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
  if (diagnostic.file && diagnostic.file.fileName) {
    const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
      diagnostic.start!,
    );
    return `Error ${diagnostic.file.fileName} (${line + 1},${
      character + 1
    }): ${message}`;
  } else {
    return `Error: ${message}`;
  }
}

function parseTSConfig(tsConfigPath: string) {
  const configFileText = fs.readFileSync(tsConfigPath).toString();
  const result = ts.parseConfigFileTextToJson(tsConfigPath, configFileText);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const configObject = result.config;
  if (!configObject) {
    const error = diagnosticToString(result.error) ?? "Error not reported";
    throw new Error(`Error parsing ${tsConfigPath}: ${error}`);
  }

  const configParseResult = ts.parseJsonConfigFileContent(
    configObject,
    ts.sys,
    path.dirname(tsConfigPath),
  );
  if (configParseResult.errors.length > 0) {
    throw new Error(
      `Error parsing ${tsConfigPath}: ${configParseResult.errors
        .map((e) => e.messageText)
        .join(", ")}`,
    );
  }

  return configParseResult.options;
}

export function validateTypeScriptCode(
  code: string,
  tsConfigPath: string,
  fileName = "file.tsx",
  extraFiles: string[] = [],
): readonly string[] | null {
  const options: ts.CompilerOptions = parseTSConfig(tsConfigPath);

  const sourceFile = ts.createSourceFile(
    fileName,
    code,
    ts.ScriptTarget.Latest,
    true,
  );

  const compilerHost = ts.createCompilerHost(options);
  compilerHost.getSourceFile = (fileNameToGet, _languageVersion) => {
    if (fileNameToGet === fileName) {
      return sourceFile;
    }

    if (path.isAbsolute(fileNameToGet)) {
      const libSource = fs.readFileSync(fileNameToGet).toString();
      return ts.createSourceFile(
        fileNameToGet,
        libSource,
        ts.ScriptTarget.Latest,
        true,
      );
    }
    // Load default library files
    const libPath = path.join(
      path.dirname(require.resolve("typescript")),
      fileNameToGet,
    );

    const libSource = fs.readFileSync(libPath).toString();
    return ts.createSourceFile(
      fileNameToGet,
      libSource,
      ts.ScriptTarget.Latest,
      true,
    );
  };

  const program = ts.createProgram(
    [fileName, ...extraFiles],
    options,
    compilerHost,
  );

  const diagnostics = ts.getPreEmitDiagnostics(program);

  // no validation errors
  if (diagnostics.length === 0) {
    return null;
  }
  return diagnostics.map(diagnosticToString).filter((el): el is string => !!el);
}
