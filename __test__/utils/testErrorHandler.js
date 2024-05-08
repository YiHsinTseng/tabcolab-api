function handleException(response, e) {
  let customErrorMessage;
  if (response.body !== undefined) {
    customErrorMessage = `Actual Response Body:\n ${JSON.stringify(response.body, null, 2)}\n \n ${e.message}`;
  } else {
    const result = response;
    customErrorMessage = `Actual Result Difference:\n ${JSON.stringify(result, null, 2)}\n \n ${e.message}`;
  }
  throw new Error(customErrorMessage); // 重新抛出异常
}

module.exports = { handleException };
