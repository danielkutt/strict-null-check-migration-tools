import { ChildProcessWithoutNullStreams, execSync, spawn } from "child_process";
import * as fs from "fs";

let buildCompletePattern = () => /Found (\d+) error/gi;

export class ErrorCounter {
  private tscProcess: ChildProcessWithoutNullStreams;
  private tsconfigCopyPath: string;
  private originalConfig: any;

  constructor(private tsconfigPath: string) {}

  public start(): void {
    this.tsconfigCopyPath =
      this.tsconfigPath + `copy${Math.floor(Math.random() * (1 << 16))}.json`;

    // Make a copy of tsconfig because we're going to keep modifying it.
    execSync(`cp ${this.tsconfigPath} ${this.tsconfigCopyPath}`);
    this.originalConfig = JSON.parse(
      fs.readFileSync(this.tsconfigCopyPath).toString()
    );

    // Opens TypeScript in watch mode so that it can (hopefully) incrementally
    // compile as we add and remove files from the whitelist.
    this.tscProcess = spawn(`../billing-fe/node_modules/typescript/bin/tsc`, [
      "-p",
      this.tsconfigCopyPath,
      "--watch",
      "--noEmit",
      "--pretty",
      "false"
    ]);
  }

  public end(): void {
    this.tscProcess.kill()
    execSync(`rm ${this.tsconfigCopyPath}`);
  }

  public tryCheckingFile(relativeFilePath: string): Promise<number> {
    return new Promise((resolve) => {
      const listener = (data: Buffer) => {
        const textOut = data.toString();
        const match = buildCompletePattern().exec(textOut);
        if (match) {
          const errorCount = +match[1];
          this.tscProcess.stdout.removeListener('data', listener)
          resolve(errorCount);
        }
      };
      this.tscProcess.stdout.addListener("data", listener);

      // Create a new config with the file removed from excludes
      // const exclude = new Set(this.originalConfig.exclude)
      // exclude.delete('./' + relativeFilePath)
      const files = this.originalConfig.files;

      fs.writeFileSync(
        this.tsconfigCopyPath,
        JSON.stringify(
          {
            ...this.originalConfig,
            files: [...files, "./" + relativeFilePath],
          },
          null,
          2
        )
      );
    });
  }
}
