loadGraph();

async function loadGraph() {
  try {
    const res = await fetch('/titles');
    const pages = (await res.json()).filter(p => p.title !== "Home");

    // Register dagre
    cytoscape.use(cytoscapeDagre);

    // -------------- Build parent -> children map ------------------------------
    const childrenMap = {};
    for (let p of pages){
      const parent = p.parent || "root";

      // See if we can add a middle-man parent page if it tickles my fancy
      let aHeader = ""
      let header = ""
      let hasHeader = false
        // Get parent page
      if (p.parent != "root"){
        const pp = await fetch(`/contents/${p.parent}`)
        const parentPage = await pp.json()
          // Iterate over all sections of the parent page
        for (let section of parentPage.sections){
            // Iterate over all key value pairs
          for (const [key, value] of Object.entries(section)){
              // Grab the most recent header
            if (['1', '2', '3'].includes(key.charAt(0)) && key.charAt(1)=='h') aHeader = value
              // Test if the header includes a link to the child page
            if (key.charAt(0)=='p'
                && value == p.title
                && aHeader != p.title
                && aHeader.split(" ")[0].toLowerCase()!="list"
                && p.parent != "Plot"
                && p.parent != "Ideas"
                && p.parent != "Mana"){
              hasHeader = true
              header = aHeader
              if (value == p.title) console.log(`aHeader: ${aHeader}\np.title: ${p.title}`)
            }
          }
        }
      }

      // Add parents to map if needed
      if (!childrenMap[parent]) {
        childrenMap[parent] = [];
      } if (!childrenMap[header]){
        childrenMap[header] = []
      }

      // New objects, just in case
      let newChild = {
        title: header,
        parent: p.parent,
        target: p.parent
      }
        let oldChild = {
        title: p.title,
        parent: header,
        target: p.title
      }

      // Add nodes to map
      if (hasHeader){
        childrenMap[parent].push(newChild)
        childrenMap[header].push(oldChild)
      } else {
        childrenMap[parent].push(p);
      }

    }
    // --------------------------------------------------------------------------

    // Sort children alphabetically by title
    Object.keys(childrenMap).forEach(parent => {
      childrenMap[parent].sort((a, b) => a.title.localeCompare(b.title));
    });

    // Track expanded nodes
    const expanded = new Set();

    // Initial elements (only root)
    function getInitialElements() {
      return [
        { data: { id: "root", label: "Home" } }
      ];
    }

    const cy = cytoscape({
      container: document.getElementById('cy'),

      elements: getInitialElements(),

      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'background-color': '#000',
            'color': '#fff',
            'text-valign': 'center',
            'text-outline-width': 2,
            'text-outline-color': '#333',
            'width': 'label',
            'height': 'label',
            'padding': '10px',
            'font-size': 16
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#ccc',
            'curve-style': 'bezier'
          }
        }
      ],

      layout: {
        name: 'dagre',
        rankDir: 'TB',
        nodeSep: 50,
        rankSep: 100,
        padding: 20
      }
    });

    // Expand / Collapse behavior
    cy.on('tap', 'node', function(evt) {
    const node = evt.target; // capture the clicked node
    setTimeout(() => {
      const id = node.id();

      // Collapse if already expanded
      if (expanded.has(id)) {
        const descendants = node.successors();
        cy.remove(descendants);
        expanded.delete(id);
      } else {
        const children = childrenMap[id];
        if (!children) return;

        children.forEach(child => {
          if (cy.getElementById(child.title).length === 0) {
            cy.add([
              { data: { id: child.title, label: child.title, target: child.target || child.title } },
              { data: { source: id, target: child.title } }
            ]);
          }
        });

        expanded.add(id);
      }

      // Run layout
      cy.layout({
        name: 'dagre',
        rankDir: 'TB',
        animate: true,
        animationDuration: 300
      }).run();

    }, 250); // delay for animation
  });

    // Navigation on double click
    cy.on('dbltap', 'node', function(evt) {
      const node = evt.target;
      const pageTitle = node.data('target') || node.id();

      if (pageTitle === 'root') {
        window.location.href = '/Home';
      } else {
        window.location.href = `/${encodeURIComponent(pageTitle)}`
      }
    });

  } catch (err) {
    console.error('Failed to load graph:', err);
  }
}