import { createReactBlockSpec } from "@blocknote/react";
import { Callout } from "@playground/ui/primitives";

/**
 * GoodToKnow block - Creates a blue info box
 * Syntax in Directive markdown: :::good-to-know
 */
export const GoodToKnow = createReactBlockSpec(
  {
    type: "goodToKnow",
    propSchema: {},

    content: "inline",
  },
  {
    render: ({ contentRef }) => {
      return (
        <Callout variant="goodToKnow">
          <div ref={contentRef} />
        </Callout>
      );
    },
  },
);
