import YAML from "yaml";
import { parseLheoXml } from "./lheo";

export const convertXmlToYaml = async (xmlString: string): Promise<string> => {
  const json = await parseLheoXml(xmlString);
  return YAML.stringify(json);
};
