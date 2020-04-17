import FL from 'fantasy-land'
import {
  chain,
  extract,
  map,
  of,
} from '@theludd/fantasy-functions'

class Identity {
  constructor (v) {
    this.v = v
  }

  [FL.map] (f) {
    return of(f(this.v), Identity)
  }

  [FL.chain] (f) {
    return f(this.v)
  }

  [FL.extract] () {
    return this.v
  }
}

Identity[FL.of] = (v) => new Identity(v)

function ReaderT (M) {
  const type = M === Identity ? 'Reader' : `ReaderT(${M.name})`
  class R {
    constructor (f) {
      this.f = f
    }

    [FL.map] (f) {
      return chain((v) => of(R, f(v)), this)
    }

    [FL.chain] (f) {
      return new R((e) => chain((v) => f(v).run(e), this.run(e)))
    }

    [FL.ap] (r) {
      return chain((f) => map(f, this), r)
    }

    chainInner (f) {
      return chain((v) => R.lift(f(v)), this)
    }

    run (env) {
      return this.f(env)
    }

    toString () {
      return `${type}#${this.f.toString()}`
    }
  }

  class ResolvedR extends R {
    constructor (v) {
      super(() => of(M, v))
      this.v = v
    }

    [FL.map] (f) {
      return new ResolvedR(f(this.v))
    }

    toString () {
      return `${type}[${this.v}]`
    }
  }

  R[FL.of] = (v) => new ResolvedR(v)

  R.ask = new R(of(M))

  R.lift = (m) => new R(() => m)

  return R
}

const Reader = ReaderT(Identity)

const { ask } = Reader

function runReader (env, r) {
  return extract(r.run(env))
}

function chainInner (f, rt) {
  return rt.chainInner(f)
}

export {
  Reader,
  ReaderT,
  ask,
  chainInner,
  runReader,
}
