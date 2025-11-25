import { parseLheoXml } from "./lheo";

export const convertXmlToJson = (xmlString: string): object => {
  return parseLheoXml(xmlString);
};
