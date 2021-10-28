import React, { useState } from "react";
// react plugin for creating charts
import ChartistGraph from "react-chartist";
// @material-ui/core
import { makeStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
// @material-ui/icons
import Store from "@material-ui/icons/Store";
import Warning from "@material-ui/icons/Warning";
import DateRange from "@material-ui/icons/DateRange";
import LocalOffer from "@material-ui/icons/LocalOffer";
import Update from "@material-ui/icons/Update";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
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

import Transactions from "views/Transactions/Transactions.js";
import FundsFlow from "views/FundsFlow/FundsFlow.js";
import TableList from "views/TableList/TableList.js";

import { bugs, website, server } from "variables/general.js";

import {
  dailySalesChart,
  emailsSubscriptionChart,
  completedTasksChart,
} from "variables/charts.js";

import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import "../../assets/css/react-date_picker.css";

const useStyles = makeStyles(styles);

export default function Dashboard() {
  const classes = useStyles();

  const [total_transaction, setTransactions] = useState([])
  const [total_volume, setVolume] = useState([])


  React.useEffect(() => {
    var url = "http://localhost:8000/api/total_transactions"
    axios.get(url).then((response) => {
      setTransactions(response.data);
    });
  }, []);


  React.useEffect(() => {
    var url = "http://localhost:8000/api/total_volume"
    axios.get(url).then((response) => {
      var total = response.data.total_volume
      //remove trailing zeroes
      var repl = total.replace(/^0+(\d)|(\d)0+$/gm, '$1$2');

      setVolume(repl);
    });
  }, []);

   // define check-in and check-out state
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);

  // define handler change function on check-in date
  const handleCheckInDate = (date) => {
    setCheckInDate(date);
    setCheckOutDate(null);
  };

  // define handler change function on check-out date
  const handleCheckOutDate = (date) => {
    setCheckOutDate(date);
  };

  
  return (
    <div>
      <div class="header">
        <h2 >Algorand Dashboard</h2>
      </div>
      {/* <GridContainer>
        <GridItem xs={12} sm={3} md={3}> */}
      <div className="input-container">
        <div>

         <div className="data-reactpicker-styling">
         {checkInDate && checkOutDate && (
          <div className={classes.summary}>
            <div >
               <h7>
                Data from {moment(checkInDate).format("LL")} to{" "}
                  {moment(checkOutDate).format("LL")}.
              </h7>
              </div>
              </div>
            )}
          </div>
        </div>
        
          <div>
            <label>From</label>
           <DatePicker 
            selected={checkInDate}
            minDate={new Date()}
            onChange={handleCheckInDate}
             />
        </div>
        <div>
         <label>To</label>
         <DatePicker 
           selected={checkOutDate}
           minDate={checkInDate}
            onChange={handleCheckOutDate}
          />
        </div>
        </div>
      {/* </GridContainer> */}
      <GridContainer>
        <GridItem xs={12} sm={3} md={3}>
            <GridContainer>
            <GridItem xs={12}>
               <Card>
            <CardHeader color="warning" stats icon>
              <CardIcon color="warning">
                <Icon>content_copy</Icon>
              </CardIcon>
              <p className={classes.cardCategory}>Total Number Transactions</p>
              <h3 className={classes.cardTitle}> {total_transaction.total_transactions}
                {/* <small>GB</small> */}
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
            <GridItem xs={12}>
                <Card>
            <CardHeader color="success" stats icon>
              <CardIcon color="success">
                <Store />
              </CardIcon>
              <p className={classes.cardCategory}>Average Transaction Size</p>
              <h3 className={classes.cardTitle}>R34,24</h3>
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
        <GridItem xs={12} sm={3} md={3}>
          <GridContainer>
            <GridItem xs={12}>
               <Card>
            <CardHeader color="success" stats icon>
              <CardIcon color="success">
                <Store />
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
            <GridItem xs={12}>
               <Card>
            <CardHeader color="success" stats icon>
              <CardIcon color="success">
                <Store />
              </CardIcon>
              <p className={classes.cardCategory}>Average Loan Size</p>
              <h3 className={classes.cardTitle}>R34,245</h3>
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
        <GridItem xs={12} sm={3} md={5}>
         <TableList/>
        </GridItem>
       
      </GridContainer>
      <Divider style={{
    borderBottomWidth: "3px",
    marginBottom: "20px",
    marginTop: "20px"}} />
      <GridContainer>
        <GridItem xs={12} sm={12} md={8}>
          <FundsFlow />
        </GridItem>
        <GridItem xs={5} sm={12} md={4}>
          <Card chart>
            <CardHeader color="success">
              <ChartistGraph
                className="ct-chart"
                data={dailySalesChart.data}
                type="Line"
                options={dailySalesChart.options}
                listener={dailySalesChart.animation}
              />
            </CardHeader>
            <CardBody>
              <h4 className={classes.cardTitle}>Volume of funds in each account type</h4>
              <p className={classes.cardCategory}>
                <span className={classes.successText}>
                  <ArrowUpward className={classes.upArrowCardCategory} /> 55%
                </span>{" "}
                increase in funds in banks.
              </p>
            </CardBody>
            <CardFooter chart>
                <div className={classes.stats}>
                <Update />
                Just Updated
              </div>
            </CardFooter>
          </Card>
        </GridItem>
      </GridContainer>
         <Divider style={{
    borderBottomWidth: "3px",
    marginBottom: "20px",
    marginTop: "20px"}} />
        <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Transactions />
        </GridItem>
      </GridContainer>
    </div>
  );
}
