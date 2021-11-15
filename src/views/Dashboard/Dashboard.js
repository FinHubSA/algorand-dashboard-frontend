import React, { useState } from "react";
// @material-ui/core
import { makeStyles } from "@material-ui/core/styles";
// @material-ui/icons
import Divider from '@mui/material/Divider';

// import required css from library
import "react-datepicker/dist/react-datepicker.css";

// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";

import Statistics from "views/Statistics/Statistics.js";
import FundsFlow from "views/FundsFlow/FundsFlow.js";
import Transactions from "views/Transactions/Transactions.js";

import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import "../../assets/css/react-date_picker.css";

import algo_logo from "assets/img/algorand_full_logo_white.png";

const useStyles = makeStyles(styles);

export default function Dashboard() {
  const classes = useStyles();

  const [total_transaction, setTransactions] = useState([])
  const [total_volume, setVolume] = useState([])

  React.useEffect(() => {}, []);
  
  return (
    
    <div>
      <div class="banner" >
        <div class="banner-content container">
          <GridContainer>
            <GridItem item xs={7}>
              <h1 class="banner-header">CBDC Analytics Dashboard</h1>
              <p></p>
               <h7 class="banner-sub">Welcome to the Algorand CBDC blockchain analytics dashboard, developed by the Algorand-UCT Financial Innovation Hub.</h7>
            </GridItem>
            <GridItem item xs={5}>
             <img class="banner-logo" src={algo_logo}  height={100}></img>
            </GridItem>            
          </GridContainer>        
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
