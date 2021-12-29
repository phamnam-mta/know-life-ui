function getHighlight(hit, fieldName) {
  console.log(hit)
  if (
    !hit.highlight ||
    !hit.highlight[fieldName] ||
    hit.highlight[fieldName].length < 1
  ) {
    return;
  }

  return hit.highlight[fieldName][0];
}

function buildResults(hits) {
  const addEachKeyValueToObject = (acc, [key, value]) => ({
    ...acc,
    [key]: value
  });

  const toObject = (value, snippet) => {
    return { raw: value, ...(snippet && { snippet }) };
  };

  return hits.map(record => {
    return Object.entries(record)
      .map(([fieldName, fieldValue]) => [
        fieldName,
        toObject(fieldValue, getHighlight(record, fieldName))
      ])
      .reduce(addEachKeyValueToObject, {});
  });
}

export default function buildState(response, resultsPerPage) {
  const results = buildResults(response).map(item=>{
    delete item.highlight
    return item
  })

  return {
    results
  };
}
