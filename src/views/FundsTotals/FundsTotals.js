import React, { Component } from "react";
import ChartistGraph from "react-chartist";
import * as d3 from "d3";
import _ from "lodash";
import {nest as d3_nest} from 'd3-collection';
import "../../assets/css/charts.css";
import $ from "jquery";
import axios from "components/Axios/axios.js";
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

const useStyles = makeStyles(styles);

export default function FundsFlow({ ...rest }) {
  const classes = useStyles();
  const chartWidth = 300;
  const chartHeight = 370;
  const margin = { top: 20, right: 10, bottom: 30, left: 50 };
  const width = chartWidth - margin.left - margin.right;
  const height = chartHeight - margin.top - margin.bottom;
  const [data, set_data] = React.useState([
    {
      account_type: "Household",
      value: 1000000,
    },
    {
    account_type: "Firm",
      value: 1500000,
    },
    {
        account_type: "CentralBank",
      value: 1000000,
    },
    {
        account_type: "Bank",
      value: 1500000,
    },
    {
        account_type: "LSP",
      value: 500000,
    }
  ]);

  var chart_data = []; 
  var svg;
  var fmt = d3.format("0,.0f");

  React.useEffect(() => {
    //draw(data);
    get_data();
  });

  function get_data() {
    var url = "/api/account_type_total"
    axios.get(url).then((response) => {
      console.log("acc ty **");
      console.log(response.data)
      draw(response.data);
    })
    .catch(error => console.error('Error: $(error)'));
  }

  function draw(data) {
    chart_data = _.cloneDeep(data);

    initialize_chart();
  }

  function initialize_chart() {
    d3.select(".vis-barchart > *").remove();
    
    svg = d3.select('.vis-barchart').append('svg')
        .attr('width',width + margin.left + margin.right)
        .attr('height',height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // format the data
    chart_data.forEach(function(d) {
        d.value = parseInt(d.value);
    });

    // Scale the range of the data in the domains
    let x = d3.scaleBand()
          .range([0, width])
          .padding(0.1);
    let y = d3.scaleLog()
          .range([height, 0]);
    x.domain(chart_data.map(function(d) {return d.account_type;}));
    y.domain([1, d3.max(chart_data, function(d) {return d.value; })]);

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .data(chart_data)
        .enter().append("rect")
        .attr("fill",bar_color)
        .attr("x", function(d) { return x(d.account_type); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); });

    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // add the y Axis
    svg.append("g")
        .call(
            d3.axisLeft(y)
            .tickFormat(function(d){
                return "R "+number_formatter(d, 3);
            }).ticks(10)
        );
  }

  function number_formatter(num, digits) {
    const lookup = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "k" },
      { value: 1e6, symbol: "M" },
      { value: 1e9, symbol: "B" },
      { value: 1e12, symbol: "T" },
      { value: 1e15, symbol: "P" },
      { value: 1e18, symbol: "E" }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var item = lookup.slice().reverse().find(function(item) {
      return num >= item.value;
    });
    return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
  }

  function bar_color(d) {
    var acc_type = d.account_type.split(" ").join("_").toLowerCase();
    return groupColors[acc_type];
  }

  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <Card>
          <CardHeader className="section_2" color="primary">
            <h4 style={{ marginTop: '5px', marginBottom: '5px', fontWeight: "500" }} >Counterparty Balances</h4>
          </CardHeader>
          <CardBody>
            <div style={{ overflowX: "auto", overflowY: "hidden" }}>
              <div className="chart-container center">
                <div className="row">
                  <div id="barchart" className="vis-barchart" />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </GridItem>
    </GridContainer>
  );
}
