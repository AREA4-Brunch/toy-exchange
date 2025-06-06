import * as path from "path";
import { IClientProject } from "../commands/config.interface";
import { IPublishOptions } from "../commands/publish";

const baseDir = path.resolve(__dirname, "../../../");

const clientProjects: IClientProject[] = [
  {
    name: "Authorization Lib",
    packageJsonPath: path.join(baseDir, "authorization/package.json"),
    targetLibsDir: path.join(baseDir, "authorization/libs"),
  },
];

const projectRoot = path.resolve(__dirname, "../../");

const pkgJsonFiles = ["dist/commands/**/*", "README.md"];

const tsConfigContent = {
  extends: "./tsconfig.json",
  // !important: must specify commands dir, ./**/*.ts wont work
  include: ["./commands/**/*.ts"],
  exclude: ["./_commands/**/*.ts", "node_modules"],
};

export const publishOptions: IPublishOptions = {
  projectRoot,
  clientProjects,
  pkgJsonFiles,
  tsConfigContent,
  newVersion: undefined,
};
