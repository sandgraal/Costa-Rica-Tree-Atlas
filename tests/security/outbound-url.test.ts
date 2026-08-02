import { describe, expect, it } from "vitest";
import {
  assertAllowedImageUrl,
  isAllowedImageUrl,
  BlockedUrlError,
  ALLOWED_IMAGE_HOSTS,
} from "@/lib/security/outbound-url";

/**
 * SSRF guard for the image-proposal apply flow.
 *
 * `downloadImage()` fetches a URL that arrives in a request body. Before this
 * guard existed, an admin clicking "apply" made the server fetch whatever the
 * proposal author chose — including cloud metadata and private-network hosts.
 */
describe("assertAllowedImageUrl", () => {
  it("accepts every host in the allowlist over https", () => {
    for (const host of ALLOWED_IMAGE_HOSTS) {
      expect(() =>
        assertAllowedImageUrl(`https://${host}/photos/1/medium.jpg`)
      ).not.toThrow();
    }
  });

  it("rejects the cloud instance metadata endpoint", () => {
    expect(() =>
      assertAllowedImageUrl("http://169.254.169.254/latest/meta-data/")
    ).toThrow(BlockedUrlError);
  });

  it.each([
    ["loopback by name", "https://localhost/admin"],
    ["loopback by IP", "https://127.0.0.1/admin"],
    ["private RFC1918 range", "https://10.0.0.5/internal"],
    ["link-local IPv6", "https://[fe80::1]/internal"],
    ["arbitrary external host", "https://attacker.example.com/payload.jpg"],
  ])("rejects %s", (_label, url) => {
    expect(() => assertAllowedImageUrl(url)).toThrow(BlockedUrlError);
  });

  it("rejects plain http even on an allowlisted host", () => {
    expect(() =>
      assertAllowedImageUrl("http://static.inaturalist.org/photos/1.jpg")
    ).toThrow(BlockedUrlError);
  });

  it("rejects a lookalike host that merely contains an allowed host", () => {
    expect(() =>
      assertAllowedImageUrl("https://static.inaturalist.org.evil.test/a.jpg")
    ).toThrow(BlockedUrlError);
  });

  it("rejects non-absolute and malformed URLs", () => {
    expect(() => assertAllowedImageUrl("/images/local.jpg")).toThrow(
      BlockedUrlError
    );
    expect(() => assertAllowedImageUrl("not a url")).toThrow(BlockedUrlError);
  });

  it("isAllowedImageUrl mirrors assertAllowedImageUrl without throwing", () => {
    expect(isAllowedImageUrl("https://static.inaturalist.org/p/1.jpg")).toBe(
      true
    );
    expect(isAllowedImageUrl("http://169.254.169.254/")).toBe(false);
  });
});
