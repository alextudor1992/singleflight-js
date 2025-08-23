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

import { from, lastValueFrom, Observable, takeLast, timeout } from 'rxjs'

type RequestOptions = {
  timeoutMs?: number
}

const singleFlightRequests = new Map<string, Observable<unknown>>()

export async function request<T>(key: string, fn: () => Promise<T>, opts?: RequestOptions) {
  let observable = singleFlightRequests.get(key)

  if (!observable) {
    observable = from(new Promise((resolve) => void fn().then(resolve)))
      .pipe(takeLast(1))

    if (opts?.timeoutMs) {
      observable = observable.pipe(timeout(opts.timeoutMs))
    }

    const cleanup = () => singleFlightRequests.delete(key)

    observable.subscribe({
      complete: cleanup,
      error: cleanup,
    })

    singleFlightRequests.set(key, observable)
  }
  return await lastValueFrom(observable)
}

export function cancel(key: string) {
  return singleFlightRequests.delete(key)
}
