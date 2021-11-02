import React, { Component } from "react";
import ChartistGraph from "react-chartist";
import * as d3 from "d3";
import {nest as d3_nest} from 'd3-collection';
import "../../assets/css/charts.css";
import $ from "jquery";
import axios from "axios";
// @material-ui/core
import { makeStyles } from "@material-ui/core/styles";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
// charts
import {dailySalesChart} from "variables/charts.js";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import CardFooter from "components/Card/CardFooter.js";
import Update from "@material-ui/icons/Update";
import DateRangePicker from "components/DateRange/DateRangePicker.js"
import {groupColors} from "assets/jss/material-dashboard-react.js";
import FundsTotals from "views/FundsTotals/FundsTotals.js";

const useStyles = makeStyles(styles);

export default function FundsFlow({ ...rest }) {
  const classes = useStyles();
  const chartWidth = 700;
  const chartHeight = 300;
  const margin = { top: 20, right: 10, bottom: 30, left: 10 };
  const width = chartWidth - margin.left - margin.right;
  const height = chartHeight - margin.top - margin.bottom;
  const node_labels = {
    "Bank": "Bank",
    "CentralBank": "CentralBank",
    "Firm": "Firm",
    "Household": "Household",
    "LSP": "LSP",
    "Bank Notes": "Bank Notes",
    "Deposits": "Deposits",
    "Loans and Bonds": "Loans and Bonds",
    "Reserves": "Reserves",
    "CBDC": "CBDC",
  };
  const [data, set_data] = React.useState([
    {
      sender_type: "Household",
      instrument_type: "Deposits",
      receiver_type: "Bank",
      payments: "true",
      value: 1000000,
    },
    {
      sender_type: "Firm",
      instrument_type: "Deposits",
      receiver_type: "Bank",
      payments: "true",
      value: 1500000,
    },
    {
      sender_type: "CentralBank",
      instrument_type: "Bank Notes",
      receiver_type: "Household",
      payments: "true",
      value: 1000000,
    },
    {
      sender_type: "Bank",
      instrument_type: "Loans and Bonds",
      receiver_type: "Firm",
      payments: "true",
      value: 1500000,
    },
    {
      sender_type: "Bank",
      instrument_type: "Reserves",
      receiver_type: "CentralBank",
      payments: "true",
      value: 500000,
    }
  ]);

  var selectedFromDate = new Date();
  var selectedToDate = new Date();
  var chart_data = []; 
  var svg;
  var nodes = [];
  var links = [];
  var linksX = [];
  var fmt = d3.format("0,.0f");

  // Start with transactions a year agao
  selectedFromDate.setFullYear(selectedFromDate.getFullYear() - 1);

  React.useEffect(() => {
    //draw(data);
    get_data();
  });

  function get_data() {
    var url = "http://localhost:8000/api/account_type_payments_receipts"

    var fromDate = formatDate(selectedFromDate);
    var toDate = formatDate(selectedToDate);
    
    var parameters = {"from":fromDate,"to":toDate};

    axios.post(
      url,
      parameters
    ).then((response) => {
      console.log("ff **");
      console.log(response.data)
      draw(response.data);
    })
    .catch(error => console.error('Error: $(error)'));
  }

  function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
  }
  
  function draw(data) {
    chart_data = _.cloneDeep(data);

    initialize_chart();
    prepare_data();
    initialize_sankey();
  }

  function initialize_chart() {
    d3.select(".vis-sankeychart > *").remove();
    
    //create svg
    svg = d3
      .select("#sankeychart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  }

  function prepare_data() {
    nodes = [];
    links = [];
    linksX = [];
    
    //We are creating a chart like this:
    //Total Payments  -> Instrument -> Receipts

    // We need to add up all the payments of each account type.
    // An account type might have 2 deposits payments.
    // For example, households may deposit into banks and firms.
    // Here we want to add these 2 into 1 deposits payment
  
    var payments_sub_totals = d3_nest()
      .key(function (d) {
        return d.sender_type;
      })
      .key(function (d) {
        return d.payments;
      })
      .key(function (d) {
        return d.instrument_type;
      })
      .rollup(function (values) {
        return d3.sum(values, function (d) {
          return parseFloat(d.value);
        });
      })
      .entries(chart_data);
  
    console.log("sub totals:");
    console.log(payments_sub_totals);
  
    payments_sub_totals.forEach(function (acc_type) {
      acc_type.values.forEach(function (is_payments) {
        if (is_payments.key === "true") {
          is_payments.values.forEach(function (ins_type) {
            
            nodes.push({ name: acc_type.key + " payments" });
  
            var link_data = {
              source: acc_type.key + " payments",
              target: ins_type.key,
              value: parseFloat(ins_type.value),
              payments: acc_type.key + " payments",
              instrument: ins_type.key,
              color: acc_type.key,
              first: acc_type.key,
              second: ins_type.key,
              liaIns: "L" + acc_type.key + " payments" + ins_type.key,
              liaIns2: acc_type.key + "_" + ins_type.key,
            };
  
            links.push(link_data);
          });
        }
      });
    });
  
    //get all source and target into nodes
    //will reduce to unique in the next step
    //also get links in object form
    chart_data.forEach(function (d) {
      if (d.payments === "true") {
        nodes.push({ name: d.instrument_type });
        nodes.push({ name: d.receiver_type + " receipts" });
        links.push({
          source: d.instrument_type,
          target: d.receiver_type + " receipts",
          value: parseFloat(d.value),
          payments: d.sender_type + " payments",
          instrument: d.instrument_type,
          color: d.sender_type,
          first: d.instrument_type,
          second: d.instrument_type,
          third: d.receiver_type,
          liaIns: "L" + d.sender_type + " payments" + d.instrument_type,
          liaIns2:
            d.instrument_type + "_" + d.instrument_type + "_" + d.receiver_type,
        });
      }
    });
  
    // Reduce to unique set of nodes
    nodes = d3_nest()
      .key(function (d) {
        return d.name;
      })
      .map(nodes)
      .keys();
  
    // Substitute source and target with node id
    links.forEach(function (d) {
      d.source = nodes.indexOf(d.source);
      d.target = nodes.indexOf(d.target);
      d.payments = nodes.indexOf(d.payments);
      d.instrument = nodes.indexOf(d.instrument);
    });
  
    console.log("nodes:");
    console.log(nodes);
  
    console.log("links:");
    console.log(links);
  
    // Get back nodes as an array of objects
    nodes.forEach(function (d, i) {
      nodes[i] = { name: d };
    });
  
    links.forEach(function (d) {
      linksX.push({
        source: d.source,
        target: d.target,
        value: parseFloat(d.value),
        color: d.color,
        liaIns: "L" + d.payments + d.instrument,
        liaIns2: d.first + "_" + d.second + "_" + d.third,
      });
    });
  }

  function initialize_sankey() {
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
      .append("g")
      .selectAll(".link")
      .data(linksX)
      .enter()
      .append("path")
      .attr("class", function (d) {
        return "link" + " " + d.liaIns + " " + d.color;
      })
      .attr("d", path)
      .style("stroke-width", function (d) {
        if (d.dy > 0.0006) {
          return Math.max(1, d.dy);
        } else {
          return 0;
        }
      })
      .style("stroke", function (d) {
        var name = d.color.toLowerCase();
        return groupColors[name];
      })
      .sort(function (a, b) {
        return b.dy - a.dy;
      })
      .on("mouseover", function (event, d) {
        if (d.value != 0.0006) {
          var source = d.source.name.replace(/ payments| receipts|/gi, "");
          var target = d.target.name.replace(/ payments| receipts|/gi, "");
  
          d3.select("#info").html(
            node_labels[source] +
              " &#8594; " +
              node_labels[target] +
              ": <span class='bold'> R" +
              fmt(d.value) +
              " billion </span>"
          );
  
          d3.select(this).style("stroke-opacity", 0.5);
  
          d3.selectAll("." + d.liaIns).style("stroke-opacity", 0.5);
        }
      })
      .on("mouseout", function (event, d) {
        $("#info").empty();
        d3.selectAll("path").style("stroke-opacity", 0.07);
      });
  
    // add in the nodes
    var node = svg
      .append("g")
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
  
    // add the rectangles for the nodes
    node
      .append("rect")
      .attr("height", function (d) {
        return d.dy;
      })
      .attr("width", sankey.nodeWidth())
      .style("fill", function (d) {
        var name = d.name.replace(/ payments| receipts|/gi, "").toLowerCase();

        // var source = d.source.name.replace(/ payments| receipts|/gi, "").toLowerCase();
        // var target = d.target.name.replace(/ payments| receipts|/gi, "").toLowerCase();
        // var name = source;
        // if (groupColors[source] === undefined){
        //   name = target;
        // }
        // return (d.color = groupColors[d.name]);
        return (d.color = groupColors[name]);
      })
      .on("mouseover", function (event, d) {
        var text = "";
  
        node = d.name.replace(/ payments| receipts|/gi, "");
  
        if (d.name.substr(d.name.lastIndexOf(" rec") + 1) == "receipts") {
          text = "receipts";
        } else if (d.name.substr(d.name.lastIndexOf(" lia") + 1) == "payments") {
          text = "payments";
        } else {
          text = "";
        }
  
        d3.select("#info").html(
          node_labels[node] +
            " " +
            text +
            ": <span class='bold'> £" +
            fmt(d.value) +
            " billion </span>"
        );
        d3.select(this).classed("highlight", true);
        var name = d.name.replace(/ payments| receipts|/gi, "");
        d3.selectAll("." + name).style("stroke-opacity", 0.5);
      })
      .on("mouseout", function (event, d) {
        $("#info").empty();
        d3.select(this).classed("highlight", false);
        d3.selectAll("path").style("stroke-opacity", 0.07);
      });
  
    // add in the title for the nodes
    node
      .append("text")
      .attr("x", -6)
      .attr("y", function (d) {
        return d.dy / 2;
      })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function (d) {
        var name = d.name.replace("_", "&");
        var receipts = name.replace(" receipts", "");
        var payments = receipts.replace(" payments", "");
        return payments;
      })
      .filter(function (d) {
        return d.x < width / 2;
      })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");
  };

  function d3sankey() {
    var sankey = {},
      nodeWidth = 24,
      nodePadding = 8,
      size = [1, 1],
      nodes = [],
      links = [];
  
    sankey.nodeWidth = function (_) {
      if (!arguments.length) return nodeWidth;
      nodeWidth = +_;
      return sankey;
    };
  
    sankey.nodePadding = function (_) {
      if (!arguments.length) return nodePadding;
      nodePadding = +_;
      return sankey;
    };
  
    sankey.nodes = function (_) {
      if (!arguments.length) return nodes;
      nodes = _;
      return sankey;
    };
  
    sankey.links = function (_) {
      if (!arguments.length) return links;
      links = _;
      return sankey;
    };
  
    sankey.size = function (_) {
      if (!arguments.length) return size;
      size = _;
      return sankey;
    };
  
    sankey.layout = function (iterations) {
      computeNodeLinks();
      computeNodeValues();
      computeNodeBreadths();
      computeNodeDepths(iterations);
      computeLinkDepths();
      return sankey;
    };
  
    sankey.relayout = function () {
      computeLinkDepths();
      return sankey;
    };
  
    sankey.link = function () {
      var curvature = 0.5;
  
      function link(d) {
        var x0 = d.source.x + d.source.dx,
          x1 = d.target.x,
          xi = d3.interpolateNumber(x0, x1),
          x2 = xi(curvature),
          x3 = xi(1 - curvature),
          y0 = d.source.y + d.sy + d.dy / 2,
          y1 = d.target.y + d.ty + d.dy / 2;
        return (
          "M" +
          x0 +
          "," +
          y0 +
          "C" +
          x2 +
          "," +
          y0 +
          " " +
          x3 +
          "," +
          y1 +
          " " +
          x1 +
          "," +
          y1
        );
      }
  
      link.curvature = function (_) {
        if (!arguments.length) return curvature;
        curvature = +_;
        return link;
      };
  
      return link;
    };
  
    // Populate the sourceLinks and targetLinks for each node.
    // Also, if the source and target are not objects, assume they are indices.
    function computeNodeLinks() {
      nodes.forEach(function (node) {
        node.sourceLinks = [];
        node.targetLinks = [];
      });
      links.forEach(function (link) {
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
      nodes.forEach(function (node) {
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
        remainingNodes.forEach(function (node) {
          node.x = x;
          node.dx = nodeWidth;
          node.sourceLinks.forEach(function (link) {
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
      nodes.forEach(function (node) {
        if (!node.targetLinks.length) {
          node.x =
            d3.min(node.sourceLinks, function (d) {
              return d.target.x;
            }) - 1;
        }
      });
    }
  
    function moveSinksRight(x) {
      nodes.forEach(function (node) {
        if (!node.sourceLinks.length) {
          node.x = x - 1;
        }
      });
    }
  
    function scaleNodeBreadths(kx) {
      nodes.forEach(function (node) {
        node.x *= kx;
      });
    }
  
    function computeNodeDepths(iterations) {
      var nodesByBreadth = d3_nest()
        .key(function (d) {
          return d.x;
        })
        .sortKeys(d3.ascending)
        .entries(nodes)
        .map(function (d) {
          return d.values;
        });
  
      //
      initializeNodeDepth();
      resolveCollisions();
      for (var alpha = 1; iterations > 0; --iterations) {
        relaxRightToLeft((alpha *= 0.99));
        resolveCollisions();
        relaxLeftToRight(alpha);
        resolveCollisions();
      }
  
      function initializeNodeDepth() {
        var ky = d3.min(nodesByBreadth, function (nodes) {
          return (
            (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value)
          );
        });
  
        nodesByBreadth.forEach(function (nodes) {
          nodes.forEach(function (node, i) {
            node.y = i;
            node.dy = node.value * ky;
          });
        });
  
        links.forEach(function (link) {
          link.dy = link.value * ky;
        });
      }
  
      function relaxLeftToRight(alpha) {
        nodesByBreadth.forEach(function (nodes, breadth) {
          nodes.forEach(function (node) {
            if (node.targetLinks.length) {
              var y =
                d3.sum(node.targetLinks, weightedSource) /
                d3.sum(node.targetLinks, value);
              node.y += (y - center(node)) * alpha;
            }
          });
        });
  
        function weightedSource(link) {
          return center(link.source) * link.value;
        }
      }
  
      function relaxRightToLeft(alpha) {
        nodesByBreadth
          .slice()
          .reverse()
          .forEach(function (nodes) {
            nodes.forEach(function (node) {
              if (node.sourceLinks.length) {
                var y =
                  d3.sum(node.sourceLinks, weightedTarget) /
                  d3.sum(node.sourceLinks, value);
                node.y += (y - center(node)) * alpha;
              }
            });
          });
  
        function weightedTarget(link) {
          return center(link.target) * link.value;
        }
      }
  
      function resolveCollisions() {
        nodesByBreadth.forEach(function (nodes) {
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
      nodes.forEach(function (node) {
        node.sourceLinks.sort(ascendingTargetDepth);
        node.targetLinks.sort(ascendingSourceDepth);
      });
      nodes.forEach(function (node) {
        var sy = 0,
          ty = 0;
        node.sourceLinks.forEach(function (link) {
          link.sy = sy;
          sy += link.dy;
        });
        node.targetLinks.forEach(function (link) {
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
  }

  const handleFromDateChange = (date) => {
    selectedFromDate = date;
  };

  const handleToDateChange = (date) => {
    selectedToDate = date;
  };

  const handleGetRange = () => {
    get_data();
  };

  return (
    <GridContainer>
      <GridItem xs={12} sm={6} md={6}>
        <DateRangePicker 
          handleFromDateChange={handleFromDateChange} 
          handleToDateChange={handleToDateChange}
          handleGetRange={handleGetRange}
          selectedFromDate={selectedFromDate}
          selectedToDate={selectedToDate}
        />
      </GridItem>
      <GridItem xs={12} sm={12} md={8}>
        <Card>
          <CardHeader className="section_2" color="primary">
            <h4 style={{ marginTop: '5px', marginBottom: '5px', fontWeight: "500" }} >Counterparty Flow Of Funds</h4>
          </CardHeader>
          <CardBody>
            <div style={{ overflowX: "auto", overflowY: "hidden" }}>
              <div className="chart-container center">
                <div className="row headings">
                  <div className="col-sm-3 col-xs-4"><h6 className={classes.cardTitle} style={{ marginTop: '0px', marginBottom: '2px' }}>Payments</h6></div>
                  <div className="col-sm-4 col-xs-4 text-right"><h6 className={classes.cardTitle} style={{ marginTop: '0px', marginBottom: '2px' }}>Instrument</h6></div>
                  <div className="col-sm-3 col-xs-4 text-right"><h6 className={classes.cardTitle} style={{ marginTop: '0px', marginBottom: '2px' }}>Receipts</h6></div>
                </div>
                <div className="row">
                  <div className="col-sm-12  text-center" id="info"></div>
                </div>
                <div className="row">
                  <div id="sankeychart" className="vis-sankeychart" />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </GridItem>
      <GridItem xs={5} sm={12} md={4}>
        <FundsTotals />
      </GridItem>
    </GridContainer>
  );
}
