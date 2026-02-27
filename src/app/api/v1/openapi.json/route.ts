/**
 * OpenAPI 3.1 Specification
 *
 * GET /api/v1/openapi.json — machine-readable API documentation.
 *
 * Part of P6.3: Public API for researchers.
 */

import { NextResponse } from "next/server";

export const dynamic = "force-static";

const SPEC = {
  openapi: "3.1.0",
  info: {
    title: "Costa Rica Tree Atlas API",
    version: "1.0.0",
    description:
      "Public REST API for accessing Costa Rica tree species data, species comparisons, and botanical glossary terms. Free to use for research, education, and application development.",
    license: {
      name: "CC BY-NC-SA 4.0",
      url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    },
    contact: {
      name: "Costa Rica Tree Atlas",
      url: "https://costaricatreeatlas.com",
    },
  },
  servers: [
    {
      url: "https://costaricatreeatlas.com/api/v1",
      description: "Production",
    },
  ],
  paths: {
    "/trees": {
      get: {
        operationId: "listTrees",
        summary: "List tree species",
        description:
          "Retrieve a paginated list of tree species with optional filtering and sorting.",
        tags: ["Trees"],
        parameters: [
          { $ref: "#/components/parameters/locale" },
          {
            name: "family",
            in: "query",
            schema: { type: "string" },
            description: "Filter by botanical family name",
          },
          {
            name: "conservationStatus",
            in: "query",
            schema: {
              type: "string",
              enum: ["LC", "NT", "VU", "EN", "CR", "EW", "EX", "DD", "NE"],
            },
            description: "Filter by IUCN conservation status",
          },
          {
            name: "tag",
            in: "query",
            schema: { type: "string" },
            description: "Filter by tag",
          },
          {
            name: "distribution",
            in: "query",
            schema: { type: "string" },
            description:
              "Filter by distribution region (e.g., guanacaste, limon)",
          },
          {
            name: "floweringSeason",
            in: "query",
            schema: { type: "string" },
            description: "Filter by flowering month (e.g., january)",
          },
          {
            name: "fruitingSeason",
            in: "query",
            schema: { type: "string" },
            description: "Filter by fruiting month",
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description:
              "Free-text search across title, scientific name, and description",
          },
          { $ref: "#/components/parameters/page" },
          { $ref: "#/components/parameters/pageSize" },
          {
            name: "sort",
            in: "query",
            schema: {
              type: "string",
              enum: ["title", "scientificName", "family", "updatedAt"],
              default: "title",
            },
          },
          { $ref: "#/components/parameters/order" },
        ],
        responses: {
          "200": {
            description: "Paginated list of trees",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/PaginatedResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Tree" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          "429": { $ref: "#/components/responses/RateLimited" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/trees/{slug}": {
      get: {
        operationId: "getTree",
        summary: "Get a single tree",
        description:
          "Retrieve detailed information about a specific tree species by its slug.",
        tags: ["Trees"],
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Tree slug identifier (e.g., ceiba)",
          },
          { $ref: "#/components/parameters/locale" },
        ],
        responses: {
          "200": {
            description: "Tree details with related species",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/Tree" },
                    _related: {
                      type: "array",
                      items: { $ref: "#/components/schemas/RelatedTree" },
                    },
                  },
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
          "429": { $ref: "#/components/responses/RateLimited" },
        },
      },
    },
    "/families": {
      get: {
        operationId: "listFamilies",
        summary: "List botanical families",
        description:
          "Get all botanical families with species counts for a given locale.",
        tags: ["Trees"],
        parameters: [{ $ref: "#/components/parameters/locale" }],
        responses: {
          "200": {
            description: "List of families",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          speciesCount: { type: "integer" },
                          _links: {
                            type: "object",
                            properties: { species: { type: "string" } },
                          },
                        },
                      },
                    },
                    meta: {
                      type: "object",
                      properties: {
                        totalFamilies: { type: "integer" },
                        totalSpecies: { type: "integer" },
                        locale: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          "429": { $ref: "#/components/responses/RateLimited" },
        },
      },
    },
    "/comparisons": {
      get: {
        operationId: "listComparisons",
        summary: "List species comparisons",
        description:
          "Retrieve a paginated list of species comparison guides with optional filtering.",
        tags: ["Comparisons"],
        parameters: [
          { $ref: "#/components/parameters/locale" },
          {
            name: "species",
            in: "query",
            schema: { type: "string" },
            description:
              "Filter by tree slug — returns comparisons involving this species",
          },
          {
            name: "difficulty",
            in: "query",
            schema: {
              type: "string",
              enum: ["easy", "moderate", "challenging"],
            },
            description: "Filter by difficulty level",
          },
          {
            name: "tag",
            in: "query",
            schema: { type: "string" },
            description:
              "Filter by comparison tag (leaves, bark, fruit, flowers, etc.)",
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Free-text search across title and description",
          },
          { $ref: "#/components/parameters/page" },
          { $ref: "#/components/parameters/pageSize" },
          { $ref: "#/components/parameters/order" },
        ],
        responses: {
          "200": {
            description: "Paginated list of comparisons",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/PaginatedResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Comparison" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          "429": { $ref: "#/components/responses/RateLimited" },
        },
      },
    },
    "/comparisons/{slug}": {
      get: {
        operationId: "getComparison",
        summary: "Get a single comparison",
        description:
          "Retrieve detailed info about a species comparison including embedded species data.",
        tags: ["Comparisons"],
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          { $ref: "#/components/parameters/locale" },
        ],
        responses: {
          "200": {
            description: "Comparison details with embedded species data",
          },
          "404": { $ref: "#/components/responses/NotFound" },
          "429": { $ref: "#/components/responses/RateLimited" },
        },
      },
    },
    "/glossary": {
      get: {
        operationId: "listGlossary",
        summary: "List glossary terms",
        description:
          "Retrieve a paginated list of botanical glossary terms with optional filtering.",
        tags: ["Glossary"],
        parameters: [
          { $ref: "#/components/parameters/locale" },
          {
            name: "category",
            in: "query",
            schema: {
              type: "string",
              enum: [
                "anatomy",
                "ecology",
                "taxonomy",
                "morphology",
                "reproduction",
                "general",
                "timber",
              ],
            },
            description: "Filter by glossary category",
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Free-text search across term and definitions",
          },
          { $ref: "#/components/parameters/page" },
          { $ref: "#/components/parameters/pageSize" },
          { $ref: "#/components/parameters/order" },
        ],
        responses: {
          "200": {
            description: "Paginated list of glossary terms",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/PaginatedResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/GlossaryTerm" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          "429": { $ref: "#/components/responses/RateLimited" },
        },
      },
    },
    "/glossary/{slug}": {
      get: {
        operationId: "getGlossaryTerm",
        summary: "Get a single glossary term",
        description:
          "Retrieve detailed info about a glossary term with embedded related terms and example species.",
        tags: ["Glossary"],
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          { $ref: "#/components/parameters/locale" },
        ],
        responses: {
          "200": {
            description: "Glossary term details with embedded data",
          },
          "404": { $ref: "#/components/responses/NotFound" },
          "429": { $ref: "#/components/responses/RateLimited" },
        },
      },
    },
  },
  components: {
    parameters: {
      locale: {
        name: "locale",
        in: "query",
        schema: { type: "string", enum: ["en", "es"], default: "en" },
        description: "Language code",
      },
      page: {
        name: "page",
        in: "query",
        schema: { type: "integer", minimum: 1, default: 1 },
        description: "Page number",
      },
      pageSize: {
        name: "pageSize",
        in: "query",
        schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
        description: "Items per page (max 100)",
      },
      order: {
        name: "order",
        in: "query",
        schema: { type: "string", enum: ["asc", "desc"], default: "asc" },
        description: "Sort order",
      },
    },
    schemas: {
      Tree: {
        type: "object",
        properties: {
          slug: { type: "string", example: "ceiba" },
          locale: { type: "string", example: "en" },
          title: { type: "string", example: "Ceiba" },
          scientificName: {
            type: "string",
            example: "Ceiba pentandra",
          },
          family: { type: "string", example: "Malvaceae" },
          description: { type: "string" },
          nativeRegion: { type: "string" },
          maxHeight: { type: "string" },
          elevation: { type: "string" },
          conservationStatus: { type: "string", example: "LC" },
          uses: { type: "array", items: { type: "string" } },
          tags: { type: "array", items: { type: "string" } },
          distribution: { type: "array", items: { type: "string" } },
          floweringSeason: { type: "array", items: { type: "string" } },
          fruitingSeason: { type: "array", items: { type: "string" } },
          toxicityLevel: { type: "string" },
          featuredImage: { type: "string" },
          publishedAt: { type: "string", format: "date" },
          updatedAt: { type: "string", format: "date" },
          _links: {
            type: "object",
            properties: {
              self: { type: "string" },
              html: { type: "string" },
            },
          },
        },
        required: [
          "slug",
          "locale",
          "title",
          "scientificName",
          "family",
          "description",
        ],
      },
      RelatedTree: {
        type: "object",
        properties: {
          slug: { type: "string" },
          title: { type: "string" },
          scientificName: { type: "string" },
          _links: {
            type: "object",
            properties: { self: { type: "string" } },
          },
        },
      },
      Comparison: {
        type: "object",
        properties: {
          slug: { type: "string" },
          locale: { type: "string" },
          title: { type: "string" },
          species: { type: "array", items: { type: "string" } },
          keyDifference: { type: "string" },
          description: { type: "string" },
          difficulty: {
            type: "string",
            enum: ["easy", "moderate", "challenging"],
          },
          confusionRating: { type: "integer", minimum: 1, maximum: 5 },
          comparisonTags: { type: "array", items: { type: "string" } },
          seasonalNote: { type: "string" },
          _links: {
            type: "object",
            properties: {
              self: { type: "string" },
              html: { type: "string" },
            },
          },
        },
        required: [
          "slug",
          "locale",
          "title",
          "species",
          "keyDifference",
          "description",
        ],
      },
      GlossaryTerm: {
        type: "object",
        properties: {
          slug: { type: "string" },
          locale: { type: "string" },
          term: { type: "string" },
          simpleDefinition: { type: "string" },
          technicalDefinition: { type: "string" },
          category: {
            type: "string",
            enum: [
              "anatomy",
              "ecology",
              "taxonomy",
              "morphology",
              "reproduction",
              "general",
              "timber",
            ],
          },
          pronunciation: { type: "string" },
          etymology: { type: "string" },
          exampleSpecies: { type: "array", items: { type: "string" } },
          relatedTerms: { type: "array", items: { type: "string" } },
          _links: {
            type: "object",
            properties: {
              self: { type: "string" },
              html: { type: "string" },
            },
          },
        },
        required: ["slug", "locale", "term", "simpleDefinition", "category"],
      },
      PaginatedResponse: {
        type: "object",
        properties: {
          pagination: {
            type: "object",
            properties: {
              page: { type: "integer" },
              pageSize: { type: "integer" },
              total: { type: "integer" },
              totalPages: { type: "integer" },
              hasNext: { type: "boolean" },
              hasPrev: { type: "boolean" },
            },
          },
          _links: {
            type: "object",
            properties: {
              self: { type: "string" },
              first: { type: "string" },
              last: { type: "string" },
              next: { type: "string" },
              prev: { type: "string" },
            },
          },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
              details: { type: "object" },
            },
            required: ["code", "message"],
          },
          _links: {
            type: "object",
            properties: { documentation: { type: "string" } },
          },
        },
      },
    },
    responses: {
      RateLimited: {
        description: "Rate limit exceeded (100 requests per minute)",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
        headers: {
          "X-RateLimit-Limit": {
            schema: { type: "integer" },
            description: "Max requests per window",
          },
          "X-RateLimit-Remaining": {
            schema: { type: "integer" },
            description: "Remaining requests in window",
          },
          "X-RateLimit-Reset": {
            schema: { type: "integer" },
            description: "Unix timestamp when window resets",
          },
        },
      },
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      InternalError: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
    },
  },
  tags: [
    {
      name: "Trees",
      description: "Tree species data — 175 species documented in EN and ES",
    },
    {
      name: "Comparisons",
      description:
        "Species comparison guides — side-by-side identification help",
    },
    {
      name: "Glossary",
      description: "Botanical glossary — 150 terms with definitions",
    },
  ],
};

export function GET() {
  return NextResponse.json(SPEC, {
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
