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
        <div className="good-to-know-block-wrapper w-full my-2">
          <Callout variant="goodToKnow" className="my-0">
            <div ref={contentRef} />
          </Callout>
        </div>
      );
    },
  },
);
