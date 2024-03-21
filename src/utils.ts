import { resolve } from "path"

export function getRootPath(...dir: string[]) {
  return resolve(process.cwd(), ...dir);
}

