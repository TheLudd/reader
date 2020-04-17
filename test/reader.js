import { assert } from 'chai'
import {
  map, chain, ap, of,
} from '@theludd/fantasy-functions'
import { pipe } from 'yafu'
import { Reader, runReader, ask } from '../lib/reader'

const { equal } = assert

describe('reader', () => {
  function inc (x) {
    return x + 1
  }
  function addEnv (n) {
    return map((env) => n + env, ask)
  }
  const r1 = of(Reader, 1)
  const incReader = of(Reader, inc)
  const chainInc = (x) => of(Reader, x + 1)

  it('should work', () => {
    equal(runReader(null, r1), 1)
  })

  describe('#map', () => {
    it('should work', () => {
      const r2 = map(inc, r1)
      const result = runReader(null, r2)
      equal(result, 2)
    })
  })

  describe('#chain', () => {
    it('should work', () => {
      const r2 = chain(chainInc, r1)
      const result = runReader(null, r2)
      equal(result, 2)
    })
  })

  describe('#ap', () => {
    it('should work', () => {
      const r2 = ap(incReader, r1)
      const result = runReader(null, r2)
      equal(result, 2)
    })
  })

  describe('ask', () => {
    it('should work', () => {
      const result = runReader(2, chain((n) => map((env) => n + env, ask), r1))
      equal(result, 3)
    })
  })

  describe('#toString', () => {
    it('should work', () => {
      equal(r1.toString(), 'Reader[1]')
    })

    it('should work for mapped readers', () => {
      equal(map(inc, r1).toString(), 'Reader[2]')
    })
  })

  it('should handle several transformations', () => {
    const pipeLine = pipe([
      map(inc),
      ap(incReader),
      chain(chainInc),
      map(inc),
      chain(chainInc),
      chain(addEnv),
      map(inc),
      ap(incReader),
    ])
    const result = runReader(2, pipeLine(r1))
    equal(result, 10)
  })
})
