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

import Statistics from "views/Statistics/Statistics.js";
import FundsFlow from "views/FundsFlow/FundsFlow.js";
import Transactions from "views/Transactions/Transactions.js";
import TableList from "views/TableList/TableList.js";

import { bugs, website, server } from "variables/general.js";

import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import "../../assets/css/react-date_picker.css";

const useStyles = makeStyles(styles);

export default function Dashboard() {
  const classes = useStyles();

  const [total_transaction, setTransactions] = useState([])
  const [total_volume, setVolume] = useState([])


  // React.useEffect(() => {
  //   var url = "/api/total_transactions"
  //   axios.get(url).then((response) => {
  //     setTransactions(response.data);
  //   });
  // }, []);
   React.useEffect(() => {
     getTransactions();
     getVolume();
    }, []);


    //api calls
   const getTransactions = () => {
     var url = "/api/total_transactions"
     axios.get(url).then((response) => {
       setTransactions(response.data);
     });
   }
  const getVolume = () => {
    var url = "/api/total_volume"
    axios.get(url).then((response) => {
      var total = response.data.total_volume
      //remove trailing zeroes
      var repl = total.replace(/^0+(\d)|(\d)0+$/gm, '$1$2');
      setVolume(repl);
     });
  }

   // define start date and end date state
  const [data_startdate_1, setCheckInDate] = useState(null);
  const [data_enddate_1, setCheckOutDate] = useState(null);
   const [data_startdate_2, setCheckInDate_2] = useState(null);
  const [data_enddate_2, setCheckOutDate_2] = useState(null);
   const [data_startdate_3, setCheckInDate_3] = useState(null);
  const [data_enddate_3, setCheckOutDate_3] = useState(null);

  // define handler change function on start date
  const handleCheckInDate = (date) => {
    setCheckInDate(date);
    setCheckOutDate(null);
  };
    const handleCheckInDate_2 = (date) => {
    setCheckInDate_2(date);
    setCheckOutDate_2(null);
    };
    const handleCheckInDate_3 = (date) => {
    setCheckInDate_3(date);
    setCheckOutDate_3(null);
  };

  // define handler change function on start date
  const handleCheckOutDate = (date) => {
    //console.log(typeof(data_startdate_1));
    console.log(typeof(date));
    //console.log(date_2.target.value);
    //const valueOfInput = date_1.format();
    //const valueOfInput_2 = date_2.format();
    //getTransactions()
    //getVolume()
    setCheckOutDate(date);
  };
  const handleCheckOutDate_2 = (date) => {
     console.log(date)
    setCheckOutDate_2(date);
   };
   const handleCheckOutDate_3 = (date) => {
    setCheckOutDate_3(date);
  };

  
  return (
    <div>
      <div class="banner" >
        <div class="banner-content">
<h2 class="banner-header"> Algorand Analysis Dashboard</h2>
<h7 class ="banner-sub">Welcome to the Algorand blockchain analysis dashboard, developed by the Algorand-UCT Financial Innovation Hub.</h7>
</div>
      </div>
       <Divider 
        style={{
          borderBottomWidth: "3px",
          marginBottom: "5px",
          marginTop: "20px"
        }} 
      />
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Statistics />
        </GridItem>
      </GridContainer>
      <Divider 
        style={{
          borderBottomWidth: "3px",
          marginBottom: "20px",
          marginTop: "20px"
        }} 
      />
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <FundsFlow />
        </GridItem>
      </GridContainer>
        <Divider 
          style={{
            borderBottomWidth: "3px",
            marginBottom: "20px",
            marginTop: "20px"
          }} 
        />
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Transactions />
        </GridItem>
      </GridContainer>
    </div>
  );
}
