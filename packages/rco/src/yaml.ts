import YAML from "yaml";
import { parseLheoXml } from "./lheo";

export async function convertXmlToYaml(xmlString: string): Promise<string> {
  const json = await parseLheoXml(xmlString);
  return YAML.stringify(json);
}
