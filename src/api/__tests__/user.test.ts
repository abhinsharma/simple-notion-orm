import { describe, it, expect } from "vitest";
import { getSelf, getUser, listUsers } from "../user";

describe("getUser", () => {
  it("retrieves a user by ID", async () => {
    const result = await getUser("obf_user_1");

    expect(result.object).toBe("user");
    expect(result.id).toBe("obf_user_1");
  });
});

describe("getSelf", () => {
  it("retrieves the bot user for the token", async () => {
    const result = await getSelf();

    expect(result.object).toBe("user");
    expect(result.type).toBe("bot");
  });
});

describe("listUsers", () => {
  it("follows the cursor and returns users from every page", async () => {
    const result = await listUsers();

    expect(result.map((user) => user.id)).toEqual(["obf_user_1", "obf_bot_1"]);
  });
});
