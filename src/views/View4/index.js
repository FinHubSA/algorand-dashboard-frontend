import React, { Component } from 'react';
import '../../assets/css/views.css';
import NetworkChart from '../../charts/NetworkChart';
import { List } from 'antd';

export default class View4 extends Component {
    constructor(props) {
        super(props);
     
        this.state = {
            side_bar_data: [
                {'name': 'Central Bank'}
            ]
        }
    }

    render() {
        const {user} = this.props,
              width = 900,
              height = 530;
        return (
            <div id='view4' className='pane' >
                <div className='header'>Transactions</div>
                <div style={{display: 'table', height: '10%', overflowX: 'scroll',overflowY:'hidden' }}>
                    <div style={{float:'left'}}>
                        <NetworkChart width={width} height={height}/>
                    </div>
                    
                </div>
               
            </div>
        )
    }
}