import createErrorMessage from './create-error-message'

class ArgumentError extends Error {

  constructor (instance, method, expectedType, actual) {
    super(createErrorMessage({ instance, method, expectedType, actual }))
  }

}

export default ArgumentError
