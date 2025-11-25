import YAML from "yaml";
import { parseLheoXml } from "./lheo";

export const lheoXmlToYaml = async (xmlString: string): Promise<string> => {
  const json = await parseLheoXml(xmlString);
  return YAML.stringify(json);
};
