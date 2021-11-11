import React from "react";
import DateFnsUtils from '@date-io/date-fns';
// @material-ui/core
import {MuiPickersUtilsProvider, DatePicker} from '@material-ui/pickers';
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import Button from "components/CustomButtons/Button.js";
import moment from "moment";


export default function DateRangePicker(props) {
  const [selectedFromDate, setSelectedFromDate] = React.useState(props.selectedFromDate);
  const [selectedToDate, setSelectedToDate] = React.useState(props.selectedToDate);

  const handleFromDateChange = (date) => {
      //console.log(date);
      setSelectedFromDate(date);
      props.handleFromDateChange(date);
  };
  
  const handleToDateChange = (date) => {
      //console.log(date);
      setSelectedToDate(date);
      props.handleToDateChange(date);
  };

  const handleGetRange = () => {
    props.handleGetRange();
  };

  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={6} >
         {selectedFromDate && selectedToDate && (
                <div style={{ paddingTop: '2rem' , paddingLeft: '1rem'}} >
               <h5>
                Data from <span className="date-text">{moment(selectedFromDate).format("LL")}</span> to{" "}
                 <span className="date-text"> {moment(selectedToDate).format("LL")}</span>.
              </h5>
              </div>
              
            )}
          </GridItem>
        <GridItem xs={12} sm={12} md={6}>
          <Card>
            <CardBody>
              <GridContainer>
                <GridItem xs={12} sm={12} md={4}>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <DatePicker
                      style={{margin:"10px"}}
                      label="From"
                      variant="inline"
                      inputVariant="outlined"
                      value={selectedFromDate}
                      format="MM/dd/yyyy"
                      onChange={handleFromDateChange}
                    />
                  </MuiPickersUtilsProvider>
                </GridItem>

                <GridItem xs={12} sm={12} md={4}>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <DatePicker
                      style={{margin:"10px"}}
                      label="To"
                      variant="inline"
                      inputVariant="outlined"
                      value={selectedToDate}
                      format="MM/dd/yyyy"
                      onChange={handleToDateChange}
                    />
                  </MuiPickersUtilsProvider>
                </GridItem>

                <GridItem xs={12} sm={12} md={4}>
                  <Button
                    style={{marginTop: "1rem"}}
                      color="primary"
                      className="section_3"
                      round
                      onClick={() => {
                        handleGetRange()
                      }}>
                      Get
                  </Button>
                </GridItem>
              </GridContainer>
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  );
}