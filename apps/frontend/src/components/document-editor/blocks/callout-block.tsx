import { createReactBlockSpec } from "@blocknote/react";
import { Callout } from "@playground/ui/primitives";

/**
 * Unified Callout block - Supports multiple variants (important, goodToKnow)
 * Syntax in Directive markdown: :::important or :::good-to-know
 */
export const CalloutBlock = createReactBlockSpec(
  {
    type: "callout",
    propSchema: {
      variant: {
        default: "goodToKnow",
        values: ["important", "goodToKnow"] as const,
      },
    },
    content: "inline",
  },
  {
    render: ({ block, contentRef }) => {
      return (
        <div className="callout-block-wrapper w-full my-2">
          <Callout variant={block.props.variant} className="my-0">
            <div ref={contentRef} />
          </Callout>
        </div>
      );
    },
  },
);
