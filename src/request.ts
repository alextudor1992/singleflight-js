/*
 * Copyright (c) 2025 Intent. All rights reserved.
 *
 * This source code is confidential and proprietary information of
 * Intent ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Intent.
 *
 */

import { finalize, from, lastValueFrom, Observable, pipe, shareReplay, takeLast, timeout } from 'rxjs'

type RequestOptions = {
  timeoutMs?: number
}

const singleFlightRequests = new Map<string, Observable<unknown>>()

export async function request<T>(key: string, fn: () => Promise<T>, opts?: RequestOptions): Promise<T> {
  let observable = singleFlightRequests.get(key)

  if (!observable) {
    observable = from(fn()).pipe(
      opts?.timeoutMs ? timeout(opts.timeoutMs) : pipe(),
      shareReplay({ bufferSize: 1, refCount: true }),
      takeLast(1),
      finalize(() => singleFlightRequests.delete(key))
    )
    singleFlightRequests.set(key, observable)
  }
  return await lastValueFrom(observable as Observable<T>)
}

/**
 * Removes a pending request from the single-flight cache.
 * Note: This does NOT cancel the in-flight request for existing subscribers.
 * It only ensures that the *next* call to `request` for this key will
 * trigger a new execution of `fn()`.
 */
export function forget(key: string) {
  return singleFlightRequests.delete(key)
}
