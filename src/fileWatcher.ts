import { execSync } from "child_process";
import * as chokidar from "chokidar";
import * as path from "path";
const debounce = require("lodash.debounce");

const tscCommand = "../billing-fe/node_modules/typescript/bin/tsc";
const tsconfigPath = process.argv[2];
const srcRoot = path.dirname(tsconfigPath);

// Function to run when a file changes
function onFileChange(opts): void {
  try {
    console.log("executing")
    execSync(
      "npm run auto-add -- /home/mirka/git/billing-fe/client/tsconfig.strict.json && npm run visualize -- /home/mirka/git/billing-fe/client/tsconfig.strict.json --countErrors &> /dev/null"
    );
    console.log(opts);
  } catch (err) {}
}

// Debounced version of onFileChange
const debouncedOnFileChange = debounce(onFileChange, 100);

// Path to the directory to watch
const dirPath = `${srcRoot}/**/!(node_modules)/**/*.ts?(x)`;

// Watch the directory for file changes
chokidar
  .watch(dirPath, { persistent: true })
  .on("all", (event: string, filePath: string) => {
    // Call the debounced function when a file changes
    debouncedOnFileChange({event, filePath});
  });

console.log(`Watching ${dirPath} for file changes...`);

// // Function to evaluate a file
// function evaluate(filePath: string) {
//   console.log("Evaluating " + filePath);
//   const errors = runTSC(filePath);
//   if (errors == 0) {
//     addFileToTSConfig(tsconfigPath, filePath);
//   }
// }

// function runTSC(filePath) {
//   // Run the tsc command
//   const tsconfigWithSingleFlie = updateTsconfigFiles(tsconfigPath, [filePath]);
//   console.log(
//     `Running command: ${tscCommand} -p ${tsconfigWithSingleFlie} --noEmit`
//   );
//   let output = "";
//   try {
//     output = execSync(
//       `${tscCommand} -p ${tsconfigWithSingleFlie} --noEmit`
//     ).toString();
//   } catch (error) {
//     output = error.stdout.toString();
//   }
//   console.log(output);
//   // Check for any errors that were produced
//   const errors = output.match(/error/gi);
//   return errors.length;
// }

// function addFileToTSConfig(file: string, tsconfigPath: string) {
//   console.log("Adding file to tsconfig " + file);
//   // Read the tsconfig.json file
//   const tsconfig = require(tsconfigPath);

//   // Check if the file is already in the files array
//   const exists = tsconfig.files.some((f) => f === file);

//   // If the file is not in the files array, add it
//   if (!exists) {
//     tsconfig.files.push(file);
//   }

//   // Write the updated tsconfig.json file
//   fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
// }

// function removeFileFromTSConfig(tsconfigPath, filePath) {
//   // Read the tsconfig.json file
//   const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));

//   // Remove the file from the "files" array
//   const index = tsconfig.files.indexOf(filePath);
//   if (index > -1) {
//     tsconfig.files.splice(index, 1);
//   }

//   // Write the updated tsconfig.json file
//   fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig));
// }

// function updateTsconfigFiles(srcPath: string, files: string[]): string {
//   // Read the contents of the original tsconfig.json file
//   let tsconfig = JSON.parse(fs.readFileSync(srcPath, "utf8"));

//   // Update the files array in tsconfig
//   tsconfig.files = files;

//   // Create the destination path by changing the file name
//   // and keeping the same directory as the source path
//   let srcDir = path.dirname(srcPath);
//   let srcName = path.basename(srcPath, ".json");
//   let destPath = path.join(srcDir, `${srcName}-updated.json`);

//   // Write the modified tsconfig object to the new tsconfig.json file
//   fs.writeFileSync(destPath, JSON.stringify(tsconfig, null, 4), "utf8");

//   console.log(`Created ${destPath}`);

//   // Return the destination path
//   return destPath;
// }
