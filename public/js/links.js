let nodes = [];
let links = [];

getPages();

async function getPages() {
  try {
    const res = await fetch('/pages');
    const pages = await res.json();

    for (let page of pages) {
      nodes.push(page.title);

      // Parent link
      if (page.parent !== "root") {
        links.push({
          startingNode: page.title,
          endingNode: page.parent
        });
      }

      // Section links
      for (let section of page.sections) {
        for (const [key, value] of Object.entries(section)) {
          if (key.charAt(0) === 'p') {
            links.push({
              startingNode: page.title,
              endingNode: value
            });
          }
        }
      }
    }

    nodes.sort();

    renderGraph();

  } catch (err) {
    console.error(err);
  }
}

function renderGraph() {
  const cy = cytoscape({
    container: document.getElementById('cy'),

    elements: [
      // Nodes
      ...nodes.map(n => ({
        data: { id: n, label: n }
      })),

      // Edges
      ...links.map((l, i) => ({
        data: {
          id: 'e' + i,
          source: l.startingNode,
          target: l.endingNode
        }
      }))
    ],

    style: [
      {
        selector: 'node',
        style: {
          'label': 'data(label)',
          'text-valign': 'center',
          'background-color': '#000',
          'text-outline-color': '#333',
          'text-outline-width': 2,
          'color': '#fff',
          'font-size': '10px'
        }
      },
      {
        selector: 'edge',
        style: {
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
          'width': 2,
          'line-color': '#aaa',
          'target-arrow-color': '#aaa'
        }
      }
    ],

    layout: {
      name: 'cose', // force-directed layout
      animate: true
    }
  });
}