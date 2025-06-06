import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import { IClientProject } from "./config.interface";

const execAsync = util.promisify(exec);

interface PackageJson {
  name: string;
  version: string;
  [key: string]: any;
}

export interface IPublishOptions {
  projectRoot: string;
  clientProjects: IClientProject[];
  pkgJsonFiles: string[];
  tsConfigContent: any;
  newVersion?: string;
}

export const publish = async ({
  projectRoot,
  clientProjects,
  pkgJsonFiles,
  tsConfigContent,
  newVersion,
}: IPublishOptions): Promise<string> => {
  try {
    console.log(`Project root: ${projectRoot}`);

    const distDir = path.join(projectRoot, "dist");
    const versionsDir = path.join(distDir, "versions");
    const targetLibsDirs = clientProjects.map(
      (project) => project.targetLibsDir
    );
    createDirIfNotExists(distDir);
    createDirIfNotExists(versionsDir);
    for (const dir of targetLibsDirs) {
      createDirIfNotExists(dir);
    }

    // read package.json from project root, not dist
    const packageJsonPath = path.join(projectRoot, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error(`package.json not found at ${packageJsonPath}`);
    }

    // read the client's package.json with original formatting
    const packageJsonContent = fs.readFileSync(packageJsonPath, "utf8");
    const packageJson = JSON.parse(packageJsonContent) as PackageJson;
    // Store the original indentation by checking the first property indentation
    const indentMatch = packageJsonContent.match(/\n(\s+)"/);
    const indent = indentMatch ? indentMatch[1] : "  "; // Default to 2 spaces if not found

    // update version if provided and different from current version
    if (newVersion && packageJson.version !== newVersion) {
      console.log(
        `Updating version from ${packageJson.version} to ${newVersion}`
      );
      packageJson.version = newVersion;
      fs.writeFileSync(
        packageJsonPath,
        JSON.stringify(packageJson, null, indent)
      );
      await execAsync(`npm version ${newVersion} --no-git-tag-version`, {
        cwd: projectRoot,
      });
    } else if (newVersion && packageJson.version === newVersion) {
      console.log(
        `Version already set to ${newVersion}, skipping version update`
      );
    }

    // create temporary package.json for publishing
    const tempPackageJson = { ...packageJson };
    // add files array to limit what gets published
    tempPackageJson.files = pkgJsonFiles;
    const tempPackageJsonPath = path.join(projectRoot, "temp-package.json");
    fs.writeFileSync(
      tempPackageJsonPath,
      JSON.stringify(tempPackageJson, null, indent)
    );

    // create temporary tsconfig that excludes commands files
    console.log("Creating temporary build configuration...");
    const tempTsConfigPath = path.join(projectRoot, "temp-tsconfig.json");
    fs.writeFileSync(
      tempTsConfigPath,
      JSON.stringify(tsConfigContent, null, indent)
    );

    // build only the authorization code
    console.log("Building authorization code...");
    await execAsync("npx tsc -p temp-tsconfig.json", { cwd: projectRoot });

    // clean up temporary tsconfig file
    try {
      fs.unlinkSync(tempTsConfigPath);
    } catch (error) {
      console.warn("Failed to clean up temporary tsconfig file:", error);
    }

    // rename temporary package.json for publishing
    fs.renameSync(
      tempPackageJsonPath,
      path.join(projectRoot, "package.json.bak")
    );
    fs.renameSync(
      packageJsonPath,
      path.join(projectRoot, "package.json.original")
    );
    fs.renameSync(path.join(projectRoot, "package.json.bak"), packageJsonPath);

    try {
      console.log("Creating package...");
      await execAsync(`npm pack --pack-destination ./dist/versions`, {
        cwd: projectRoot,
      });
    } finally {
      // restore original package.json
      fs.unlinkSync(packageJsonPath);
      fs.renameSync(
        path.join(projectRoot, "package.json.original"),
        packageJsonPath
      );
    }

    const tgzFilename = `${packageJson.name
      .replace("@", "")
      .replace("/", "-")}-${packageJson.version}.tgz`;
    const tgzPath = path.join(versionsDir, tgzFilename);
    if (!fs.existsSync(tgzPath)) {
      throw new Error(`Package file not found: ${tgzPath}`);
    }

    // copy to target libs directories
    for (const targetLibsDir of targetLibsDirs) {
      console.log(`Copying package to ${targetLibsDir}`);
      fs.copyFileSync(tgzPath, path.join(targetLibsDir, tgzFilename));
    }

    console.log("✅ Package published successfully!");
    console.log(`📦 Package: ${tgzFilename}`);
    console.log(`📂 Available in: ${targetLibsDirs}`);

    return packageJson.version;
  } catch (error) {
    console.error("❌ Failed to publish package:", error);
    process.exit(1);
  }
};

const createDirIfNotExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
};
