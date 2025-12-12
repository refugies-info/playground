import YAML from "yaml";
import { parseLheoXml } from "./lheo";

export const jsonToYaml = (json: unknown): string => {
  return YAML.stringify(json);
};

export const lheoXmlToYaml = async (xmlString: string): Promise<string> => {
  const json = await parseLheoXml(xmlString);
  return jsonToYaml(json);
};
