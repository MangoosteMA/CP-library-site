import { Edge }           from "./edge.js";
import { FacesContainer } from "./faces_container.js";
import { Segment }        from "./segment.js";
import { Point }          from "../../geometry.js";

export class PlanarGraphLaying {
    /*
    Variables:
    facesContainers: list[FacesContainer]
    bridges:         list[Edge]
    n:               int
    isPlanar:        bool
    */

    constructor(graph) {
        try {
            this.n = graph.length;
            this.deleteBridges(graph);
            this.buildLaying(graph);
            this.uniteBridges();
            this.isPlanar = true;
        } catch (error) {
            this.isPlanar = false;
        }
    }

    getPossibleComponentsLaying(perfectEdgeLength) {
        const arrangement = new Array(this.n).fill(new Point(0, 0));
        this.facesContainers.forEach(facesContainer => {
            var maxX = 0;
            arrangement.forEach(point => {
                maxX = Math.max(maxX, point.x);
            });
            facesContainer.storeArrangement(arrangement, maxX + perfectEdgeLength, perfectEdgeLength);
        });
        return arrangement;
    }

// Private:
    deleteBridges(graph) {
        this.bridges = [];
        const tin = new Array(this.n).fill(-1);
        const tup = new Array(this.n).fill(-1);

        for (let v = 0; v < this.n; v++) {
            graph[v] = [...new Set(graph[v])];
            if (tin[v] != -1) {
                continue;
            }
            this.findBridges(v, -1, graph, tin, tup, 0);
        }

        this.bridges.forEach(edge => {
            graph[edge.v] = graph[edge.v].filter(value => {
                return value != edge.u;
            });
            graph[edge.u] = graph[edge.u].filter(value => {
                return value != edge.v;
            });
        });
    }

    findBridges(v, parent, graph, tin, tup, index) {
        tin[v] = tup[v] = index;
        index++;

        graph[v].forEach(u => {
            if (u == parent) {
                return;
            }
            if (tin[u] == -1) {
                index = this.findBridges(u, v, graph, tin, tup, index);
                tup[v] = Math.min(tup[v], tup[u]);
                if (tup[u] > tin[v]) {
                    this.bridges.push(new Edge(v, u));
                }
            } else {
                tup[v] = Math.min(tup[v], tin[u]);
            }
        });
        return index;
    }

    buildLaying(graph) {
        this.facesContainers = [];
        const visited = new Array(this.n).fill(false);
        for (let v = 0; v < this.n; v++) {
            if (visited[v]) {
                continue;
            }
            const component = [];
            this.findComponent(v, graph, visited, component);
            this.facesContainers.push(this.buildComponentLaying(graph, component));
        }
    }

    findComponent(v, graph, visited, component) {
        visited[v] = true;
        component.push(v);
        graph[v].forEach(u => {
            if (!visited[u]) {
                this.findComponent(u, graph, visited, component);
            }
        });
    }

    buildComponentLaying(graph, component) {
        if (component.length == 1) {
            return new FacesContainer(component);
        }
        const cycle = this.findCycle(component[0], graph, new Array(this.n).fill(false), new Array(this.n).fill(-1));
        const facesContainer = new FacesContainer(cycle);

        const layedVerteces = new Array(this.n).fill(false);
        const layedEdges = new Set();
        for (let i = 0; i < cycle.length; i++) {
            layedVerteces[cycle[i]] = true;
            layedEdges.add(new Edge(cycle[i], cycle[(i + 1) % cycle.length]).encode());
        }

        while (true) {
            const segments = this.findSegments(graph, component, layedVerteces, layedEdges);
            if (segments.length == 0) {
                break;
            }
            this.fillRanks(segments, facesContainer);

            var minRankedSegment = segments[0];
            segments.forEach(segment => {
                if (segment.rank < minRankedSegment.rank) {
                    minRankedSegment = segment;
                }
            });

            if (minRankedSegment.rank == 0) {
                console.log("[Gamma algorithm] graph is not planar");
                throw new Error("Graph is not planar");
            }

            const path = minRankedSegment.path;
            for (let i = 0; i < path.length; i++) {
                layedVerteces[path[i]] = true;
                if (i + 1 < path.length) {
                    layedEdges.add(new Edge(path[i], path[i + 1]).encode());
                }
            }
            facesContainer.layPath(minRankedSegment.faceId, path);
        }
        return facesContainer;
    }

    findCycle(v, graph, visited, parent) {
        visited[v] = true;
        for (let i = 0; i < graph[v].length; i++) {
            const u = graph[v][i];
            if (u == parent[v]) {
                continue;
            }

            if (!visited[u]) {
                parent[u] = v;
                const cycle = this.findCycle(u, graph, visited, parent);
                if (cycle.length > 0) {
                    return cycle;
                }
                continue;
            }

            const cycle = [];
            while (v != parent[u]) {
                cycle.push(v);
                v = parent[v];
            }
            return cycle;
        }
        return [];
    }

    findSegments(graph, component, layedVerteces, layedEdges) {
        const segments = [];
        const visited = [...layedVerteces];

        component.forEach(v => {
            if (!layedVerteces[v]) {
                return;
            }
            graph[v].forEach(u => {
                if (layedEdges.has(new Edge(v, u).encode())) {
                    return;
                }
                if (layedVerteces[u]) {
                    segments.push(new Segment([v, u], [v, u]));
                    return;
                }                
                if (visited[u]) {
                    return;
                }

                const component = [];
                this.findComponent(u, graph, visited, component);

                const contact = new Set();
                const contactEdges = [];
                component.forEach(v => {
                    graph[v].forEach(u => {
                        if (layedVerteces[u]) {
                            contactEdges.push(new Edge(v, u));
                            contact.add(u);
                        }
                    });
                });

                var anotherEdge = 1;
                while (anotherEdge + 1 < contactEdges.length && contactEdges[anotherEdge].u == contactEdges[0].u) {
                    anotherEdge++;
                }
                const path = this.findContactPath(graph, contactEdges[0], contactEdges[anotherEdge], layedVerteces);
                segments.push(new Segment([...contact], path));
            });
        });

        return segments;
    }

    findContactPath(graph, firstEdge, lastEdge, layedVerteces) {
        const parent = new Array(this.n).fill(-1);
        const queue = [firstEdge.v];
        parent[firstEdge.v] = firstEdge.u;

        for (let ptr = 0; ptr < queue.length; ptr++) {
            const v = queue[ptr];
            graph[v].forEach(u => {
                if (!layedVerteces[u] && parent[u] == -1) {
                    parent[u] = v;
                    queue.push(u);
                }
            });
        }

        const path = [lastEdge.u];
        var v = lastEdge.v;
        while (v != -1) {
            path.push(v);
            v = parent[v];
        }
        path.reverse();
        return path;
    }

    fillRanks(segments, facesContainer) {
        segments.forEach(segment => {
            facesContainer.faces.forEach((face, id) => {
                if (face.contains(segment.contact)) {
                    segment.rank++;
                    segment.faceId = id;
                }
            });
        });
    }

    uniteBridges() {
        const united = new Array(this.bridges.length).fill(false);
        for (let it = 0; it < this.bridges.length; it++) {
            this.bridges.forEach((bridge, index) => {
                if (united[index]) {
                    return;
                }

                const i = this.findFacesContainer(bridge.v);
                const j = this.findFacesContainer(bridge.u);
                if (this.facesContainers[i].numberOfVerteces() > 1) {
                    this.facesContainers[i].uniteWith(bridge.v, bridge.u, this.facesContainers[j]);
                    this.facesContainers.splice(j, 1);
                    united[index] = true;
                } else if (this.facesContainers[j].numberOfVerteces() > 1) {
                    this.facesContainers[j].uniteWith(bridge.u, bridge.v, this.facesContainers[i]);
                    this.facesContainers.splice(i, 1);
                    united[index] = true;
                }
            });
        }
    }

    findFacesContainer(vertex) {
        for (let i = 0; i < this.facesContainers.length; i++) {
            if (this.facesContainers[i].contains(vertex)) {
                return i;
            }
        }
        return -1;
    }
}
