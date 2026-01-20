import { createReactBlockSpec } from "@blocknote/react";
import { Callout } from "@playground/ui/primitives";

/**
 * Important block - Creates a red alert/notice box
 * Syntax in Directive markdown: :::important
 */
export const Important = createReactBlockSpec(
  {
    type: "important",
    propSchema: {},

    content: "inline",
  },
  {
    render: ({ contentRef }) => {
      return (
        <Callout variant="important">
          <div ref={contentRef} />
        </Callout>
      );
    },
  },
);
