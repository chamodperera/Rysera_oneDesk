import supertest from "supertest";
import { createServer } from "../server";

describe("Server", () => {
  it("health check returns 200", async () => {
    await supertest(createServer())
      .get("/api/health")
      .expect(200)
      .then((res) => {
        expect(res.ok).toBe(true);
      });
  });

  it("message endpoint says hello", async () => {
    await supertest(createServer())
      .get("/api/message/jared")
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({ message: "Hello jared from OneDesk!" });
      });
  });
});
