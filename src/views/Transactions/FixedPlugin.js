/*eslint-disable*/
import React, { Component } from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// nodejs library that concatenates classes
import classnames from "classnames";

import Button from "components/CustomButtons/Button.js";

export default function FixedPlugin(props) {
  const [classes, setClasses] = React.useState("dropdown show");
  const [bg_checked, setBg_checked] = React.useState(true);
  const [bgImage, setBgImage] = React.useState(props.bgImage);
  const handleClick = () => {
    props.handleFixedClick();
  };
  return (
    <div
      className={classnames("fixed-plugin", {
        "rtl-fixed-plugin": props.rtlActive,
      })}
    >
      <div id="fixedPluginClasses" className={props.fixedClasses}>
        <div onClick={handleClick}>
          <i className="fa fa-cog fa-2x" />
        </div>
        <ul className="dropdown-menu">
          <li className="header-title">GROUP BY</li>
          <li className="button-container">
            <div className="button-container">
              <Button
                color="banks"
                target="_blank"
                fullWidth
                onClick={() => {
                  props.handleGroupClick("banks");
                }}
              >
                Banks
              </Button>
            </div>
          </li>
          <li className="button-container">
            <div className="button-container">
              <Button
                color="central_bank"
                target="_blank"
                fullWidth
                onClick={() => {
                  props.handleGroupClick("central bank");
                }}
              >
                Central Bank
              </Button>
            </div>
          </li>
          <li className="button-container">
            <Button
              color="firms"
              fullWidth
              target="_blank"
              onClick={() => {
                props.handleGroupClick("firms");
              }}
            >
              Firms
            </Button>
          </li>
          <li className="button-container">
            <Button
              color="households"
              fullWidth
              target="_blank"
              onClick={() => {
                props.handleGroupClick("households");
              }}
            >
              Households
            </Button>
          </li>
          <li className="button-container">
            <Button
              color="lsps"
              fullWidth
              target="_blank"
              onClick={() => {
                props.handleGroupClick("lsps");
              }}
            >
              License Service Providers
            </Button>
          </li>
          <li className="adjustments-line" />
        </ul>
      </div>
    </div>
  );
}

FixedPlugin.propTypes = {
  bgImage: PropTypes.string,
  handleFixedClick: PropTypes.func,
  rtlActive: PropTypes.bool,
  fixedClasses: PropTypes.string,
  bgColor: PropTypes.oneOf(["purple", "blue", "green", "orange", "red"]),
  handleColorClick: PropTypes.func,
  handleImageClick: PropTypes.func,
};
