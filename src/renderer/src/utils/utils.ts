export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const getParcelByWeight = (weight, parcelRanges): any => {
  return (
    parcelRanges.find((p) => {
      const minOK = p.min_inclusive ? weight >= p.min_kg : weight > p.min_kg

      const maxOK =
        p.max_kg === null
          ? true // open-ended
          : p.max_inclusive
            ? weight <= p.max_kg
            : weight < p.max_kg

      return minOK && maxOK
    }) || null
  ) // no match
}
