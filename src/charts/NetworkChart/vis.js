import * as d3 from 'd3';
import {event as d3_event} from 'd3-selection';
import _ from 'lodash';

const draw = (props, data) => {

  var chart_data = _.cloneDeep(data);
    
  var simulation, nodes = [], links = [], svg, tooltip, ticked, groups = {}
  var linkWidthScale = d3.scaleLinear().range([1, 5]);
  var linkStrengthScale = d3.scaleLinear().range([0, 1]);

  var margin = { top: 0, right: 0, bottom: 0, left: 0 }
  const width = props.width - margin.left - margin.right;
  const height = props.height - margin.top - margin.bottom;

  refresh_data()
 
  function refresh_data(){
    initialize_chart();
    prepare_data();
    initialize_simulation();
    start_simulation();
  }

  function initialize_chart() {
    var colors = 
      d3.scaleOrdinal()
        .domain([	
            "Banks", 
            "Central Bank", 
            "Firms", 
            "Households", 
            "License Service Providers"
        ])
        .range([
            "#ff8c00", 
            "#40e0d0", 
            "#008000", 
            "#a52a2a", 
            "#4fc2be"
        ]);

    d3.select('.vis-networkchart').html("")

    svg = d3.select(".vis-networkchart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    tooltip = d3.select('.container')
     .append('div')
     .attr('class', 'node-tooltip')
     .html('Tooltip');

    var legend = svg.selectAll(".legend")
      .data(colors.domain())
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 30 + ")"; });
    
    var rects = legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", colors);
    
    var texts = legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; })
        .on("click", function(d){
          var grouped = group_data(group_by_account_type, d)
          if (grouped){
            refresh_data()
          }
        })
  }

  /**
   * Takes the transactions and creates the nodes and links
   */
  function prepare_data () {
    nodes = []
    links = []

    var txn_nodes = []
    // Each transaction will be a link.
    // Every source and target will have one link with sum of transactions between them
    
    //aggregate all transactions between same addresses
    var sender_receiver = {}
    var accounts_aggregates = {}
    chart_data.forEach(function (d) {
      if (d.sender in sender_receiver){
        var receivers = sender_receiver[d.sender]
        //If sender and receiver are already in just add them up
        if (d.receiver in receivers){
          receivers[d.receiver] = receivers[d.receiver] + d.amount
        }
        // Only sender is in so create new receiver for sender
        else{
          receivers[d.receiver] = d.amount
        }
      }
      // If receiver was a sender before then check if sender was a receiver and add those up
      else if (d.receiver in sender_receiver){
        var receivers = sender_receiver[d.receiver]
        if (d.sender in receivers){
          receivers[d.sender] = receivers[d.sender] + d.amount
        }
      }
      // else create new sender and receiver
      else{
        sender_receiver[d.sender] = {}
        sender_receiver[d.sender][d.receiver] = d.amount
      }

      // Now also put in account aggregates
      var total_payments = 0
      var total_receipts = 0
      if (d.sender in accounts_aggregates){
        total_payments = accounts_aggregates[d.sender].payments
      }else{
        accounts_aggregates[d.sender] = {payments: 0,receipts: 0}
      }

      if (d.receiver in accounts_aggregates){
        total_receipts = accounts_aggregates[d.receiver].receipts
      }else{
        accounts_aggregates[d.receiver] = {payments: 0,receipts: 0}
      }

      accounts_aggregates[d.sender].payments = total_payments + d.amount
      accounts_aggregates[d.receiver].receipts = total_receipts + d.amount
    });

    // Get all addresses which will be nodes
    // Start with senders then go to receivers
    d3.nest()
      .key(function(d) { return d.sender; })
      .rollup(function(values) 
      {
        var txn = values[0]
        txn_nodes.push({"id":txn.sender,"account_type":txn.sender_type})
      })
      .entries(chart_data);

    // Now get receivers
    d3.nest()
      .key(function(d) { return d.receiver; })
      .rollup(function(values) 
      { 
        var txn = values[0]
        txn_nodes.push({"id":txn.receiver,"account_type":txn.receiver_type})
      })
      .entries(chart_data);
    
    // Reduce to unique set of nodes
    d3.nest()
      .key(function(d) { return d.id; })
      .rollup(function(values) 
      {
        var node = values[0]
        nodes.push({
          "id":node.id,
          "account_type":node.account_type,
          "payments":accounts_aggregates[node.id].payments,
          "receipts":accounts_aggregates[node.id].receipts
        })
      })
      .entries(txn_nodes);
    
    var nodes_keys = d3.nest()
      .key(function (d) { return d.id; })
      .map(nodes).keys()


    for (var sender in sender_receiver) {
      var receivers = sender_receiver[sender];
      
      for (var receiver in receivers) {
        links.push(
        {
          "source":nodes_keys.indexOf(sender),
          "target":nodes_keys.indexOf(receiver),
          "value":receivers[receiver]
        })
      }
    }

    linkWidthScale.domain(d3.extent(links, function(d) {
      return d.value;
    }));

    linkStrengthScale.domain(d3.extent(links, function(d) {
      return d.value;
    }));
  }


  function group_data(criteria, param_1) {
    var group_id = "group_"+Object.keys(groups).length;
    var group_txns = {}
    var grouped_nodes = {}

    // Replace transactions sender/receiver with grouped node
    chart_data.forEach(function (txn) {
      const orignial_txn = _.cloneDeep(txn);
      if (criteria(txn, param_1)[0]){
        grouped_nodes[txn.sender] = 1
        txn.sender = group_id
      }

      if (criteria(txn, param_1)[1]){
        grouped_nodes[txn.receiver] = 1
        txn.receiver = group_id
      }

      // so that it can return to former state
      group_txns[txn.id] = orignial_txn;
    });
    
    groups[group_id] = group_txns;

    console.log("grouped**")
    console.log(grouped_nodes)
    // If we grouped one node we ungroup
    if (Object.keys(grouped_nodes).length <= 1){
      ungroup_data(group_id)
      return false
    }

    return true;
  }

  function ungroup_data(group_id) {
    if (!(group_id in groups)){
      return false;
    }

    chart_data.forEach(function (txn) {
      if (txn.sender === group_id || txn.receiver === group_id){
        var og_txn = groups[group_id][txn.id]
        
        txn.sender = og_txn.sender
        txn.receiver = og_txn.receiver
      }
    });

    delete groups[group_id];

    return true
  }

  /**
   * returns an array showing whether sender or receiver should be grouped
   * sender is result[0] and receiver result[1]
   * @param {*} txn 
   */
  function group_by_account_type(txn, param_1){
    var results = [false, false]
    if (txn.sender_type === param_1){
      results[0] = true;
    }

    if (txn.receiver_type === param_1){
      results[1] = true;
    }
    
    return results;
  }

  /**
   * Should be after the nodes and links have been prepared
   */
  function initialize_simulation() {
    
    //Initializing force simulation
    simulation = d3.forceSimulation()
      // pull nodes together based on the links between them
      .force(
        "link", 
        d3.forceLink()
      )
      // push nodes apart to space them out
      .force(
        "charge", 
        d3.forceManyBody()
          .strength(-5)
      )
      // add some collision detection so they don't overlap
      .force(
        "collide", 
        d3.forceCollide()
          .radius(30)
      )
      // and draw them around the centre of the space
      .force(
        "center", 
        d3.forceCenter(width / 2, height / 2)
      );

      //Drag functions
    var dragStart = d => {
      if (!d3_event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    };
    
    var drag = d => {
      d.fx = d3_event.x;
      d.fy = d3_event.y;
    };
    
    var dragEnd = d => {
      if (!d3_event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    //Creating links
    var link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links).enter()
      .append('line')
      .attr('stroke-width', function(d) {
        return linkWidthScale(d.value);
      })
      .on("mouseover", function(){})

    //Creating nodes
    var node = d3.select('.vis-networkchart')
      .selectAll('div')
      .data(nodes).enter()
      .append('div')
      .attr('class', d => {

        var acc_type =  d.account_type.split(' ').join('_').toLowerCase()
        var group = ""

        if (d.id in groups){
          group = "node-group"
        }

        return "node " + acc_type + " " + group;
      })
      .call(d3.drag()
          .on('start', dragStart)
          .on('drag', drag)
          .on('end', dragEnd)
      )
      .on('mouseover',d => {
        tooltip.html(
          "<p/>Account Name:"+ d.id + 
          "<p/>Payments:" + d.payments +
          "<p/>Receipts:"  + d.receipts)
          .style('left', d3_event.pageX + 5 +'px')
          .style('top', d3_event.pageY + 5 + 'px')
          .style('opacity', .9);
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0)
          .style('left', '0px')
          .style('top', '0px');
      })
      .on('click', d => {

        tooltip.style('opacity', 0)
          .style('left', '0px')
          .style('top', '0px');

        
        var ungrouped = ungroup_data(d.id);
        if (ungrouped) {
          refresh_data()
        }
      })

    //Setting location when ticked
    ticked = () => {
      link
        .attr("x1", d => { return d.source.x; })
        .attr("y1", d => { return d.source.y; })
        .attr("x2", d => { return d.target.x; })
        .attr("y2", d => { return d.target.y; });

    node
        .attr("style", d => { 
          return 'left: ' + d.x + 'px; top: ' + (d.y + 72) + 'px'; 
        });
    };

  }

  function start_simulation(){

    //Starting simulation
    simulation.nodes(nodes)
      .on('tick', ticked);
    
    simulation.force('link')
      .links(links);

    console.log("final***")
    console.log(links)
  }
}

export default draw;