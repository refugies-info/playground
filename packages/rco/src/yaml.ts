import YAML from "yaml";
import { parseLheoXml } from "./lheo";

export function convertXmlToYaml(xmlString: string): string {
  const json = parseLheoXml(xmlString);
  return YAML.stringify(json);
}
