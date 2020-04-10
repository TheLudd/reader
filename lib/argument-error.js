import createErrorMessage from './create-error-message'

class ArgumentError extends Error {
  constructor (instance, method, expectedType, actual) {
    super(createErrorMessage({
      actual,
      expectedType,
      instance,
      method,
    }))
  }
}

export default ArgumentError
