import { defineDocumentType, makeSource } from "contentlayer2/source-files";

export const Tree = defineDocumentType(() => ({
  name: "Tree",
  filePathPattern: `trees/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      description: "The common name of the tree",
      required: true,
    },
    scientificName: {
      type: "string",
      description: "The scientific (Latin) name of the tree",
      required: true,
    },
    family: {
      type: "string",
      description: "The botanical family",
      required: true,
    },
    locale: {
      type: "enum",
      options: ["en", "es"],
      description: "The language of the content",
      required: true,
    },
    slug: {
      type: "string",
      description: "URL-friendly identifier for the tree",
      required: true,
    },
    description: {
      type: "string",
      description: "A brief description for SEO",
      required: true,
    },
    nativeRegion: {
      type: "string",
      description: "Native region or distribution",
      required: false,
    },
    conservationStatus: {
      type: "string",
      description: "IUCN conservation status if known",
      required: false,
    },
    maxHeight: {
      type: "string",
      description: "Maximum height the tree can reach",
      required: false,
    },
    uses: {
      type: "list",
      of: { type: "string" },
      description: "Common uses of the tree",
      required: false,
    },
    featuredImage: {
      type: "string",
      description: "Path to the featured image",
      required: false,
    },
    images: {
      type: "list",
      of: { type: "string" },
      description: "Additional image paths",
      required: false,
    },
    publishedAt: {
      type: "date",
      description: "Publication date",
      required: false,
    },
    updatedAt: {
      type: "date",
      description: "Last update date",
      required: false,
    },
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (tree) => `/${tree.locale}/trees/${tree.slug}`,
    },
  },
}));

export default makeSource({
  contentDirPath: "content",
  documentTypes: [Tree],
  mdx: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});
