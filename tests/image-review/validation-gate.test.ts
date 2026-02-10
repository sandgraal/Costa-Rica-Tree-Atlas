import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

interface ProposalRecord {
  id: string;
  treeSlug: string;
  imageType: string;
  currentUrl: string | null;
  currentSource: string | null;
  currentAlt: string | null;
  proposedUrl: string;
  proposedSource: string | null;
  proposedAlt: string | null;
  source: string;
  reason: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface AuditRecord {
  id: string;
  proposalId: string | null;
  treeSlug: string;
  imageType: string;
  action: string;
  notes: string | null;
  previousValue?: string | null;
  newValue?: string | null;
  actorId?: string | null;
  createdAt: string;
}

const state: {
  proposals: ProposalRecord[];
  audits: AuditRecord[];
} = {
  proposals: [],
  audits: [],
};

const queryRawMock = vi.fn(
  async (strings: TemplateStringsArray, ...args: unknown[]) => {
    const sql = strings.join(" ");

    if (sql.includes("SELECT 1 FROM image_proposals LIMIT 1")) {
      return [{ ok: 1 }];
    }

    if (
      sql.includes("SELECT COUNT(*) as count") &&
      sql.includes("FROM image_proposals")
    ) {
      return [{ count: BigInt(state.proposals.length) }];
    }

    if (
      sql.includes("SELECT id FROM image_proposals") &&
      sql.includes("status = 'PENDING'")
    ) {
      const [treeSlug, imageType] = args as [string, string];
      return state.proposals
        .filter(
          (proposal) =>
            proposal.treeSlug === treeSlug &&
            proposal.imageType === imageType &&
            proposal.status === "PENDING"
        )
        .map((proposal) => ({ id: proposal.id }));
    }

    if (
      sql.includes("FROM image_proposals") &&
      sql.includes("WHERE id =") &&
      sql.includes('proposed_url as "proposedUrl"')
    ) {
      const [proposalId] = args as [string];
      const proposal = state.proposals.find((entry) => entry.id === proposalId);
      if (!proposal) {
        return [];
      }

      return [
        {
          id: proposal.id,
          treeSlug: proposal.treeSlug,
          imageType: proposal.imageType,
          currentUrl: proposal.currentUrl,
          currentSource: proposal.currentSource,
          currentAlt: proposal.currentAlt,
          proposedUrl: proposal.proposedUrl,
          proposedSource: proposal.proposedSource,
          proposedAlt: proposal.proposedAlt,
          qualityScore: null,
          resolution: null,
          fileSize: null,
          source: proposal.source,
          reason: proposal.reason,
          workflowRunId: null,
          status: proposal.status,
          reviewedBy: null,
          reviewedAt: null,
          reviewNotes: null,
          upvotes: 0,
          downvotes: 0,
          flagCount: 0,
          createdAt: proposal.createdAt,
          updatedAt: proposal.updatedAt,
        },
      ];
    }

    if (
      sql.includes("SELECT id, status, tree_slug, image_type") &&
      sql.includes("FROM image_proposals")
    ) {
      const [proposalId] = args as [string];
      const proposal = state.proposals.find((entry) => entry.id === proposalId);
      if (!proposal) {
        return [];
      }

      return [
        {
          id: proposal.id,
          status: proposal.status,
          tree_slug: proposal.treeSlug,
          image_type: proposal.imageType,
        },
      ];
    }

    if (sql.includes("FROM image_proposals") && sql.includes("ORDER BY")) {
      const lastTwo = args.slice(-2) as [number, number];
      const limit = Number(lastTwo[0]);
      const offset = Number(lastTwo[1]);

      return state.proposals.slice(offset, offset + limit).map((proposal) => ({
        id: proposal.id,
        treeSlug: proposal.treeSlug,
        imageType: proposal.imageType,
        currentUrl: proposal.currentUrl,
        currentSource: proposal.currentSource,
        currentAlt: proposal.currentAlt,
        proposedUrl: proposal.proposedUrl,
        proposedSource: proposal.proposedSource,
        proposedAlt: proposal.proposedAlt,
        qualityScore: null,
        resolution: null,
        fileSize: null,
        source: proposal.source,
        reason: proposal.reason,
        workflowRunId: null,
        status: proposal.status,
        reviewedBy: null,
        reviewedAt: null,
        reviewNotes: null,
        upvotes: 0,
        downvotes: 0,
        flagCount: 0,
        createdAt: proposal.createdAt,
        updatedAt: proposal.updatedAt,
      }));
    }

    if (sql.includes("FROM image_votes") && sql.includes("proposal_id =")) {
      return [{ upvotes: BigInt(0), downvotes: BigInt(0), flags: BigInt(0) }];
    }

    if (
      sql.includes("FROM image_audits") &&
      sql.includes("ORDER BY created_at DESC")
    ) {
      const [proposalId] = args as [string];
      return state.audits
        .filter((audit) => audit.proposalId === proposalId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((audit) => ({
          id: audit.id,
          action: audit.action,
          actorId: audit.actorId ?? null,
          previousValue: audit.previousValue ?? null,
          newValue: audit.newValue ?? null,
          notes: audit.notes,
          createdAt: audit.createdAt,
        }));
    }

    return [];
  }
);

const executeRawMock = vi.fn(
  async (strings: TemplateStringsArray, ...args: unknown[]) => {
    const sql = strings.join(" ");
    const now = new Date().toISOString();

    if (sql.includes("INSERT INTO image_proposals")) {
      const [
        id,
        treeSlug,
        imageType,
        currentUrl,
        currentSource,
        currentAlt,
        proposedUrl,
        proposedSource,
        proposedAlt,
        _qualityScore,
        _resolution,
        _fileSize,
        source,
        reason,
        _workflowRunId,
      ] = args as string[];

      state.proposals.push({
        id,
        treeSlug,
        imageType,
        currentUrl,
        currentSource,
        currentAlt,
        proposedUrl,
        proposedSource,
        proposedAlt,
        source,
        reason,
        status: "PENDING",
        createdAt: now,
        updatedAt: now,
      });

      return 1;
    }

    if (sql.includes("UPDATE image_proposals") && sql.includes("reviewed_by")) {
      const [status, _actorId, _reviewNotes, proposalId] = args as [
        string,
        string,
        string,
        string,
      ];

      state.proposals = state.proposals.map((proposal) =>
        proposal.id === proposalId
          ? {
              ...proposal,
              status,
              updatedAt: now,
            }
          : proposal
      );

      return 1;
    }

    if (sql.includes("INSERT INTO image_audits")) {
      // POST route: 6 args (id, proposal_id, tree_slug, image_type, new_value, notes)
      // Note: action='PROPOSAL_CREATED' is a SQL literal, not a parameter
      // PATCH route: 9 args (id, proposal_id, tree_slug, image_type, action, actor_id, previous_value, new_value, notes)

      if (args.length === 6) {
        // POST route pattern
        const [auditId, proposalId, treeSlug, imageType, newValue, notes] =
          args;

        state.audits.push({
          id: String(auditId),
          proposalId: proposalId ? String(proposalId) : null,
          treeSlug: String(treeSlug),
          imageType: String(imageType),
          action: "PROPOSAL_CREATED",
          actorId: null,
          previousValue: null,
          newValue:
            typeof newValue === "string" ? newValue : JSON.stringify(newValue),
          notes: notes ? String(notes) : null,
          createdAt: now,
        });
      } else {
        // PATCH route pattern (9 args)
        const [
          auditId,
          proposalId,
          treeSlug,
          imageType,
          action,
          actorId,
          previousValue,
          newValue,
          notes,
        ] = args;

        state.audits.push({
          id: String(auditId),
          proposalId: proposalId ? String(proposalId) : null,
          treeSlug: String(treeSlug),
          imageType: String(imageType),
          action: String(action),
          actorId: actorId ? String(actorId) : null,
          previousValue:
            typeof previousValue === "string"
              ? previousValue
              : JSON.stringify(previousValue),
          newValue:
            typeof newValue === "string" ? newValue : JSON.stringify(newValue),
          notes: notes ? String(notes) : null,
          createdAt: now,
        });
      }

      return 1;
    }

    return 1;
  }
);

vi.mock("@/lib/prisma", () => ({
  default: {
    $queryRaw: queryRawMock,
    $executeRaw: executeRawMock,
  },
}));

const getServerSessionMock = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

describe("Priority 0.3 validation gate - proposal workflow", () => {
  beforeEach(() => {
    state.proposals = [];
    state.audits = [];
    queryRawMock.mockClear();
    executeRawMock.mockClear();
    // Initially return null to ensure workflow requests don't require a session
    getServerSessionMock.mockResolvedValue(null);
  });

  it("creates 10 proposals, lists them, exposes comparison payload, and records review audit", async () => {
    const { POST: createProposal, GET: listProposals } =
      await import("@/app/api/admin/images/proposals/route");
    const { GET: getProposal, PATCH: updateProposal } =
      await import("@/app/api/admin/images/proposals/[id]/route");

    for (let i = 1; i <= 10; i += 1) {
      const request = new NextRequest(
        "http://localhost/api/admin/images/proposals",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: "Bearer workflow-test",
          },
          body: JSON.stringify({
            treeSlug: `species-${i}`,
            imageType: "FEATURED",
            currentUrl: `https://example.com/current-${i}.jpg`,
            proposedUrl: `https://example.com/proposed-${i}.jpg`,
            source: "WORKFLOW",
            reason: "Higher resolution sample",
          }),
        }
      );

      const response = await createProposal(request);
      expect(response.status).toBe(201);
    }

    // Verify PROPOSAL_CREATED audit entries were created
    expect(
      state.audits.filter((audit) => audit.action === "PROPOSAL_CREATED")
    ).toHaveLength(10);

    // Set authenticated session for GET operations (which require authentication)
    getServerSessionMock.mockResolvedValue({ user: { id: "admin-test-user" } });

    const listResponse = await listProposals(
      new NextRequest(
        "http://localhost/api/admin/images/proposals?page=1&limit=20"
      )
    );
    expect(listResponse.status).toBe(200);

    const listBody = (await listResponse.json()) as {
      data: Array<{ id: string }>;
      pagination: { total: number };
    };

    expect(listBody.pagination.total).toBe(10);
    expect(listBody.data).toHaveLength(10);

    const proposalId = listBody.data[0].id;
    const detailResponse = await getProposal(
      new NextRequest("http://localhost"),
      {
        params: Promise.resolve({ id: proposalId }),
      }
    );

    expect(detailResponse.status).toBe(200);
    const detailBody = (await detailResponse.json()) as {
      data: {
        currentUrl: string | null;
        proposedUrl: string;
        auditHistory: unknown[];
      };
    };

    expect(detailBody.data.currentUrl).toContain("current-");
    expect(detailBody.data.proposedUrl).toContain("proposed-");

    const patchResponse = await updateProposal(
      new NextRequest("http://localhost", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status: "APPROVED",
          reviewNotes: "Validated in test",
        }),
      }),
      { params: Promise.resolve({ id: proposalId }) }
    );

    expect(patchResponse.status).toBe(200);

    const detailAfterPatch = await getProposal(
      new NextRequest("http://localhost"),
      {
        params: Promise.resolve({ id: proposalId }),
      }
    );
    const detailAfterPatchBody = (await detailAfterPatch.json()) as {
      data: { status: string; auditHistory: Array<{ action: string }> };
    };

    expect(detailAfterPatchBody.data.status).toBe("APPROVED");
    expect(
      detailAfterPatchBody.data.auditHistory.some(
        (entry) => entry.action === "PROPOSAL_APPROVED"
      )
    ).toBe(true);
  });
});
