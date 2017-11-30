import ArgumentError from './argument-error'

class Identity {

  constructor (v) {
    this.v = v
  }

  map (f) {
    return Identity.of(f(this.v))
  }

  chain (f) {
    return f(this.v)
  }

  extract () {
    return this.v
  }

}

Identity.of = (v) => new Identity(v)

function ReaderT (M) {
  const type = M === Identity ? 'Reader' : `ReaderT(${M.name})`
  class R {

    constructor (f) {
      this.f = f
    }

    map (f) {
      if (typeof f !== 'function') {
        throw new ArgumentError(type, 'map', 'function', f)
      }
      return this.chain((v) => R.of(f(v)))
    }

    chain (f) {
      if (typeof f !== 'function') {
        throw new ArgumentError(type, 'chain', 'function', f)
      }
      return new R((e) => {
        return this.run(e).chain((v) => {
          const innerR = f(v)
          if (!(innerR instanceof R)) {
            throw new ArgumentError(type, 'chain', `function returning ${type}`, `function returning ${innerR}`)
          }
          return innerR.run(e)
        })
      })
    }

    ap (r) {
      if (!(r instanceof R)) {
        throw new ArgumentError(type, 'ap', type, r)
      }
      return r.chain((f) => {
        if (typeof f !== 'function') {
          throw new ArgumentError(type, 'ap', `${type} of function`, `${type} of ${f}`)
        }
        return this.map(f)
      })
    }

    run (env) {
      return this.f(env)
    }

    toString () {
      return type
    }
  }

  class ResolvedR extends R {

    constructor (v) {
      super(() => M.of(v))
      this.v = v
    }

    map (f) {
      if (typeof f !== 'function') {
        throw new ArgumentError(type, 'map', 'function', f)
      }
      return new ResolvedR(f(this.v))
    }

    toString () {
      return `${type}[${this.v}]`
    }
  }

  R.of = (v) => new ResolvedR(v)

  R.ask = new R(M.of)

  R.lift = (m) => new R(() => m)

  return R
}

const Reader = ReaderT(Identity)

const { ask } = Reader

function runReader (env, r) {
  return r.run(env).extract()
}

export { Reader, runReader, ask, ReaderT }
