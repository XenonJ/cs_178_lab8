/**
 * Visualization module for rendering graph data with D3
 */
console.log("Visualization module loaded");

const Visualization = (function () {
  // Default options
  const defaultOptions = {
    showLabels: false,
    showRelationships: false,
    nodeSize: "small",
  };

  // Visualization state
  let svg = null;
  let graphData = null;
  let visualOptions = { ...defaultOptions };
  let simulation = null;
  let dimensions = { width: 0, height: 0 };

  // Initialize visualization
  function init(containerSelector) {
    console.log("Visualization init called with", containerSelector);
    const container = document.querySelector(containerSelector);
    if (!container) {
      console.error("Container not found:", containerSelector);
      return;
    }

    // Create SVG element if it doesn't exist
    if (!svg) {
      svg = d3
        .select(container)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%");

      // Add zoom behavior
      svg.call(
        d3
          .zoom()
          .scaleExtent([0.1, 10])
          .on("zoom", (event) => {
            const { transform } = event;
            svg.select("g").attr("transform", transform);
          })
      );
    }

    // Handle window resize
    window.addEventListener("resize", updateDimensions);
    updateDimensions();

    return svg;
  }

  // Update container dimensions
  function updateDimensions() {
    const container = document.querySelector("#visualization");
    if (container) {
      const rect = container.getBoundingClientRect();
      dimensions = { width: rect.width, height: rect.height };

      if (graphData) {
        render(graphData, visualOptions);
      }
    }
  }

  // Render graph visualization
  function render(data, options = {}) {
    console.log("Visualization render called");

    if (!svg || !data || !data.nodes || !data.links) {
      console.error("Cannot render: missing svg or data");
      return;
    }

    // Store original data
    graphData = data;
    visualOptions = { ...defaultOptions, ...options };

    // Clear previous visualization
    svg.selectAll("*").remove();

    // Stop any existing simulation
    if (simulation) {
      simulation.stop();
    }

    try {
      // Create SVG groups
      const g = svg.append("g");

      // Create force simulation
      simulation = d3
        .forceSimulation(data.nodes)
        .force(
          "link",
          d3
            .forceLink(data.links)
            .id((d) => d.id)
            .distance(100)
        )
        .force("charge", d3.forceManyBody().strength(-300))
        .force(
          "center",
          d3.forceCenter(dimensions.width / 2, dimensions.height / 2)
        );

      var settings = ConfigPanel.getSettings()

      // Create a group for links
      const linkGroup = g.append("g").attr("class", "links");

      // Create groups for each link
      const link = linkGroup
        .selectAll(".links")
        .data(data.links)
        .enter()
        .append("g")
        .attr("class", "links");

      // Append a line for each link
      link.append("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 1);

      // Append a text element for the link label
      if (settings.visualOptions.showRelationships) {
        link.append("text")
          .text(d => d.type)
          .attr("class", "link-type")
          .attr("font-size", "10px")
          .attr("fill", "black");
      }

      var nodeSize = 0;
      switch (settings.visualOptions.nodeSize) {
        case "small":
          nodeSize = 5;
          break;
        case "medium":
          nodeSize = 10;
          break;
        case "large":
          nodeSize = 15;
          break;
        default:
          nodeSize = 5;
          break;
      }

      // Create a group for each node and apply dragging behavior
      const node = g
        .selectAll(".node")
        .data(data.nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .call(drag(simulation));

      // Append circle to each group
      node
        .append("circle")
        .attr("r", nodeSize)
        .attr("fill", d => {
          if (d.labels == "Movie") {
            return "blue";
          }
          else {
            return "green";
          }
        });

      // Append text to each group for labels
      if (settings.visualOptions.showLabels) {
        node
          .append("text")
          .text(d => {
            if (d.labels == "Movie") {
              return d.properties.title;
            }
            else {
              return d.id;
            }
          }) // Use the property from your data that contains the label
          .attr("class", "node-label")
          // Position the text relative to the circle; adjust the x/y offsets as needed
          .attr("x", nodeSize + 2)
          .attr("y", 3)
          .attr("font-size", "10px")
          .attr("fill", "black");
      }

      // Update positions on each simulation tick
      simulation.on("tick", () => {
        // Update node group position
        node.attr("transform", d => `translate(${d.x || 0}, ${d.y || 0})`);

        // Update link positions
        link.select("line")
          .attr("x1", d => d.source.x || 0)
          .attr("y1", d => d.source.y || 0)
          .attr("x2", d => d.target.x || 0)
          .attr("y2", d => d.target.y || 0);

        link.select("text")
          .attr("x", d => (d.source.x + d.target.x) / 2)
          .attr("y", d => (d.source.y + d.target.y) / 2);
      });

      console.log("Visualization rendered successfully");
    } catch (error) {
      console.error("Error rendering visualization:", error);
    }

    // --- Define the legend data ---
    const legendData = {
      nodes: [
        { label: "Movie", color: "blue" },
        { label: "Person", color: "green" }
      ],
      edges: [
        { label: "Rating", color: "#999" }
      ]
    };

    // --- Create a group for the legend ---
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(20, 20)");

    // --- Background box (white, transparent, 3D effect via gradient border) ---
    const background = legend.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("rx", 12)
      .attr("ry", 12)
      .attr("width", 240)
      .attr("height", 120) // temporary, we'll resize later
      .style("fill", "white")
      .style("fill-opacity", 0.85)
      .style("stroke", "url(#border-gradient)")
      .style("stroke-width", 1.5);

    // --- Create a 3D-style border gradient ---
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "border-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ccc");

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#999");

    // --- Add Node Types Title ---
    legend.append("text")
      .attr("x", 15)
      .attr("y", 25)
      .text("Node Types")
      .style("font-weight", "bold")
      .style("font-size", "13px");

    let yOffset = 45;

    // --- Draw nodes in legend ---
    legendData.nodes.forEach((item) => {
      const group = legend.append("g")
        .attr("transform", `translate(15, ${yOffset})`);

      group.append("circle")
        .attr("r", 6)
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("fill", item.color);

      group.append("text")
        .attr("x", 20)
        .attr("y", 4)
        .text(item.label)
        .style("font-size", "12px");

      yOffset += 20;
    });

    // --- Relationship Types Title ---
    yOffset += 10;
    legend.append("text")
      .attr("x", 15)
      .attr("y", yOffset)
      .text("Relationship Types")
      .style("font-weight", "bold")
      .style("font-size", "13px");

    yOffset += 20;

    // --- Draw edges in legend ---
    legendData.edges.forEach((item) => {
      const group = legend.append("g")
        .attr("transform", `translate(15, ${yOffset})`);

      group.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 20)
        .attr("y2", 0)
        .attr("stroke", item.color)
        .attr("stroke-width", 2);

      group.append("text")
        .attr("x", 30)
        .attr("y", 5)
        .text(item.label)
        .style("font-size", "12px");

      yOffset += 20;
    });

    // --- Resize background based on final content ---
    background.attr("height", yOffset + 10);



  }

  // Drag handler for nodes
  function drag(simulation) {
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  // Clear visualization
  function clear() {
    if (svg) {
      svg.selectAll("*").remove();
    }

    if (simulation) {
      simulation.stop();
    }
  }

  // Return public API
  return {
    init,
    render,
    clear,
    updateDimensions,
  };
})();
