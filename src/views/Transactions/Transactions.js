import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import * as d3 from "d3";
import { event as d3_event } from "d3-selection";
import { drag as d3Drag } from "d3-drag";
import "../../assets/css/charts.css";
import _ from "lodash";
import $ from "jquery";
// @material-ui/core
import { makeStyles } from "@material-ui/core/styles";
import Modal from '@material-ui/core/Modal';
import TextField from '@material-ui/core/TextField';
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
  const [chartWidth, setChartWidth] = React.useState(1100);
  const [chartHeight, setChartHeight] = React.useState(530);
  const [fixedClasses, setFixedClasses] = React.useState("dropdown show");
  const [side_bar_data, set_side_bar_data] = React.useState([
    { name: "Central Bank" },
  ]);
  const handleImageClick = (image) => {};
  const handleFixedClick = () => {
    if (fixedClasses === "dropdown") {
      setFixedClasses("dropdown show");
    } else {
      setFixedClasses("dropdown");
    }
  };
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
    draw(data);
  });

  function componentDidUpdate() {
    draw(this.props, data);
  }

  // Data for drawing
  var chart_data = {}; 
  var simulation;
  var nodes = [];
  var links = [];
  var svg;
  var tooltip;
  var ticked;
  var groups = {};
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

    /*var legend = svg
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
        var grouped = group_data(group_by_account_type, d);
        if (grouped) {
          refresh_data();
        }
      }); */
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
        tooltip
          .html(
            "<p/>Account Name:" +
              d.id +
              "<p/>Payments:" +
              d.payments +
              "<p/>Receipts:" +
              d.receipts
          )
          .style("left", d3_event.pageX + 5 + "px")
          .style("top", d3_event.pageY + 5 + "px")
          .style("opacity", 0.9);
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
        return "left: " + (d.x + 14) + "px; top: " + (d.y + 7) + "px";
      });
    };
  }

  function start_simulation() {
    //Starting simulation
    simulation.nodes(nodes).on("tick", ticked);

    simulation.force("link").links(links);

    //console.log("final***");
    //console.log(links);
  }

  function group_data(criteria, parameters) {
    console.log("params**")
    console.log(parameters)
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

    groups[group_id] = group_txns;

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
        var og_txn = groups[group_id][txn.id];

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
    var account_type = parameters[0]
    var results = [false, false];
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
    var account_type = parameters[0]
    var min = parseFloat(parameters[1])
    var max = parseFloat(parameters[2])

    var results = [false, false];
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

  function NetworkChartCard() {
    return (
      <CardBody>
        <div style={{ overflowX: "hidden", overflowY: "hidden" }}>
          <div className="container">
            <div className="vis-networkchart"></div>
          </div>
        </div>
      </CardBody>
    );
  }  

  const MemoizedNetworkChart = React.memo(NetworkChartCard);  
  const [modalOpen, setModalOpen] = React.useState(false);
  const [groupBy, setGroupBy] = React.useState("");

  const handleModalOpen = () => {
      setModalOpen(true);
  };

  const handleModalClose = () => {
      setModalOpen(false);
  };

  const handleGroupClick = (groupBy) => {
    setGroupBy(groupBy);
    setModalOpen(true);
  };

  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="primary">
              <h4>Transactions</h4>
            </CardHeader>
            <MemoizedNetworkChart />
          </Card>
        </GridItem>
        {/*<GridItem xs={15} sm={15} md={2}>
          <Card>
            <CardHeader color="primary">
              <h5>Legend</h5>
            </CardHeader>
            <CardBody>
              <div
                style={{
                  height: "100%",
                  overflowX: "hidden",
                  overflowY: "hidden",
                }}
              >
                <div className="container"></div>
              </div>
            </CardBody>
          </Card>
              </GridItem>*/}
        <FixedPlugin
          handleImageClick={handleImageClick}
          handleGroupClick={handleGroupClick}
          handleFixedClick={handleFixedClick}
          fixedClasses={fixedClasses}
        />
      </GridContainer>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={modalOpen}
        onClose={handleModalClose}
        style={{display:'flex',alignItems:'center',justifyContent:'center'}}
      >
        <GridContainer>
          <GridItem xs={6} sm={6} md={6}>
            <Card>
              <CardBody profile>
                <div style={{textAlign:"center"}}>
                  <h4 className={classes.cardTitle}>Set Grouping Parameters</h4>
                  <TextField style={{margin:"5px"}} id="min-range" label="Min" variant="outlined" />
                  <TextField style={{margin:"5px"}} id="max-range" label="Max" variant="outlined" />
                  <Button 
                    color="primary" 
                    round
                    onClick={() => {
                      var grouped = group_data(group_by_account_type, [groupBy]);
                      if (grouped) {
                        refresh_data();
                      }
                    }}>
                    Group All
                  </Button>
                  <Button 
                    color="primary" 
                    round
                    onClick={() => {
                      var min = $("#min-range").val();
                      var max = $("#max-range").val();
                      var grouped = group_data(group_by_range, [groupBy, min, max]);
                      if (grouped) {
                        refresh_data();
                      }
                    }}>
                    Group Range
                  </Button>
                </div>
              </CardBody>
            </Card>
          </GridItem>
        </GridContainer>
      </Modal>
    </div>
  );
}
