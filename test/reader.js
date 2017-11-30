import { assert } from 'chai'
import { Reader, runReader, ask } from '../lib/reader'
import ArgumentError from '../lib/argument-error'

const { equal, throws } = assert

describe('reader', () => {
  function inc (x) {
    return x + 1
  }
  function addEnv (n) {
    return ask.map((env) => n + env)
  }
  const r1 = Reader.of(1)
  const incReader = Reader.of(inc)
  const chainInc = (x) => Reader.of(x + 1)

  it('should work', () => {
    equal(runReader(null, r1), 1)
  })

  describe('#map', () => {
    it('should work', () => {
      const r2 = r1.map(inc)
      const result = runReader(null, r2)
      equal(result, 2)
    })

    it('should throw if map does not receive a function', () => {
      function errorFn () {
        runReader(null, r1.map(1))
      }
      return throws(errorFn, ArgumentError)
    })
  })

  describe('#chain', () => {
    it('should work', () => {
      const r2 = r1.chain(chainInc)
      const result = runReader(null, r2)
      equal(result, 2)
    })

    it('should warn if the chain fn does not return a reader', () => {
      function errorFn () {
        runReader(null, r1.chain(inc))
      }
      return throws(errorFn, ArgumentError)
    })

    it('should warn if chain does not receive a function', () => {
      function errorFn () {
        runReader(null, r1.chain(2))
      }
      return throws(errorFn, ArgumentError)
    })
  })

  describe('#ap', () => {
    it('should work', () => {
      const r2 = r1.ap(incReader)
      const result = runReader(null, r2)
      equal(result, 2)
    })

    it('should warn if ap does not receive a Reader', () => {
      function errorFn () {
        runReader(null, r1.ap(inc))
      }
      return throws(errorFn, ArgumentError)
    })

    it('should warn if ap receives a Reader not containing a function', () => {
      function errorFn () {
        runReader(null, r1.ap(r1))
      }
      return throws(errorFn, ArgumentError, 'Reader#ap expected to receive Reader of function but got: Reader of 1')
    })
  })

  describe('ask', () => {
    it('should work', () => {
      const result = runReader(2, r1.chain((n) => {
        return ask.map((env) => n + env)
      }))
      equal(result, 3)
    })
  })

  describe('#toString', () => {
    it('should work', () => {
      equal(r1.toString(), 'Reader[1]')
    })

    it('should work for mapped readers', () => {
      equal(r1.map(inc).toString(), 'Reader[2]')
    })
  })

  it('should handle several transformations', () => {
    const result = runReader(2, r1.map(inc)
      .ap(incReader)
      .chain(chainInc)
      .map(inc)
      .chain(chainInc)
      .chain(addEnv)
      .map(inc)
      .ap(incReader))
    equal(result, 10)
  })
})
