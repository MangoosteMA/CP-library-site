export class Edge {
    /*
    Variables:
    v: int
    u: int
    */

    constructor(v, u) {
        this.v = v;
        this.u = u;
    }

    encode() {
        return (Math.min(this.v, this.u) << 25) ^ Math.max(this.v, this.u);
    }
}
