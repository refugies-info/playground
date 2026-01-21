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
        <div className="important-block-wrapper w-full my-2">
          <Callout variant="important" className="my-0">
            <div ref={contentRef} />
          </Callout>
        </div>
      );
    },
  },
);
