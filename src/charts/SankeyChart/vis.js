import * as d3 from 'd3';
//import {nest} from 'd3-collection';
import '../../assets/css/charts.css';
//import './sankey.js';
import $ from 'jquery';

function d3sankey() {
    var sankey = {},
        nodeWidth = 24,
        nodePadding = 8,
        size = [1, 1],
        nodes = [],
        links = [];
  
    sankey.nodeWidth = function(_) {
      if (!arguments.length) return nodeWidth;
      nodeWidth = +_;
      return sankey;
    };
  
    sankey.nodePadding = function(_) {
      if (!arguments.length) return nodePadding;
      nodePadding = +_;
      return sankey;
    };
  
    sankey.nodes = function(_) {
      if (!arguments.length) return nodes;
      nodes = _;
      return sankey;
    };
  
    sankey.links = function(_) {
      if (!arguments.length) return links;
      links = _;
      return sankey;
    };
  
    sankey.size = function(_) {
      if (!arguments.length) return size;
      size = _;
      return sankey;
    };
  
    sankey.layout = function(iterations) {
      computeNodeLinks();
      computeNodeValues();
      computeNodeBreadths();
      computeNodeDepths(iterations);
      computeLinkDepths();
      return sankey;
    };
  
    sankey.relayout = function() {
      computeLinkDepths();
      return sankey;
    };
  
    sankey.link = function() {
      var curvature = .5;
  
      function link(d) {
        var x0 = d.source.x + d.source.dx,
            x1 = d.target.x,
            xi = d3.interpolateNumber(x0, x1),
            x2 = xi(curvature),
            x3 = xi(1 - curvature),
            y0 = d.source.y + d.sy + d.dy / 2,
            y1 = d.target.y + d.ty + d.dy / 2;
        return "M" + x0 + "," + y0
             + "C" + x2 + "," + y0
             + " " + x3 + "," + y1
             + " " + x1 + "," + y1;
      }
  
      link.curvature = function(_) {
        if (!arguments.length) return curvature;
        curvature = +_;
        return link;
      };
  
      return link;
    };
  
    // Populate the sourceLinks and targetLinks for each node.
    // Also, if the source and target are not objects, assume they are indices.
    function computeNodeLinks() {
      nodes.forEach(function(node) {
        node.sourceLinks = [];
        node.targetLinks = [];
      });
      links.forEach(function(link) {
        var source = link.source,
            target = link.target;
        if (typeof source === "number") source = link.source = nodes[link.source];
        if (typeof target === "number") target = link.target = nodes[link.target];
        source.sourceLinks.push(link);
        target.targetLinks.push(link);
      });
    }
  
    // Compute the value (size) of each node by summing the associated links.
    function computeNodeValues() {
      nodes.forEach(function(node) {
        node.value = Math.max(
          d3.sum(node.sourceLinks, value),
          d3.sum(node.targetLinks, value)
        );
      });
    }
  
    // Iteratively assign the breadth (x-position) for each node.
    // Nodes are assigned the maximum breadth of incoming neighbors plus one;
    // nodes with no incoming links are assigned breadth zero, while
    // nodes with no outgoing links are assigned the maximum breadth.
    function computeNodeBreadths() {
      var remainingNodes = nodes,
          nextNodes,
          x = 0;
  
      while (remainingNodes.length) {
        nextNodes = [];
        remainingNodes.forEach(function(node) {
          node.x = x;
          node.dx = nodeWidth;
          node.sourceLinks.forEach(function(link) {
            if (nextNodes.indexOf(link.target) < 0) {
              nextNodes.push(link.target);
            }
          });
        });
        remainingNodes = nextNodes;
        ++x;
      }
  
      //
      moveSinksRight(x);
      scaleNodeBreadths((size[0] - nodeWidth) / (x - 1));
    }
  
    function moveSourcesRight() {
      nodes.forEach(function(node) {
        if (!node.targetLinks.length) {
          node.x = d3.min(node.sourceLinks, function(d) { return d.target.x; }) - 1;
        }
      });
    }
  
    function moveSinksRight(x) {
      nodes.forEach(function(node) {
        if (!node.sourceLinks.length) {
          node.x = x - 1;
        }
      });
    }
  
    function scaleNodeBreadths(kx) {
      nodes.forEach(function(node) {
        node.x *= kx;
      });
    }
  
    function computeNodeDepths(iterations) {
      var nodesByBreadth = d3.nest()
          .key(function(d) { return d.x; })
          .sortKeys(d3.ascending)
          .entries(nodes)
          .map(function(d) { return d.values; });
  
      //
      initializeNodeDepth();
      resolveCollisions();
      for (var alpha = 1; iterations > 0; --iterations) {
        relaxRightToLeft(alpha *= .99);
        resolveCollisions();
        relaxLeftToRight(alpha);
        resolveCollisions();
      }
  
      function initializeNodeDepth() {
        var ky = d3.min(nodesByBreadth, function(nodes) {
          return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
        });
  
        nodesByBreadth.forEach(function(nodes) {
          nodes.forEach(function(node, i) {
            node.y = i;
            node.dy = node.value * ky;
          });
        });
  
        links.forEach(function(link) {
          link.dy = link.value * ky;
        });
      }
  
      function relaxLeftToRight(alpha) {
        nodesByBreadth.forEach(function(nodes, breadth) {
          nodes.forEach(function(node) {
            if (node.targetLinks.length) {
              var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value);
              node.y += (y - center(node)) * alpha;
            }
          });
        });
  
        function weightedSource(link) {
          return center(link.source) * link.value;
        }
      }
  
      function relaxRightToLeft(alpha) {
        nodesByBreadth.slice().reverse().forEach(function(nodes) {
          nodes.forEach(function(node) {
            if (node.sourceLinks.length) {
              var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
              node.y += (y - center(node)) * alpha;
            }
          });
        });
  
        function weightedTarget(link) {
          return center(link.target) * link.value;
        }
      }
  
      function resolveCollisions() {
        nodesByBreadth.forEach(function(nodes) {
          var node,
              dy,
              y0 = 0,
              n = nodes.length,
              i;
  
          // Push any overlapping nodes down.
          nodes.sort(ascendingDepth);
          for (i = 0; i < n; ++i) {
            node = nodes[i];
            dy = y0 - node.y;
            if (dy > 0) node.y += dy;
            y0 = node.y + node.dy + nodePadding;
          }
  
          // If the bottommost node goes outside the bounds, push it back up.
          dy = y0 - nodePadding - size[1];
          if (dy > 0) {
            y0 = node.y -= dy;
  
            // Push any overlapping nodes back up.
            for (i = n - 2; i >= 0; --i) {
              node = nodes[i];
              dy = node.y + node.dy + nodePadding - y0;
              if (dy > 0) node.y -= dy;
              y0 = node.y;
            }
          }
        });
      }
  
      function ascendingDepth(a, b) {
        return a.y - b.y;
      }
    }
  
    function computeLinkDepths() {
      nodes.forEach(function(node) {
        node.sourceLinks.sort(ascendingTargetDepth);
        node.targetLinks.sort(ascendingSourceDepth);
      });
      nodes.forEach(function(node) {
        var sy = 0, ty = 0;
        node.sourceLinks.forEach(function(link) {
          link.sy = sy;
          sy += link.dy;
        });
        node.targetLinks.forEach(function(link) {
          link.ty = ty;
          ty += link.dy;
        });
      });
  
      function ascendingSourceDepth(a, b) {
        return a.source.y - b.source.y;
      }
  
      function ascendingTargetDepth(a, b) {
        return a.target.y - b.target.y;
      }
    }
  
    function center(node) {
      return node.y + node.dy / 2;
    }
  
    function value(link) {
      return link.value;
    }
  
    return sankey;
};

const draw = (props, data, configs) => {

    console.log(" data:")
    console.log(data)

    d3.select('.vis-sankeychart > *').remove();
    const margin = {top: 20, right: 20, bottom: 30, left: 40};
    const width = props.width - margin.left - margin.right;
    const height = props.height - margin.top - margin.bottom;
		
    var fmt = d3.format("0,.0f")

    var colors = 
    d3.scaleOrdinal()
        .domain([	
            "BN", 
            "CB", 
            "FM", 
            "HS", 
            "LSP", 				  
            "Bank Notes", 
            "Deposits",
            "Loans and Bonds", 
            "Reserves", 
            "Central Bank Digital Currency"
        ])
        .range([
            "#ff8c00", 
            "#40e0d0", 
            "#008000", 
            "#a52a2a", 
            "#4fc2be",
            "#9c9b9b",   
            "#9c9b9b",  
            "#9c9b9b",  
            "#9c9b9b",
            "#9c9b9b"
        ]);
			
		
    var fof_labels={	  
        "Banks" : "Banks",
        "Central Bank": "Central Bank",
        "Firms": "Firms",
        "Households": "Households",
        "License Service Providers": "License Service Providers",
        "Bank Notes": "Bank Notes", 
        "Deposits": "Deposits", 
        "Loans and Bonds": "Loans and Bonds", 
        "Reserves": "Reserves",  
        "Central Bank Digital Currency": "Central Bank Digital Currency"
    }
			
    //create svg  
    var svg = d3.select("#sankeychart").append("svg")
        .attr("width",  width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", 	"translate(" + margin.left + "," + margin.top + ")");

	/**** Get nodes and links ****/

    /*  
        We are creating a chart like this:
        Total Liabilities  -> Instrument -> Asset
    */

    // We need to add up all the liabilities of each account type per instrument
    // An account type might have 2 deposits liabilites.
    // For example, Banks might have one for households and one for banks.
    // Here we want to add these 2 into 1 deposits liability
    
    var liability_sub_totals = d3.nest()
        .key(function(d) { return d.account_type; })
        .key(function(d) { return d.asset; })
        .key(function(d) { return d.instrument_type; })
        .rollup(function(values) 
        { 
            return d3.sum(values, function (d) {return d.value})
        })
        .entries(data);

    console.log("sub totals:")
    console.log(liability_sub_totals)

    var links = [];
    var nodes = [];

    liability_sub_totals.forEach(function (acc_type) {
        acc_type.values.forEach(function (is_asset) {
            if (is_asset.key === "false") {
                is_asset.values.forEach(function (ins_type) {
                    nodes.push({ "name": acc_type.key + " liability"});
                   
                    var link_data = { 
                        "source": acc_type.key + " liability", 
                        "target": ins_type.key,
                        "value": ins_type.value,
                        "liability": acc_type.key + " liability", 
                        "instrument": ins_type.key, 
                        "color": acc_type.key,
                        "first": acc_type.key,
                        "second": ins_type.key,
                        "liaIns": "L" + acc_type.key + " liability" + ins_type.key,
                        "liaIns2": acc_type.key + "_" + ins_type.key
                    }

                    links.push(link_data);
                })
            }
        })
        
    }); 

    //get all source and target into nodes
    //will reduce to unique in the next step
    //also get links in object form
    data.forEach(function (d) {
        if (d.asset === false){
            nodes.push({ "name": d.instrument_type });
            nodes.push({ "name": d.counter_party + " asset"});
            links.push({ 
                "source": d.instrument_type, 
                "target": d.counter_party + " asset", 
                "value": d.value,
                "liability": d.account_type + " liability", 
                "instrument": d.instrument_type, 
                "color": d.instrument_type, 
                "first": d.instrument_type, 
                "second": d.instrument_type, 
                "third": d.counter_party,
                "liaIns": "L" + d.account_type + " liability" + d.instrument_type,
                "liaIns2": d.instrument_type + "_" + d.instrument_type + "_" + d.counter_party
            });
        }
    }); 

    // Reduce to unique set of nodes
    nodes = d3.nest()
        .key(function (d) { return d.name; })
        .map(nodes).keys()

    // Substitute source and target with node id
    links.forEach(function (d) {
        d.source = nodes.indexOf(d.source);
        d.target = nodes.indexOf(d.target);
        d.liability = nodes.indexOf(d.liability);
        d.instrument = nodes.indexOf(d.instrument);
    });
        
    console.log("nodes:")
    console.log(nodes)

    console.log("links:")
    console.log(links)

    // Get back nodes as an array of objects
    nodes.forEach(function (d, i) {
        nodes[i] = { "name": d };
    });

    var linksX = [];

    links.forEach(function (d) {
        linksX.push({
            "source": d.source,
            "target": d.target,
            "value": d.value,
            "color": d.color,
            "liaIns": "L" + d.liability + d.instrument,
            "liaIns2": d.first + "_" + d.second + "_" + d.third
            
        });
    });


    /************************/
    
    // Set the sankey diagram properties
    var sankey = d3sankey()
        .nodeWidth(20)
        .nodePadding(7)
        .size([width, height])
        .nodes(nodes)
        .links(linksX)
        .layout(32);
	
	var path = sankey.link();
			
    // add in the links
    var link = svg
        .append("g").selectAll(".link")
        .data(linksX)
        .enter()
        .append("path")
        .attr("class", function (d) {
            //console.log(d.source.name)
            return "link" + " " + d.liaIns+" "+d.color;
        })
        .attr("d", path)
        .style("stroke-width", function(d) {
            if (d.dy > 0.0006){
                return Math.max(1, d.dy); 
            } else {
                    return 0;
            }
        })
        .style("stroke", function (d) {
            
            return colors(d.color);
        })
        .sort(function(a, b) { return b.dy - a.dy; })
        .on('mouseover',function(d) {
            if(d.value != 0.0006){
                var source= d.source.name.replace(/ liability| asset|/gi, "");
                var target= d.target.name.replace(/ liability| asset|/gi, "");
            
                d3.select("#info").html(fof_labels[source] + " &#8594; "+fof_labels[target] + ": <span class='bold'> £" +fmt(d.value)+" billion </span>")
                
                d3.select(this).style("stroke-opacity", 0.5)
                
                d3.selectAll("." + d.liaIns)	.style("stroke-opacity", 0.5)
            }
        })
        .on('mouseout',function() {
            $("#info").empty();
            d3.selectAll("path").style("stroke-opacity", 0.07)
        })
		
		
    // add in the nodes
    var node = svg.append("g").selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { 
            return "translate(" + d.x + "," + d.y + ")"; 
        })
				
					
    // add the rectangles for the nodes
    node.append("rect")
        .attr("height", function(d) { return d.dy; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function (d) {
            var name = d.name.replace(/ liability| asset|/gi, "");
            return d.color = colors(name);
        })
        .on('mouseover',function(d) {
            var text = ""

            node= d.name.replace(/ liability| asset|/gi, "");
            
            if(d.name.substr(d.name.lastIndexOf(" ass")+1)=="asset") {
                text = "asset"
            } else if(d.name.substr(d.name.lastIndexOf(" lia")+1) == "liability"){
                text = "liability"
            } else {
                text = "";
            }
            
            d3.select("#info").html(fof_labels[node] +" "+ text+ ": <span class='bold'> £" +fmt(d.value)+" billion </span>");
            d3.select(this).classed("highlight", true);	
            var name = d.name.replace(/ liability| asset|/gi, "");
            d3.selectAll("."+name).style("stroke-opacity", 0.5)				
        })
        .on('mouseout',function(d) {
            $("#info").empty();
            d3.select(this).classed("highlight", false)
            d3.selectAll("path").style("stroke-opacity", 0.07)		
        })
		
    // add in the title for the nodes
    node.append("text")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { 
                var name = d.name.replace("_", "&");
                var asset = name.replace(" asset", "");
                var liability =asset.replace(" liability", "");
                return liability; 
        })
        .filter(function(d) { return d.x <  width / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");
		
}

export default draw;