function createErrorMessage ({ instance, method, expectedType, actual }) {
  return `${instance}#${method} expected to receive ${expectedType} but got: ${actual}`
}

export default createErrorMessage
