export function getUniqueEdges(edges) {
    const uniquedEdges = [];
    const edgesSet = new Set();
    edges.forEach(edge => {
        const v = Math.min(edge.from, edge.to);
        const u = Math.max(edge.from, edge.to);
        const id = v + "---" + u;
        if (!edgesSet.has(id)) {
            edgesSet.add(id);
            uniquedEdges.push(edge);
        }
    });
    return uniquedEdges;
}

export function isDirected(edges) {
    var allDirected = true;
    edges.forEach(edge => {
        allDirected &= edge.directed;
    });
    return allDirected;
}

export function getComponents(n, edges) {
    var parent = new Array(n);
    for (let i = 0; i < n; i++) {
        parent[i] = i;
    }

    function root(v) {
        if (parent[v] == v) {
            return v;
        }
        parent[v] = root(parent[v]);
        return parent[v];
    }

    var components = n;
    edges.forEach(edge => {
        const a = root(edge.from);
        const b = root(edge.to);
        if (a != b) {
            parent[b] = a;
            components--;
        }
    });

    return components;
}

export function isTree(n, edges) {
    return edges.length == n - 1 && getComponents(n, edges) == 1;
}

export function isForest(n, edges) {
    return edges.length + getComponents(n, edges) == n;
}

export function buildGraph(n, edges, considerDirection=true) {
    var graph = new Array(n);
    for (let i = 0; i < n; i++) {
        graph[i] = [];
    }

    edges.forEach(edge => {
        graph[edge.from].push(edge.to);
        if (!considerDirection || !edge.directed) {
            graph[edge.to].push(edge.from);
        }
    });
    return graph;
}
