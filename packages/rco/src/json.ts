import { parseLheoXml } from "./lheo";

export const lheoXmlToJson = (xmlString: string) => {
  return parseLheoXml(xmlString);
};
