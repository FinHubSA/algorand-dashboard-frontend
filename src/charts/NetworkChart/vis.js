import * as d3 from 'd3';
import {event as d3_event} from 'd3-selection';
import _ from 'lodash';

const draw = (props, data) => {

  var chart_data = _.cloneDeep(data);
    
  var simulation, nodes = [], links = [], svg, ticked, groups = {}
  var linkWidthScale = d3.scaleLinear().range([1, 5]);
  var linkStrengthScale = d3.scaleLinear().range([0, 1]);

  var margin = { top: 0, right: 0, bottom: 0, left: 0 }
  const width = props.width - margin.left - margin.right;
  const height = props.height - margin.top - margin.bottom;

  initialize_chart();
  prepare_data();
  initialize_simulation();
  start_simulation();

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
          group_data(group_by_account_type, d)
        })
  }

  /**
   * Takes the transactions and creates the nodes and links
   */
  function prepare_data () {
    nodes = []
    links = []

    var txn_nodes = []

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
        nodes.push({"id":node.id,"account_type":node.account_type})
      })
      .entries(txn_nodes);
    
    var nodes_keys = d3.nest()
      .key(function (d) { return d.id; })
      .map(nodes).keys()

    // Each transaction will be a link.
    // Every source and target will have one link with sum of transactions between them
    
    //aggregate all transactions between same addresses
    var sender_receiver = {}
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
    });

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

    // Replace transactions sender/receiver with grouped node
    chart_data.forEach(function (txn) {
      const orignial_txn = _.cloneDeep(txn);
      if (criteria(txn, param_1)[0]){
        txn.sender = group_id
      }

      if (criteria(txn, param_1)[1]){
        txn.receiver = group_id
      }

      // so that it can return to former state
      group_txns[txn.id] = orignial_txn;
    });
    
    groups[group_id] = group_txns;

    console.log("group "+group_id)
    console.log(chart_data)

    initialize_chart();
    prepare_data();
    initialize_simulation();
    start_simulation();
  }

  function ungroup_data(group_id) {
    chart_data.forEach(function (txn) {
      if (txn.sender === group_id || txn.receiver === group_id){
        var og_txn = groups[group_id][txn.id]
        
        txn.sender = og_txn.sender
        txn.receiver = og_txn.receiver
      }
    });

    //console.log("ungroup "+group_id)
    //console.log(chart_data)

    initialize_chart();
    prepare_data();
    initialize_simulation();
    start_simulation();
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
      .attr('class', d => {return 'node ' + d.account_type.split(' ').join('_').toLowerCase()})
      .call(d3.drag()
          .on('start', dragStart)
          .on('drag', drag)
          .on('end', dragEnd)
      )
      .on('mouseover',d => {
        //group_data(group_by_account_type);
        /*tooltip.html(d.country)
          .style('left', d3_event.pageX + 5 +'px')
          .style('top', d3_event.pageY + 5 + 'px')
          .style('opacity', .9);*/
      })
      .on('mouseout', () => {
        /*tooltip.style('opacity', 0)
          .style('left', '0px')
          .style('top', '0px');*/
      })
      .on('click', d => {
        if (d.id in groups){
          ungroup_data(d.id);
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