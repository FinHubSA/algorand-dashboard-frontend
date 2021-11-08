import React, { useState } from "react";
// @material-ui/core
import { makeStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
// @material-ui/icons
import Store from "@material-ui/icons/Store";
import Warning from "@material-ui/icons/Warning";
import DateRange from "@material-ui/icons/DateRange";
import LocalOffer from "@material-ui/icons/LocalOffer";
import Update from "@material-ui/icons/Update";
import AccessTime from "@material-ui/icons/AccessTime";
import Accessibility from "@material-ui/icons/Accessibility";
import BugReport from "@material-ui/icons/BugReport";
import Code from "@material-ui/icons/Code";
import Cloud from "@material-ui/icons/Cloud";

import ReactDOM from 'react-dom';
import Divider from '@mui/material/Divider';

//date picker
import DatePicker from "react-datepicker";
// import required css from library
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Table from "components/Table/Table.js";
import Tasks from "components/Tasks/Tasks.js";
import CustomTabs from "components/CustomTabs/CustomTabs.js";
import Danger from "components/Typography/Danger.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardIcon from "components/Card/CardIcon.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";
import axios from "axios";
import TableList from "views/TableList/TableList.js";

// charts
import DateRangePicker from "components/DateRange/DateRangePicker.js"
import ZingGrid from 'zinggrid';
import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";

const useStyles = makeStyles(styles);

export default function Statistics() {
    const classes = useStyles();
    const [total_transactions, setTotalTransactions] = useState()
    const [average_transaction_amount, setAverageTransactionAmount] = useState()
    const [average_loan_amount, setAverageLoanAmount] = useState()
    const [total_volume, setVolume] = useState([])
    const [accounts_activity, setAccountsActivity] = useState([])
    
    var selectedFromDate = new Date();
    var selectedToDate = new Date();

    // Start with transactions a year agao
    selectedFromDate.setFullYear(selectedFromDate.getFullYear() - 1);

   React.useEffect(() => {
     getData();
    }, []);

    function getData(){
        getAverageLoanAmount();
        getTotalTransactions();
        getAverageTransactionAmount();
        getVolume();
        getAccountsActivity();
    }

    //api calls
   const getTotalTransactions = () => {
     var url = "http://localhost:8000/api/total_transactions"
     var fromDate = formatDate(selectedFromDate);
     var toDate = formatDate(selectedToDate);
   
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
      var url = "http://localhost:8000/api/average_transaction_amount"

      var fromDate = formatDate(selectedFromDate);
      var toDate = formatDate(selectedToDate);
    
      var parameters = {"from":fromDate,"to":toDate};

      axios.post(
        url,
        parameters
      ).then((response) => {
        console.log("average**")
        console.log(response.data)
        var average = number_formatter(response.data.average_transaction_amount, 4)
        setAverageTransactionAmount(average);
      });
   }

   const getAverageLoanAmount = () => {
      var url = "http://localhost:8000/api/average_loan_amount"

      var fromDate = formatDate(selectedFromDate);
      var toDate = formatDate(selectedToDate);
    
      var parameters = {"from":fromDate,"to":toDate};

      axios.post(
        url,
        parameters
      ).then((response) => {
        console.log("average**")
        console.log(response.data)
        var average = number_formatter(response.data.average_loan_amount, 4)
        setAverageLoanAmount(average);
      });
  }

  const getVolume = () => {
    var url = "http://localhost:8000/api/total_volume"
    axios.get(url).then((response) => {
      var total = number_formatter(response.data.total_volume,4)
      setVolume(total);
     });
  }

  const getAccountsActivity = () => {
    var url = "http://localhost:8000/api/most_active_accounts"
    var fromDate = formatDate(selectedFromDate);
    var toDate = formatDate(selectedToDate);
    
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
        selectedFromDate = date;
    };
    
    const handleToDateChange = (date) => {
        selectedToDate = date;
    };
    
    const handleGetRange = () => {
      getData();
    };

    function truncateDecimals(importance, cellRef, domRef) {
      return importance.toFixed(2);
    }

    return (
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
            <GridContainer>
                <GridItem xs={12} sm={12} md={6}>
                    <DateRangePicker 
                        handleFromDateChange={handleFromDateChange} 
                        handleToDateChange={handleToDateChange}
                        handleGetRange={handleGetRange}
                        selectedFromDate={selectedFromDate}
                        selectedToDate={selectedToDate}
                    />
                </GridItem>
            </GridContainer>
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
                  page-size="11"
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
  );
}
