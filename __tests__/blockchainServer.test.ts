import request from "supertest";
import Block from "../src/lib/block";
import { app } from "../src/server/blockchainServer";

// testes automatizados

jest.mock("../src/lib/block");
jest.mock("../src/lib/blockchain");

describe("BlockchainServer Tests", () => {
  test("GET /status - Should return status", async () => {
    const res = await request(app).get("/status/");

    expect(res.status).toEqual(200);
    expect(res.body.isValid.success).toEqual(true);
  });

  test("GET /blocks/:index - Should get Genesis", async () => {
    const res = await request(app).get("/blocks/0");

    expect(res.status).toEqual(200);
    expect(res.body.index).toEqual(0);
  });

  test("GET /blocks/next - Should get next block info", async () => {
    const res = await request(app).get("/blocks/next");

    expect(res.status).toEqual(200);
    expect(res.body.index).toEqual(1);
  });

  test("GET /blocks/:hash - Should get Block", async () => {
    const res = await request(app).get("/blocks/abc");

    expect(res.status).toEqual(200);
    expect(res.body.hash).toEqual("abc");
  });

  test("GET /blocks/:index - Should NOT get Block", async () => {
    const res = await request(app).get("/blocks/-1");

    expect(res.status).toEqual(404);
  });

  test("POST /blocks/ - Should add Block", async () => {
    const block = new Block({ index: 1 } as Block);
    const res = await request(app).post("/blocks/").send(block);

    expect(res.status).toEqual(201);
    expect(res.body.index).toEqual(1);
  });

  test("POST /blocks/ - Should NOT add Block (empty)", async () => {
    const res = await request(app).post("/blocks/").send({});

    expect(res.status).toEqual(422);
  });

  test("POST /blocks/ - Should NOT add Block (invalid)", async () => {
    const block = new Block({ index: -1 } as Block);
    const res = await request(app).post("/blocks/").send(block);

    expect(res.status).toEqual(400);
  });
});
