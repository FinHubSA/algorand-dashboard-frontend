import React, { useState } from "react";
import $ from "jquery";
// @material-ui/core
import { makeStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
// @material-ui/icons
import Update from "@material-ui/icons/Update";

// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardIcon from "components/Card/CardIcon.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";
import axios from "components/Axios/axios.js";
import moment from "moment";

// charts
import * as d3 from "d3";
import {nest as d3_nest} from 'd3-collection';
import DateRangePicker from "components/DateRange/DateRangePicker.js"
import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import {groupColors} from "assets/jss/material-dashboard-react.js";
import {dailySalesChart} from "variables/charts.js";
import ChartistGraph from "react-chartist";

const useStyles = makeStyles(styles);

export default function Statistics() {
    const classes = useStyles();
    const [total_transactions, setTotalTransactions] = useState()
    const [average_transaction_amount, setAverageTransactionAmount] = useState()
    const [average_loan_amount, setAverageLoanAmount] = useState()
    const [total_volume, setVolume] = useState([])
    const [accounts_activity, setAccountsActivity] = useState([])
    const [data, set_data] = React.useState([
      {"account_type": "Bank", "date": "2021-10-08", "value": "10"},
      {"account_type": "Household", "date": "2021-10-08", "value": "5"},
      {"account_type": "Bank", "date": "2021-10-09", "value": "20"},
      {"account_type": "Household", "date": "2021-10-09", "value": "15"}
    ]);

    var interval = "day"
    const selectedFromDate = React.useRef(new Date());
    const selectedToDate = React.useRef(new Date());

    const startFromDate = new Date();
    const startToDate = new Date();

    var chart_data = [];
    var svg;
    var fmt = d3.format("0,.0f");

    // Start with transactions a year agao
    startFromDate.setFullYear(startFromDate.getFullYear() - 1);
    selectedFromDate.current.setFullYear(selectedFromDate.current.getFullYear() - 1);

   React.useEffect(() => {
     getData();
    }, []);

    function getData(){
        getAverageLoanAmount();
        getTotalTransactions();
        getAverageTransactionAmount();
        getVolume();
        getAccountsActivity();
        getAccountTypeVolume();
    }

    //api calls
   const getTotalTransactions = () => {
     var url = "/api/total_transactions"
     var fromDate = formatDate(selectedFromDate.current);
     var toDate = formatDate(selectedToDate.current);
   
     var parameters = {"from":fromDate,"to":toDate};

     axios.post(
        url,
        parameters
      ).then((response) => {
        var transaction_number = number_formatter(response.data.total_transactions,4)
        setTotalTransactions(transaction_number);
     });
   }

   const getAverageTransactionAmount = () => {
      var url = "/api/average_transaction_amount"

      var fromDate = formatDate(selectedFromDate.current);
      var toDate = formatDate(selectedToDate.current);
    
      var parameters = {"from":fromDate,"to":toDate};

      axios.post(
        url,
        parameters
      ).then((response) => {
        var average = number_formatter(response.data.average_transaction_amount, 4)
        setAverageTransactionAmount(average);
      });
   }

   const getAverageLoanAmount = () => {
      var url = "/api/average_loan_amount"

      var fromDate = formatDate(selectedFromDate.current);
      var toDate = formatDate(selectedToDate.current);
    
      var parameters = {"from":fromDate,"to":toDate};

      axios.post(
        url,
        parameters
      ).then((response) => {
        var average = number_formatter(response.data.average_loan_amount, 4)
        setAverageLoanAmount(average);
      });
  }

  const getVolume = () => {
    var url = "/api/total_volume"
    axios.get(url).then((response) => {
      var total = number_formatter(response.data.total_volume,4)
      setVolume(total);
     });
  }

  const getAccountsActivity = () => {
    var url = "/api/most_active_accounts"
    var fromDate = formatDate(selectedFromDate.current);
    var toDate = formatDate(selectedToDate.current);
    
    var parameters = {"from":fromDate,"to":toDate};

    axios.post(
      url,
      parameters
    ).then((response) => {
      var data = Object.values(response.data);
      setAccountsActivity(data)
    })
    .catch(error => console.error('Error: $(error)'));
  }

  const getAccountTypeVolume = () => {
    var url = "/api/account_type_transaction_volume"
    var fromDate = formatDate(selectedFromDate.current);
    var toDate = formatDate(selectedToDate.current);
    
    var parameters = {"from":fromDate,"to":toDate,"interval":interval};
    axios.post(
      url,
      parameters
    ).then((response) => {
      draw(response.data)
     });
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

  function number_formatter(num, digits) {
      const lookup = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "k" },
      { value: 1e6, symbol: "M" },
      { value: 1e9, symbol: "B" },
      { value: 1e12, symbol: "T" },
      { value: 1e15, symbol: "Quad" },
      { value: 1e18, symbol: "Quint" }
      ];
      const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
      var item = lookup.slice().reverse().find(function(item) {
      return num >= item.value;
      });
      return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
  }
    
  const handleFromDateChange = (date) => {
      selectedFromDate.current = date;
  };
  
  const handleToDateChange = (date) => {
      selectedToDate.current = date;
  };

  const handleIntervalChange = (new_interval) => {
    interval = new_interval;
  };
  
  const handleGetRange = () => {
    getData();
  };

  function draw(data) {
    chart_data = _.cloneDeep(data);

    initialize_line_chart(700, 270, { top: 20, right: 10, bottom: 30, left: 40 });
  }

  function initialize_line_chart(width, height, margin){
    var width = width - margin.left - margin.right;
    var height = height - margin.top - margin.bottom;

    d3.select(".vis-linechart").html("");

    let svg = d3.select(".vis-linechart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var legend_container = d3
      .select(".vis-linechart")
      .append("div")
      .style("display", "inline-block")
      .style("width","90%")
      .style("margin-left","60px");

    var legend = legend_container
      .selectAll(".legend")
      .data(Object.keys(groupColors))
      .enter()
      .append("div")
      .attr("class", "legend")
      .style("height", "20px")
      .style("width", "auto")
      .style("margin-right","70px")
      .style("float", "left");

    legend
      .append("div")
      .style("height","20px")
      .style("width","20px")
      .style("float", "right")
      .style("margin-left","10px")
      .style("background-color",function(d){return groupColors[d];})
      .style("fill", function(d){return groupColors[d];});

    legend
      .append("text")
      .style("float", "left")
      .text(function (d) {
        return d;
      })

    chart_data.forEach(function (d) {
      var format = "%Y-%m-%d";
      if (interval === "month") { format = "%Y-%m" }
      if (interval === "year") { format = "%Y" }
      d.date = d3.timeParse(format)(d.date);
      d.value = parseInt(d.value);
    });

    // Add X axis --> it is a date format
    let x = d3.scaleTime()
        .domain(d3.extent(chart_data, function (d) { return d.date; }))
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(chart_data, function (d) { return +d.value; })])
        .range([height, 0]);
    svg.append("g")
      .call(
        d3.axisLeft(y)
          .tickFormat(function(d){
              return "R "+number_formatter(d, 3);
          }).ticks(5)
      );

    // group data so the line can be computed for each group
    var sumstat = d3_nest() 
      .key(d => d.account_type)
      .entries(chart_data);

    //select path - three types: curveBasis,curveStep, curveCardinal
    svg
    .selectAll(".line")
    .append("g")
    .attr("class", "line")
    .data(sumstat)
    .enter()
    .append("path")
    .attr("d", function (d) {
        return d3.line()
            .x(d => x(d.date))
            .y(d => y(d.value)).curve(d3.curveCardinal)
            (d.values)
    })
    .attr("fill", "none")
    .attr("stroke", d => groupColors[d.key.toLowerCase()])
    .attr("stroke-width", 2)

    //append circle 
    svg
    .selectAll("circle")
    .append("g")
    .data(chart_data)
    .enter()
    .append("circle")
    .attr("r", 6)
    .attr("cx", d => x(d.date))
    .attr("cy", d => y(d.value))
    .on("mouseover", function (event, d) {
      d3.select("#line-info").html(
        d.date.toDateString() + " : " +
        d.account_type + " : " +
        " <em> R " +
        fmt(d.value) +
        "</em>"
      );
      d3.select(this).style("fill-opacity", 0.5);
    })
    .on("mouseout", function (event, d) {
      $("#line-info").empty();
      d3.select(this).style("fill-opacity", 1);
    })
    .style("fill", d => groupColors[d.account_type.toLowerCase()])
  }

  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <DateRangePicker 
            handleFromDateChange={handleFromDateChange} 
            handleToDateChange={handleToDateChange}
            handleIntervalChange={handleIntervalChange}
            handleGetRange={handleGetRange}
            showInterval={true}
            selectedFromDate={startFromDate}
            selectedToDate={startToDate}
        />
      </GridItem>
      <GridItem xs={12} sm={12} md={3}>
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
              <Card>
              <CardHeader  color="warning" stats icon>
                <CardIcon  color="warning" className="section_1">
                  <Icon className="section_1">list_alt</Icon>
                </CardIcon>
                <p className={classes.cardCategory}>Transactions Count</p>
                <h3 className={classes.cardTitle}> {total_transactions}
                </h3>
              </CardHeader>
              <CardFooter stats>
              <div className={classes.stats}>
                  <Update />
                  Just Updated
                </div>
              </CardFooter>
            </Card>
          </GridItem>

          <GridItem xs={12} sm={12} md={12}>
            <Card>
              <CardHeader color="success" stats icon>
                <CardIcon className="section_1" color="success">
                  <Icon className="section_1">money</Icon>
                </CardIcon>
                <p className={classes.cardCategory}>Average Transaction Size</p>
                <h3 className={classes.cardTitle}>R {average_transaction_amount} </h3>
              </CardHeader>
              <CardFooter stats>
              <div className={classes.stats}>
                  <Update />
                  Just Updated
                </div>
              </CardFooter>
            </Card>
          </GridItem>
        
          <GridItem xs={12} sm={12} md={12}>
            <Card>
              <CardHeader color="success" stats icon>
                <CardIcon className="section_1" color="success">
                  <Icon className="section_1">account_balance</Icon>
                </CardIcon>
                <p className={classes.cardCategory}>Volume in Circulation</p>
                    <h3 className={classes.cardTitle}>{total_volume }</h3>
              </CardHeader>
              <CardFooter stats>
              <div className={classes.stats}>
                  <Update />
                  Just Updated
                </div>
              </CardFooter>
            </Card>
          </GridItem>

          <GridItem xs={12} sm={12} md={12}>
            <Card>
              <CardHeader color="success" stats icon>
                <CardIcon className="section_1" color="success">
                  <Icon className="section_1">credit_card</Icon>
                </CardIcon>
                <p className={classes.cardCategory}>Average Loan Amount</p>
                <h3 className={classes.cardTitle}>R {average_loan_amount}</h3>
              </CardHeader>
              <CardFooter stats>
              <div className={classes.stats}>
                  <Update />
                  Just Updated
                </div>
              </CardFooter>
            </Card>
          </GridItem>
        </GridContainer>
      </GridItem>

      <GridItem xs={12} sm={12} md={9}>
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <Card chart>
              <CardHeader className="section_1" color="primary">
                <h4 style={{ marginTop: '5px', marginBottom: '5px', fontWeight: "500" }} >Transactions Volume</h4>
              </CardHeader>
              <CardBody color="warning">
                <div style={{ overflowX: "auto", overflowY: "hidden" }}>
                  <div className="chart-container center">
                    <div className="row">
                      <div className="col-sm-12  text-center chart-info" id="line-info"></div>
                    </div>
                    <div className="row">
                      <div id="linechart" className="vis-linechart" />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem xs={12} sm={12} md={12}>
            <Card>
              <CardHeader className="section_1" color="primary">
                <h4 style={{ marginTop: '5px', marginBottom: '5px', fontWeight: "500" }} >Accounts Activity</h4>
              </CardHeader>
              <CardBody>
                <div style={{ overflowX: "auto", overflowY: "hidden" }}>
                  <zing-grid 
                    id="accounts_activity"
                    data={JSON.stringify(accounts_activity)} 
                    draggable="columns" 
                    drag-action="reorder"
                    page-size="5"
                    pager
                    sort
                    loading
                    filter>
                    <zg-colgroup>
                      <zg-column index="account" filter="disabled" sort="disabled"></zg-column>
                      <zg-column index="account_type" sort="disabled"></zg-column>
                      <zg-column index="balance" filter="disabled" type="currency" type-currency="ZAR" width="150"></zg-column>
                      <zg-column index="net_transactions_value" header="Net Txns Value" filter="disabled" type="currency" type-currency="ZAR"></zg-column>
                      <zg-column index="number_of_transactions" header="Num Txns" filter="disabled"></zg-column>
                      <zg-column index="receipts" filter="disabled" type="currency" type-currency="ZAR" sort-desc width="150"></zg-column>
                      <zg-column index="balance" filter="disabled" type="currency" type-currency="ZAR" width="150"></zg-column>
                      <zg-column index="number_of_receipts" header="Num Receipts" filter="disabled"></zg-column>
                      <zg-column index="payments" filter="disabled" type="currency" type-currency="ZAR"></zg-column>
                      <zg-column index="number_of_payments" header="Num Payments" filter="disabled"></zg-column>
                      <zg-column index="abs_transactions_value" filter="disabled" type="currency" type-currency="ZAR"></zg-column>
                    </zg-colgroup>
                  </zing-grid>
                </div>
              </CardBody>
            </Card>
          </GridItem>
        </GridContainer>
      </GridItem>
      
    </GridContainer>
  );
}
