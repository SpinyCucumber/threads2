import { Position, midpoint } from "./ortho";
import * as Immutable from "immutable"

export class Curve extends Immutable.Record({ a: new Position(), b: new Position(), c: new Position(), d: new Position() }) {

    divide(): [Curve, Curve] {
        const e = midpoint(this.a, this.b);
        const f = midpoint(this.c, this.d);
        const g = midpoint(this.b, this.c);
        const h = midpoint(e, g);
        const i = midpoint(f, g);
        const j = midpoint(h, i);
        return [new Curve({ a: this.a, b: e, c: h, d: j }), new Curve({ a: j, b: i, c: f, d: this.b })];
    }

    sample(numDivisions: number): Immutable.Seq.Indexed<[Position, Position]> {
        let curves = Immutable.Seq([<Curve> this]);
        for (let i = 0; i < numDivisions; i++) {
            curves = curves.flatMap(curve => curve.divide())
        }
        return curves.map(curve => ([curve.a, curve.d]));
    }

}