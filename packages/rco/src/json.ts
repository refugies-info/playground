import { parseLheoXml } from "./lheo";

export function convertXmlToJson(xmlString: string): object {
  return parseLheoXml(xmlString);
}
