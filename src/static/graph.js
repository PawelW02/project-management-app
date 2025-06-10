// Wizualizacja grafu zależności zadań za pomocą vis-network
// Wymaga: <script src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script> w index.html

document.addEventListener('DOMContentLoaded', () => {
    async function fetchGraph() {
        const res = await fetch('/graph');
        if (!res.ok) return;
        const edges = await res.json();
        // Zbierz unikalne węzły
        const nodesMap = {};
        edges.forEach(edge => {
            nodesMap[edge.from] = edge.from_title;
            nodesMap[edge.to] = edge.to_title;
        });
        const nodes = Object.entries(nodesMap).map(([id, label]) => ({ id: Number(id), label }));
        const visEdges = edges.map(e => ({ from: e.from, to: e.to, arrows: 'to' }));
        renderGraph(nodes, visEdges);
    }

    function renderGraph(nodes, edges) {
        const container = document.getElementById('graph-container');
        const data = {
            nodes: new vis.DataSet(nodes),
            edges: new vis.DataSet(edges)
        };
        const options = {
            nodes: {
                shape: 'box',
                color: {
                    background: '#ffffff',
                    border: '#0d6efd',
                    highlight: {
                        background: '#e9f5ff',
                        border: '#0d6efd'
                    }
                },
                font: {
                    color: '#222',
                    size: 16,
                    face: 'Segoe UI'
                }
            },
            edges: {
                color: {
                    color: '#0d6efd',
                    highlight: '#0d6efd',
                    inherit: false
                },
                arrows: {
                    to: { enabled: true, scaleFactor: 1 }
                },
                smooth: {
                    type: 'cubicBezier',
                    forceDirection: 'horizontal',
                    roundness: 0.4
                }
            },
            layout: {
                hierarchical: false
            },
            physics: {
                enabled: true,
                barnesHut: {
                    gravitationalConstant: -20000,
                    springLength: 200
                }
            },
            interaction: {
                hover: true,
                tooltipDelay: 200
            }
        };
        new vis.Network(container, data, options);
    }

    fetchGraph();
    // Odśwież graf po każdej zmianie zadań (np. po dodaniu/usunięciu)
    document.addEventListener('tasksChanged', fetchGraph);
});
