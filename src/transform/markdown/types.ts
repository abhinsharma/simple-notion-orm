import type {
  BlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

export type BlockNode = BlockObjectResponse & { children?: BlockNode[] };

export type RenderOptions = {
  listIndent?: number;
  toggleStyle?: "details" | "nested";
  column?: {
    delimiter?: string;
    emitMetadata?: boolean;
  };
  imageRenderer?: (url: string, caption?: string) => string;
  onUnsupportedBlock?: (block: BlockObjectResponse) => string[];
};

export type NormalizedRenderOptions = {
  listIndent: number;
  toggleStyle: "details" | "nested";
  column: {
    delimiter: string;
    emitMetadata: boolean;
  };
  imageRenderer: (url: string, caption?: string) => string;
  onUnsupportedBlock: (block: BlockObjectResponse) => string[];
};

export type RenderContext = {
  options: NormalizedRenderOptions;
  indentLevel: number;
  renderRichText: (items: RichTextItemResponse[]) => string;
  renderChildren: (children?: BlockNode[], indentDelta?: number) => string[];
};

export type RenderResult = {
  markdown: string;
};
