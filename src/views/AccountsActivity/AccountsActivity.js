import React, { Component } from "react";
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
import {groupColors} from "assets/jss/material-dashboard-react.js";
import ZingGrid from 'zinggrid';

const useStyles = makeStyles(styles);

export default function AccountsActivity({ ...rest }) {
  const classes = useStyles();
  const chartWidth = 300;
  const chartHeight = 370;
  const margin = { top: 20, right: 10, bottom: 30, left: 50 };
  const width = chartWidth - margin.left - margin.right;
  const height = chartHeight - margin.top - margin.bottom;
  const [data, set_data] = React.useState([]);

  var chart_data = []; 
  var svg;
  var fmt = d3.format("0,.0f");

  React.useEffect(() => {
    //draw(data);
    if (data.length === 0){
      get_data();
    }
  });

  function get_data() {
    var url = "/api/most_active_accounts"
    var fromDate = "2020-11-03" //formatDate(selectedFromDate);
    var toDate = "2021-11-03" //formatDate(selectedToDate);
    
    var parameters = {"from":fromDate,"to":toDate};

    axios.post(
      url,
      parameters
    ).then((response) => {
      var data = response.data
      for (var key in data){
        console.log(Object.keys(data[key]).length);
      }
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
    chart_data = _.cloneDeep(Object.values(data));
    set_data(chart_data)
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
            <zing-grid 
              id="accounts_activity"
              data={JSON.stringify(data)} 
              draggable="columns" 
              drag-action="reorder"
              pager
              sort
              loading
              filter>
              <zg-colgroup>
                <zg-column index="account" filter="disabled" sort="disabled"></zg-column>
                <zg-column index="account_type" sort="disabled"></zg-column>
                <zg-column index="receipts" filter="disabled" type="currency" type-currency="ZAR" width="150"></zg-column>
                <zg-column index="balance" filter="disabled" type="currency" type-currency="ZAR" width="150"></zg-column>
                <zg-column index="number_of_receipts" header="Num Receipts" filter="disabled"></zg-column>
                <zg-column index="payments" filter="disabled" type="currency" type-currency="ZAR"></zg-column>
                <zg-column index="number_of_payments" header="Num Payments" filter="disabled"></zg-column>
                <zg-column index="number_of_transactions" header="Num Transactions" filter="disabled"></zg-column>
                <zg-column index="net_transactions_value" filter="disabled" type="currency" type-currency="ZAR"></zg-column>
                <zg-column index="abs_transactions_value" filter="disabled" type="currency" type-currency="ZAR"></zg-column>
              </zg-colgroup>
            </zing-grid>
          </CardBody>
        </Card>
      </GridItem>
    </GridContainer>
  );
}
