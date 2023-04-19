interface ErrorsObject {
  [key: string]: any
  _errors?: string[]
}

export function findErrorsRequest(
  obj: any,
  results: ErrorsObject[] = [],
): ErrorsObject[] {
  if (Array.isArray(obj)) {
    for (const item of obj) {
      findErrorsRequest(item, results)
    }
  } else if (typeof obj === 'object') {
    if (obj._errors && obj._errors.length > 0) {
      results.push(obj)
    }

    for (const key in obj) {
      findErrorsRequest(obj[key], results)
    }
  }

  return results
}
