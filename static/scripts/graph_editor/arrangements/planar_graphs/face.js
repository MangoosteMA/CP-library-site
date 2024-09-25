export class Face {
    /*
    Variables:
    cycle:      list[int]
    */

    constructor(cycle) {
        this.cycle = cycle;
    }

    contains(verteces) {
        for (let i = 0; i < verteces.length; i++) {
            if (!this.cycle.includes(verteces[i])) {
                return false;
            }
        }
        return true;
    }

    rotateByOne() {
        this.cycle.unshift(this.cycle.pop());
    }

    rotateTo(newFirstNode) {
        if (!this.cycle.includes(newFirstNode)) {
            throw Error("[FaceTreeNode] Incorrect rotation");
        }
        while (this.cycle[0] != newFirstNode) {
            this.rotateByOne();
        }
    }
};
