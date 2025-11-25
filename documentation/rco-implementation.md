# RCO Package Implementation Details

## XML Parsing and Validation Strategy

The RCO package utilizes a dual-library approach to handle Lhéo XML files, leveraging the specific strengths of two different libraries:

### 1. Validation: `libxml2-wasm`

We use `libxml2-wasm` to validate XML content against the official Lhéo XSD schema.

- **Role**: Strict Schema Validation.
- **Why**: `fast-xml-parser` is a pure JavaScript parser that converts XML to JSON but does not support XSD schema validation. `libxml2` is the industry standard for strict XML validation, ensuring that input files strictly adhere to the Lhéo specification before processing.

### 2. Parsing: `fast-xml-parser`

We use `fast-xml-parser` to convert the validated XML string into a usable JavaScript/JSON object.

- **Role**: XML to JSON Conversion.
- **Why**: While `libxml2-wasm` provides a low-level DOM API (e.g., traversing nodes manually), converting an entire document to a JSON object using it would require writing complex, custom traversal logic. `fast-xml-parser` is designed specifically for this purpose, offering a simple API with powerful configuration options (like forcing specific fields to always be arrays) that simplifies the codebase significantly.

### Summary Flow

1.  **Input**: Receive raw XML string.
2.  **Validate**: Pass string to `libxml2-wasm` with `lheo.xsd`. If invalid, throw error.
3.  **Parse**: Pass validated string to `fast-xml-parser` to generate the `LheoDocument` JSON object.

## Alternatives Considered

We investigated whether a single library could handle both validation and conversion, specifically looking for wrappers around `libxml2-wasm` that might offer a convenient "to JSON" utility.

- **Findings**: `libxml2-wasm` is a faithful port of the C library, focusing on DOM manipulation and standard compliance (like XSD validation). It does not include high-level abstraction layers for JSON conversion.
- **Conclusion**: There are no prominent libraries built on top of `libxml2-wasm` that provide a "convenient" XML-to-JSON conversion API. The standard approach in the Node.js ecosystem is to use `libxml` variants for strict tasks (validation) and pure-JS libraries (like `fast-xml-parser`) for data transformation tasks, which is the pattern we have adopted.
