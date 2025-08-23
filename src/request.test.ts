import { expect, vi, describe } from "vitest";
import { request } from "./request";

describe('request', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('should call the async fn once', async () => {
    const handler = vi.fn().mockImplementation(() => Promise.resolve(45))

    await expect(Promise.all([
      request('uid', handler),
      request('uid', handler),
      request('uid', handler),
    ])).resolves.toEqual([45, 45, 45])

    expect(handler).toHaveBeenCalledOnce()

    const handler2 = vi.fn().mockImplementation(() => Promise.resolve("some value"))

    await expect(Promise.all([
      request('uid', handler2),
      request('uid', handler2),
    ])).resolves.toEqual(["some value", "some value"])

    expect(handler2).toHaveBeenCalledOnce()
    expect(handler).toHaveBeenCalledOnce()
  })
});