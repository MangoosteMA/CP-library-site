import { DfsTreeArrangement }            from "./arrangements/dfs_tree_arrangement.js";
import { ImprovedRegularArrangement}     from "./arrangements/improved_regular_arrangement.js";
import { RegularArrangement }            from "./arrangements/regular_arrangement.js";
import { TopSortArrangementArrangement } from "./arrangements/top_sort_arrangement.js";

import { Point }                         from "./geometry.js";
import { clamp }                         from "./utils.js";

export class ArrangementsBuilder {
    /*
    Variables:
    mode:     ArrangementBuilderInterface or null
    builders: list[ArrangementBuilderInterface]
    */

    constructor() {
        this.mode = null;
        this.builders = [new DfsTreeArrangement()           ,
                         new TopSortArrangementArrangement(),
                         new ImprovedRegularArrangement()   ];
    }

    build(n, edges) {
        if (this.mode != null) {
            return this.mode.build(n, edges);
        }

        var arrangement = null;
        this.builders.every(builder => {
            if (builder.isPretty(n, edges)) {
                arrangement = builder.build(n, edges);
            }
            return arrangement == null;
        });
        return arrangement;
    }

    prettify(arrangement, box) {
        arrangement = this.smoothCoordinates(arrangement, box);
        return this.centerizeCoordinates(arrangement, box);
    }

// Private:
    findBoundingBox(arrangement) {
        var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
        arrangement.forEach(point => {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
        });
        return {minX: minX, maxX: maxX, minY: minY, maxY: maxY};
    }

    smoothCoordinates(arrangement, box) {
        var {minX, maxX, minY, maxY} = this.findBoundingBox(arrangement);
        maxX -= minX;
        maxY -= minY;
        for (let i = 0; i < arrangement.length; i++)  {
            arrangement[i].x -= minX;
            arrangement[i].y -= minY;
            if (maxX > box.maxX - box.minX) {
                arrangement[i].x *= (box.maxX - box.minX) / maxX;
            }
            if (maxY > box.maxY - box.minY) {
                arrangement[i].y *= (box.maxY - box.minY) / maxY;
            }
        }
        return arrangement;
    }

    centerizeCoordinates(arrangement, box) {
        var {minX, maxX, minY, maxY} = this.findBoundingBox(arrangement);
        const center = new Point((minX + maxX) / 2, (minY + maxY) / 2);
        const shift = new Point((box.maxX + box.minX) / 2, (box.maxY + box.minY) / 2).sub(center);
        for (let i = 0; i < arrangement.length; i++) {
            const point = arrangement[i].add(shift);
            point.x = clamp(point.x, box.minX, box.maxX);
            point.y = clamp(point.y, box.minY, box.maxY);
            arrangement[i] = point;
        }
        return arrangement;
    }
}
