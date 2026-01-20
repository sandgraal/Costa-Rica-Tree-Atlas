"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface APIDocumentationProps {
  locale: string;
}

export function APIDocumentation({ locale }: APIDocumentationProps) {
  const t = useTranslations("api");
  const [activeTab, setActiveTab] = useState<"curl" | "javascript" | "python">(
    "curl"
  );

  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "https://costaricatreeatlas.com";

  return (
    <div className="space-y-12">
      {/* Introduction */}
      <section className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
          {t("gettingStarted")}
        </h2>
        <p className="mb-4 text-gray-600 dark:text-gray-300">
          {t("gettingStartedDesc")}
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 font-medium text-gray-900 dark:text-white">
              {t("baseUrl")}
            </h3>
            <code className="block rounded bg-gray-100 p-3 text-sm dark:bg-gray-700">
              {baseUrl}/api/v1
            </code>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-gray-900 dark:text-white">
              {t("authentication")}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">{t("authDesc")}</p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-gray-900 dark:text-white">
              {t("rateLimit")}
            </h3>
            <p className="mb-2 text-gray-600 dark:text-gray-300">
              {t("rateLimitDesc")}
            </p>
            <div className="rounded bg-gray-100 p-3 text-sm dark:bg-gray-700">
              <div className="grid gap-2 text-gray-700 dark:text-gray-300">
                <div>
                  <code>X-RateLimit-Limit</code>: Maximum requests per window
                </div>
                <div>
                  <code>X-RateLimit-Remaining</code>: Remaining requests
                </div>
                <div>
                  <code>X-RateLimit-Reset</code>: Unix timestamp when limit
                  resets
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {t("endpoints")}
        </h2>

        {/* List Trees */}
        <EndpointCard
          method="GET"
          path="/api/v1/trees"
          title={t("trees.list")}
          description={t("trees.listDesc")}
          parameters={[
            { name: "locale", type: "string", desc: t("params.locale") },
            { name: "family", type: "string", desc: t("params.family") },
            {
              name: "conservationStatus",
              type: "string",
              desc: t("params.conservationStatus"),
            },
            { name: "tag", type: "string", desc: t("params.tag") },
            {
              name: "distribution",
              type: "string",
              desc: t("params.distribution"),
            },
            {
              name: "floweringSeason",
              type: "string",
              desc: t("params.floweringSeason"),
            },
            {
              name: "fruitingSeason",
              type: "string",
              desc: t("params.fruitingSeason"),
            },
            { name: "search", type: "string", desc: t("params.search") },
            { name: "page", type: "number", desc: t("params.page") },
            { name: "pageSize", type: "number", desc: t("params.pageSize") },
            { name: "sort", type: "string", desc: t("params.sort") },
            { name: "order", type: "string", desc: t("params.order") },
          ]}
          example={`${baseUrl}/api/v1/trees?locale=${locale}&family=Fabaceae&pageSize=10`}
          response={`{
  "data": [
    {
      "slug": "guanacaste",
      "locale": "${locale}",
      "title": "Guanacaste",
      "scientificName": "Enterolobium cyclocarpum",
      "family": "Fabaceae",
      "description": "...",
      "_links": {
        "self": "/api/v1/trees/guanacaste?locale=${locale}",
        "html": "/${locale}/trees/guanacaste"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "_links": {
    "self": "/api/v1/trees?page=1",
    "first": "/api/v1/trees?page=1",
    "last": "/api/v1/trees?page=3",
    "next": "/api/v1/trees?page=2"
  }
}`}
        />

        {/* Get Tree */}
        <EndpointCard
          method="GET"
          path="/api/v1/trees/{slug}"
          title={t("trees.get")}
          description={t("trees.getDesc")}
          parameters={[
            {
              name: "slug",
              type: "string",
              desc: t("params.slug"),
              required: true,
            },
            { name: "locale", type: "string", desc: t("params.locale") },
          ]}
          example={`${baseUrl}/api/v1/trees/guanacaste?locale=${locale}`}
          response={`{
  "data": {
    "slug": "guanacaste",
    "locale": "${locale}",
    "title": "Guanacaste",
    "scientificName": "Enterolobium cyclocarpum",
    "family": "Fabaceae",
    "description": "National tree of Costa Rica...",
    "nativeRegion": "Central America",
    "maxHeight": "25-35m",
    "conservationStatus": "LC",
    "uses": ["Shade", "Timber", "Fodder"],
    "floweringSeason": ["March", "April", "May"],
    "_links": {
      "self": "/api/v1/trees/guanacaste?locale=${locale}",
      "html": "/${locale}/trees/guanacaste"
    }
  },
  "_related": [
    {
      "slug": "cenizaro",
      "title": "Cenízaro",
      "scientificName": "Samanea saman",
      "_links": { "self": "/api/v1/trees/cenizaro?locale=${locale}" }
    }
  ]
}`}
        />

        {/* List Families */}
        <EndpointCard
          method="GET"
          path="/api/v1/families"
          title={t("families.list")}
          description={t("families.listDesc")}
          parameters={[
            { name: "locale", type: "string", desc: t("params.locale") },
          ]}
          example={`${baseUrl}/api/v1/families?locale=${locale}`}
          response={`{
  "data": [
    {
      "name": "Fabaceae",
      "speciesCount": 12,
      "_links": {
        "species": "/api/v1/trees?family=Fabaceae&locale=${locale}"
      }
    },
    {
      "name": "Bignoniaceae",
      "speciesCount": 8,
      "_links": {
        "species": "/api/v1/trees?family=Bignoniaceae&locale=${locale}"
      }
    }
  ],
  "meta": {
    "totalFamilies": 35,
    "totalSpecies": 120,
    "locale": "${locale}"
  },
  "_links": {
    "self": "/api/v1/families?locale=${locale}",
    "trees": "/api/v1/trees?locale=${locale}"
  }
}`}
        />
      </section>

      {/* Code Examples */}
      <section className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
          {t("codeExamples")}
        </h2>

        <div className="mb-4 flex gap-2">
          {(["curl", "javascript", "python"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded px-4 py-2 text-sm font-medium ${
                activeTab === tab
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {tab === "curl"
                ? "cURL"
                : tab === "javascript"
                  ? "JavaScript"
                  : "Python"}
            </button>
          ))}
        </div>

        <pre className="overflow-x-auto rounded bg-gray-900 p-4 text-sm text-gray-100">
          <code>
            {activeTab === "curl" &&
              `# List all trees
curl "${baseUrl}/api/v1/trees?locale=${locale}"

# Get a specific tree
curl "${baseUrl}/api/v1/trees/guanacaste?locale=${locale}"

# Search for trees
curl "${baseUrl}/api/v1/trees?search=ceiba&locale=${locale}"

# Filter by family
curl "${baseUrl}/api/v1/trees?family=Fabaceae&locale=${locale}"

# Get all families
curl "${baseUrl}/api/v1/families?locale=${locale}"`}
            {activeTab === "javascript" &&
              `// List all trees
const response = await fetch('${baseUrl}/api/v1/trees?locale=${locale}');
const { data, pagination } = await response.json();
console.log(\`Found \${pagination.total} trees\`);

// Get a specific tree
const treeResponse = await fetch('${baseUrl}/api/v1/trees/guanacaste?locale=${locale}');
const { data: tree, _related } = await treeResponse.json();
console.log(tree.scientificName);

// Search and filter
const searchParams = new URLSearchParams({
  locale: '${locale}',
  family: 'Fabaceae',
  search: 'guanacaste',
  pageSize: '10'
});
const filtered = await fetch(\`${baseUrl}/api/v1/trees?\${searchParams}\`);`}
            {activeTab === "python" &&
              `import requests

# List all trees
response = requests.get('${baseUrl}/api/v1/trees', params={'locale': '${locale}'})
data = response.json()
print(f"Found {data['pagination']['total']} trees")

# Get a specific tree
tree_response = requests.get('${baseUrl}/api/v1/trees/guanacaste', params={'locale': '${locale}'})
tree = tree_response.json()['data']
print(tree['scientificName'])

# Search and filter
params = {
    'locale': '${locale}',
    'family': 'Fabaceae',
    'search': 'guanacaste',
    'pageSize': 10
}
filtered = requests.get('${baseUrl}/api/v1/trees', params=params)`}
          </code>
        </pre>
      </section>

      {/* Support & License */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            {t("support")}
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            {t("supportDesc")}
          </p>
          <a
            href="https://github.com/sandgraal/Costa-Rica-Tree-Atlas/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 dark:text-green-400"
          >
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            GitHub Issues
          </a>
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            {t("license")}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">{t("licenseDesc")}</p>
        </div>
      </section>
    </div>
  );
}

interface Parameter {
  name: string;
  type: string;
  desc: string;
  required?: boolean;
}

interface EndpointCardProps {
  method: string;
  path: string;
  title: string;
  description: string;
  parameters: Parameter[];
  example: string;
  response: string;
}

function EndpointCard({
  method,
  path,
  title,
  description,
  parameters,
  example,
  response,
}: EndpointCardProps) {
  const [showResponse, setShowResponse] = useState(false);

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="mb-2 flex items-center gap-3">
          <span className="rounded bg-green-100 px-2 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
            {method}
          </span>
          <code className="text-sm text-gray-700 dark:text-gray-300">
            {path}
          </code>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-1 text-gray-600 dark:text-gray-300">{description}</p>
      </div>

      <div className="p-4">
        <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
          Parameters
        </h4>
        <div className="space-y-2">
          {parameters.map((param) => (
            <div key={param.name} className="flex items-start gap-4 text-sm">
              <code className="min-w-[140px] text-gray-700 dark:text-gray-300">
                {param.name}
                {param.required && <span className="ml-1 text-red-500">*</span>}
              </code>
              <span className="text-gray-500">{param.type}</span>
              <span className="text-gray-600 dark:text-gray-400">
                {param.desc}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
          Example
        </h4>
        <div className="flex items-center gap-2">
          <code className="flex-1 overflow-x-auto rounded bg-gray-100 p-2 text-sm dark:bg-gray-700">
            {example}
          </code>
          <a
            href={example}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Try it
          </a>
        </div>
      </div>

      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        <button
          onClick={() => setShowResponse(!showResponse)}
          className="flex items-center gap-2 font-medium text-gray-900 dark:text-white"
        >
          <svg
            className={`h-4 w-4 transform transition-transform ${showResponse ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          Response
        </button>
        {showResponse && (
          <pre className="mt-2 overflow-x-auto rounded bg-gray-900 p-4 text-sm text-gray-100">
            <code>{response}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
