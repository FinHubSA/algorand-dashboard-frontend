import React from "react";
//import { Switch, Route, Redirect } from "react-router-dom";
import * as d3 from "d3";
import { event as d3_event } from "d3-selection";
import { drag as d3Drag } from "d3-drag";
import "../../assets/css/charts.css";
import _ from "lodash";
import $ from "jquery";
// @material-ui/core
import { makeStyles } from "@material-ui/core/styles";
import TextField from '@material-ui/core/TextField';
import { Select, MenuItem } from '@material-ui/core';
// core components
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import FixedPlugin from "./FixedPlugin.js";

const styles = {
  cardCategoryWhite: {
    color: "rgba(255,255,255,.62)",
    margin: "0",
    fontSize: "14px",
    marginTop: "0",
    marginBottom: "0",
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
  },
};

const useStyles = makeStyles(styles);

export default function Transactions({ ...rest }) {
  const classes = useStyles();
  const chartWidth = 1100
  const chartHeight = 530;
  const groupBy = React.useRef();
  const [data, set_data] = React.useState([
    {
      key: "",
      id: "T1",
      amount: 5000000,
      sender: "HH1",
      receiver: "B1",
      sender_balance: 1000000,
      receiver_balance: 100000000,
      sender_type: "Households",
      receiver_type: "Banks",
      instrument_type: "Deposits",
    },
    {
      key: "",
      id: "T2",
      amount: 6000000,
      sender: "HH2",
      receiver: "B1",
      sender_balance: 2000000,
      receiver_balance: 100000000,
      sender_type: "Households",
      receiver_type: "Banks",
      instrument_type: "Deposits",
    },
    {
      key: "",
      id: "T3",
      amount: 500000,
      sender: "B1",
      receiver: "HH2",
      sender_balance: 100000000,
      receiver_balance: 2000000,
      sender_type: "Banks",
      receiver_type: "Households",
      instrument_type: "Loans and Bonds",
    },
    {
      key: "",
      id: "T4",
      amount: 5000,
      sender: "HH1",
      receiver: "F1",
      sender_balance: 1000000,
      receiver_balance: 10000000,
      sender_type: "Households",
      receiver_type: "Firms",
      instrument_type: "Bank Notes",
    },
    {
      key: "",
      id: "T5",
      amount: 6500,
      sender: "HH2",
      receiver: "F1",
      sender_balance: 2000000,
      receiver_balance: 10000000,
      sender_type: "Households",
      receiver_type: "Firms",
      instrument_type: "Bank Notes",
    },
    {
      id: "T6",
      amount: 7200,
      sender: "HH2",
      receiver: "F1",
      sender_balance: 2000000,
      receiver_balance: 10000000,
      sender_type: "Households",
      receiver_type: "Firms",
      instrument_type: "Bank Notes",
    },
    {
      id: "T7",
      amount: 50000,
      sender: "HH2",
      receiver: "F1",
      sender_balance: 2000000,
      receiver_balance: 10000000,
      sender_type: "Households",
      receiver_type: "Firms",
      instrument_type: "Bank Notes",
    },
    {
      id: "T8",
      amount: 1000000,
      sender: "B1",
      receiver: "CB",
      sender_balance: 100000000,
      receiver_balance: 1000000000,
      sender_type: "Banks",
      receiver_type: "Central Bank",
      instrument_type: "Reserves",
    },
    {
      id: "T9",
      amount: 1000000,
      sender: "B1",
      receiver: "F1",
      sender_balance: 100000000,
      receiver_balance: 10000000,
      sender_type: "Banks",
      receiver_type: "Firms",
      instrument_type: "Loans and Bonds",
    },
    {
      id: "T10",
      amount: 500000,
      sender: "HH1",
      receiver: "HH2",
      sender_balance: 1000000,
      receiver_balance: 2000000,
      sender_type: "Households",
      receiver_type: "Households",
      instrument_type: "Bank Notes",
    },
  ]);

  React.useEffect(() => {
    console.log("transactions fired");
    draw(data);
  });

  // Data for drawing
  var chart_data = {}; 
  var simulation;
  var nodes = [];
  var links = [];
  var groups = {};
  var svg;
  var tooltip;
  var ticked;
  var width;
  var height;
  var linkWidthScale = d3.scaleLinear().range([1, 5]);
  var linkStrengthScale = d3.scaleLinear().range([0, 1]);
  var margin = { top: 0, right: 0, bottom: 0, left: 0 };

  function draw(data) {
    chart_data = _.cloneDeep(data);

    width = chartWidth - margin.left - margin.right;
    height = chartHeight - margin.top - margin.bottom;

    refresh_data();
  }

  function refresh_data() {
    initialize_chart();
    prepare_data();
    initialize_simulation();
    start_simulation();
  }

  function initialize_chart() {
    var colors = d3
      .scaleOrdinal()
      .domain([
        "Banks",
        "Central Bank",
        "Firms",
        "Households",
        "License Service Providers",
      ])
      .range(["#ff8c00", "#40e0d0", "#008000", "#a52a2a", "#4fc2be"]);

    d3.select(".vis-networkchart").html("");

    svg = d3
      .select(".vis-networkchart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    tooltip = d3
      .select(".container")
      .append("div")
      .attr("class", "node-tooltip")
      .html("Tooltip");

    var legend = svg
      .selectAll(".legend")
      .data(colors.domain())
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", function (d, i) {
        return "translate(0," + i * 30 + ")";
      });

    legend
      .append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", colors);

    legend
      .append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function (d) {
        return d;
      })
      .on("click", function (d) {
        
      }); 
  }

  /**
   * Takes the transactions and creates the nodes and links
   */
  function prepare_data() {
    nodes = [];
    links = [];

    var txn_nodes = [];
    // Each transaction will be a link.
    // Every source and target will have one link with sum of transactions between them

    //aggregate all transactions between same addresses
    var sender_receiver = {};
    var accounts_aggregates = {};
    chart_data.forEach(function (d) {
      var receivers = null;
      if (d.sender in sender_receiver) {
        receivers = sender_receiver[d.sender];
        //If sender and receiver are already in just add them up
        if (d.receiver in receivers) {
          receivers[d.receiver] = receivers[d.receiver] + d.amount;
        }
        // Only sender is in so create new receiver for sender
        else {
          receivers[d.receiver] = d.amount;
        }
      }
      // If receiver was a sender before then check if sender was a receiver and add those up
      else if (d.receiver in sender_receiver) {
        receivers = sender_receiver[d.receiver];
        if (d.sender in receivers) {
          receivers[d.sender] = receivers[d.sender] + d.amount;
        }
      }
      // else create new sender and receiver
      else {
        sender_receiver[d.sender] = {};
        sender_receiver[d.sender][d.receiver] = d.amount;
      }

      // Now also put in account aggregates
      var total_payments = 0;
      var total_receipts = 0;
      if (d.sender in accounts_aggregates) {
        total_payments = accounts_aggregates[d.sender].payments;
      } else {
        accounts_aggregates[d.sender] = { payments: 0, receipts: 0 };
      }

      if (d.receiver in accounts_aggregates) {
        total_receipts = accounts_aggregates[d.receiver].receipts;
      } else {
        accounts_aggregates[d.receiver] = { payments: 0, receipts: 0 };
      }

      accounts_aggregates[d.sender].payments = total_payments + d.amount;
      accounts_aggregates[d.receiver].receipts = total_receipts + d.amount;
    });

    // Get all addresses which will be nodes
    // Start with senders then go to receivers
    d3.nest()
      .key(function (d) {
        return d.sender;
      })
      .rollup(function (values) {
        var txn = values[0];
        txn_nodes.push({ id: txn.sender, account_type: txn.sender_type });
      })
      .entries(chart_data);

    // Now get receivers
    d3.nest()
      .key(function (d) {
        return d.receiver;
      })
      .rollup(function (values) {
        var txn = values[0];
        txn_nodes.push({ id: txn.receiver, account_type: txn.receiver_type });
      })
      .entries(chart_data);

    // Reduce to unique set of nodes
    d3.nest()
      .key(function (d) {
        return d.id;
      })
      .rollup(function (values) {
        var node = values[0];
        nodes.push({
          id: node.id,
          account_type: node.account_type,
          payments: accounts_aggregates[node.id].payments,
          receipts: accounts_aggregates[node.id].receipts,
        });
      })
      .entries(txn_nodes);

    var nodes_keys = d3
      .nest()
      .key(function (d) {
        return d.id;
      })
      .map(nodes)
      .keys();

    for (var sender in sender_receiver) {
      var receivers = sender_receiver[sender];

      for (var receiver in receivers) {
        links.push({
          source: nodes_keys.indexOf(sender),
          target: nodes_keys.indexOf(receiver),
          value: receivers[receiver],
        });
      }
    }

    linkWidthScale.domain(
      d3.extent(links, function (d) {
        return d.value;
      })
    );

    linkStrengthScale.domain(
      d3.extent(links, function (d) {
        return d.value;
      })
    );
  }

  /**
   * Should be after the nodes and links have been prepared
   */
  function initialize_simulation() {
    //Initializing force simulation
    simulation = d3
      .forceSimulation()
      // pull nodes together based on the links between them
      .force("link", d3.forceLink())
      // push nodes apart to space them out
      .force("charge", d3.forceManyBody().strength(-5))
      // add some collision detection so they don't overlap
      .force("collide", d3.forceCollide().radius(30))
      // and draw them around the centre of the space
      .force("center", d3.forceCenter(width / 2, height / 2));

    //Drag functions
    var dragStart = (d) => {
      alert("drag");
      if (!d3_event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    };

    var drag = (d) => {
      d.fx = d3_event.x;
      d.fy = d3_event.y;
    };

    var dragEnd = (d) => {
      if (!d3_event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    };

    //Creating links
    var link = svg
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke-width", function (d) {
        return linkWidthScale(d.value);
      })
      .on("mouseover", function () {});

    //Creating nodes
    var node = d3
      .select(".vis-networkchart")
      .selectAll("div")
      .data(nodes)
      .enter()
      .append("div")
      .attr("class", (d) => {
        var acc_type = d.account_type.split(" ").join("_").toLowerCase();
        var group = "";

        if (d.id in groups) {
          group = "node-group";
        }

        return "node " + acc_type + " " + group;
      })
      .call(
        d3Drag().on("start", dragStart).on("drag", drag).on("end", dragEnd)
      )
      .on("mouseover", (d) => {
        node_tooltip(d);
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0).style("left", "0px").style("top", "0px");
      })
      .on("click", (d) => {
        tooltip.style("opacity", 0).style("left", "0px").style("top", "0px");

        var ungrouped = ungroup_data(d.id);
        if (ungrouped) {
          refresh_data();
        }
      });

    //Setting location when ticked
    ticked = () => {
      link
        .attr("x1", (d) => {
          return d.source.x;
        })
        .attr("y1", (d) => {
          return d.source.y;
        })
        .attr("x2", (d) => {
          return d.target.x;
        })
        .attr("y2", (d) => {
          return d.target.y;
        });

      node.attr("style", (d) => {
        return "left: " + (d.x - 3) + "px; top: " + (d.y + 70) + "px";
      });
    };
  }

  function node_tooltip(d) {
    var html = ""
    if (d.id in groups) {
      var info = groups[d.id]["info"];
      var range = groups[d.id]["range"];
      html = 
        "<div class='node-info'>"+
          "<p>Group Info: " +info+"</p>" +
          "<p>Group Range: " +range +"</p>" +
          "<p>Payments: <i class='fas fa-rupee-sign' area-hidden='true'></i>" +d.payments + "</p>" +
          "<p>Receipts: " + d.receipts + "</p>" +
        "</div>"
    }else{
      html = 
        "<div class='node-info'>"+
          "<p>Account Name: " +d.id +"</p>" +
          "<p>Payments: <i class='fas fa-rupee-sign' area-hidden='true'></i>" +d.payments + "</p>" +
          "<p>Receipts: " + d.receipts + "</p>" +
        "</div>"
    }

    tooltip
      .html(html)
      .style("left", d3_event.pageX - 100 + "px")
      .style("top", d3_event.pageY - 20 + "px")
      .style("opacity", 0.9);
  }

  function start_simulation() {
    //Starting simulation
    simulation.nodes(nodes).on("tick", ticked).on('end', function() {});
    simulation.force("link").links(links);
  }

  function group_data(criteria, parameters, group_info="", group_range="") {
    var group_id = "group_" + Object.keys(groups).length;
    var group_txns = {};
    var grouped_nodes = {};

    // Replace transactions sender/receiver with grouped node
    chart_data.forEach(function (txn) {
      const orignial_txn = _.cloneDeep(txn);
      
      if (criteria(txn, parameters)[0]) {
          grouped_nodes[txn.sender] = 1;
          txn.sender = group_id;
      }

      if (criteria(txn, parameters)[1]) {
        grouped_nodes[txn.receiver] = 1;
        txn.receiver = group_id;
      }

      // so that it can return to former state
      group_txns[txn.id] = orignial_txn;
    });

    groups[group_id] = {}
    groups[group_id]["transactions"] = group_txns;
    groups[group_id]["info"] = group_info;
    groups[group_id]["range"] = group_range;

    console.log("grouped**");
    console.log(grouped_nodes);
    // If we grouped one node we ungroup
    if (Object.keys(grouped_nodes).length <= 1) {
      ungroup_data(group_id);
      return false;
    }

    return true;
  }

  function ungroup_data(group_id) {
    if (!(group_id in groups)) {
      return false;
    }

    chart_data.forEach(function (txn) {
      if (txn.sender === group_id || txn.receiver === group_id) {
        var og_txn = groups[group_id]["transactions"][txn.id];

        txn.sender = og_txn.sender;
        txn.receiver = og_txn.receiver;
      }
    });

    delete groups[group_id];

    return true;
  }

  /**
   * Returns if should be grouped by account_type
   * 
   * parameters is an array that takes in:
   * parameters[0] - account_type
   * 
   * Returns an array showing whether sender or receiver should be grouped
   * result[0] - sender
   * result[1] - receiver
   * @param {*} txn 
   * @param {*} parameters 
   * @returns 
   */
  function group_by_account_type(txn, parameters) {
    var results = [false, false];
    var account_type = parameters[0]
    
    if (account_type === undefined){
      return results;
    }

    if (txn.sender_type.toLowerCase() === account_type.toLowerCase()) {
      results[0] = true;
    }

    if (txn.receiver_type.toLowerCase() === account_type.toLowerCase()) {
      results[1] = true;
    }

    return results;
  }

  /**
   * The range grouping is within an account type.
   * This can be undone by removing the accoun_type comparison if needed.
   * At this time it such comparisons do not make sense.
   * 
   * parameters is an array that takes in:
   * parameters[0] - account_type
   * parameters[1] - min
   * parameters[2] - max
   * 
   * Returns an array showing whether sender or receiver should be grouped
   * result[0] - sender
   * result[1] - receiver
   * @param {*} txn 
   * @param {*} parameters 
   * @returns 
   */
  function group_by_range(txn, parameters) {
    var results = [false, false];
    var account_type = parameters[0]

    if (account_type === undefined){
      return results;
    }

    var min = parseFloat(parameters[1])
    var max = parseFloat(parameters[2])

    if (txn.sender_type.toLowerCase() === account_type.toLowerCase()) {
      if (min <= txn.sender_balance && txn.sender_balance < max) {
        results[0] = true;
      }
    }

    if (txn.receiver_type.toLowerCase() === account_type.toLowerCase()) {
      if (min <= txn.receiver_balance && txn.receiver_balance < max) {
        results[1] = true;
      }
    }
    return results;
  }

  const selected = React.useRef();

  const handleSelectChange = event => {
    console.log("drop **");
    console.log(event.target.value);
    //console.log(selectAcc.current)
    selected.current = event.target.value;
  };

  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="primary">
              <h4 style={{ marginTop: '5px', marginBottom: '5px' }}>Transactional Node Graph</h4>
            </CardHeader>
            <CardBody>
              <GridContainer>
                <GridItem xs={12} sm={2} md={2}>
                  <Select
                    style={{margin:"5px", width:"100%"}}
                    variant="outlined"
                    id="account_type_select"
                    label="Account Type"
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="Households">Households</MenuItem>
                    <MenuItem value="Banks">Banks</MenuItem>
                    <MenuItem value="Firms">Firms</MenuItem>
                    <MenuItem value="LSP">License Service Providers</MenuItem>
                    <MenuItem value="Central Bank">Central Bank</MenuItem>
                  </Select>
                </GridItem>
                <GridItem xs={12} sm={2} md={2}>
                  <TextField style={{margin:"5px"}} id="min-range" label="Min Balance" variant="outlined" />
                </GridItem>
                <GridItem xs={12} sm={2} md={2}>
                  <TextField style={{margin:"5px"}} id="max-range" label="Max Balance" variant="outlined" />
                </GridItem>
                <GridItem xs={12} sm={2} md={2}>
                  <Button 
                    color="primary" 
                    round
                    onClick={() => {
                      var min = $("#min-range").val();
                      var max = $("#max-range").val();

                      var group_info = selected.current;
                      var group_range = min+" - "+max;

                      var grouped = group_data(group_by_range, [selected.current, min, max], group_info, group_range);
                      if (grouped) {
                        refresh_data();
                      }
                    }}>
                    Group Range
                  </Button>
                </GridItem>
                <GridItem xs={12} sm={2} md={2}>
                  <Button 
                    color="primary" 
                    round
                    onClick={() => {
                      var group_info = selected.current;
                      var group_range = "All";

                      var grouped = group_data(group_by_account_type, [selected.current], group_info, group_range);
                      if (grouped) {
                        refresh_data();
                      }
                    }}>
                    Group All
                  </Button>
                </GridItem>
                <div style={{ overflowX: "auto", overflowY: "hidden" }}>
                  <div className="container">
                    <div className="vis-networkchart"></div>
                  </div>
                </div>
              </GridContainer>
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  );
}