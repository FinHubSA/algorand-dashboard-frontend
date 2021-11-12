/*eslint-disable*/
import React from "react";
import PropTypes from "prop-types";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
// core components
import styles from "assets/jss/material-dashboard-react/components/footerStyle.js";
import finhub_logo from "assets/img/finhub_logo_blue.png";

const useStyles = makeStyles(styles);

export default function Footer(props) {
  const classes = useStyles();
  return (
    <footer className={classes.footer}>
      <div className={classes.container}>
        <div className={classes.left}>
          <List className={classes.list}>
            <ListItem className={classes.inlineBlock}>
              <a href="#home" className={classes.block}>
                Contact
              </a>
              <img src={finhub_logo} height="40px" style={{paddingLeft: "15px"}}></img>
            </ListItem>  
          </List>
        </div>
        <p className={classes.right}>
          <span >
            &copy; {1900 + new Date().getYear()}{" "}
            <a
              href="https://www.finhub.org.za"
              target="_blank"
              className={classes.a}
              
            >
              Algorand-UCT Financial Innovation Hub
            </a>
            
          </span>
          
        </p>
      </div>
    </footer>
  );
}
