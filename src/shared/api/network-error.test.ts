import { describe, expect, it } from "vitest";

import { isNoInternetError } from "./network-error";

describe("isNoInternetError", () => {
  it.each(["ERR_INTERNET_DISCONNECTED", "ERR_NETWORK", "NETWORK_ERROR"])(
    "recognizes the %s error code",
    (code) => {
      expect(isNoInternetError({ code })).toBe(true);
    },
  );

  it("recognizes a nested GraphQL extension code", () => {
    expect(isNoInternetError({ errors: [{ extensions: { code: "NETWORK_ERROR" } }] })).toBe(true);
  });

  it("does not treat a server error as an internet error", () => {
    expect(isNoInternetError({ extensions: { code: "INTERNAL_SERVER_ERROR" } })).toBe(false);
  });
});
