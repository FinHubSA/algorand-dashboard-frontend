import React, { Component } from 'react';
import ScriptTag from 'react-script-tag';
import draw from './vis';

export default class NetworkChart extends Component {

    constructor(props) {
        super(props);
     
        this.state = {
            data: [
                {
                    "id":"T1",
                    "amount":5000000,
                    "sender":"HH1",
                    "receiver": "B1",
                    "sender_type":"Households",
                    "receiver_type":"Banks",
                    "instrument_type":"Deposits"
                },
                {
                    "id":"T2",
                    "amount":6000000,
                    "sender":"HH2",
                    "receiver": "B1",
                    "sender_type":"Households",
                    "receiver_type":"Banks",
                    "instrument_type":"Deposits"
                },
                {
                    "id":"T3",
                    "amount":500000,
                    "sender":"B1",
                    "receiver": "HH2",
                    "sender_type":"Banks",
                    "receiver_type":"Households",
                    "instrument_type":"Loans and Bonds"
                },
                {
                    "id":"T4",
                    "amount":5000,
                    "sender":"HH1",
                    "receiver": "F1",
                    "sender_type":"Households",
                    "receiver_type":"Firms",
                    "instrument_type":"Bank Notes"
                },
                {
                    "id":"T5",
                    "amount":6500,
                    "sender":"HH2",
                    "receiver": "F1",
                    "sender_type":"Households",
                    "receiver_type":"Firms",
                    "instrument_type":"Bank Notes"
                },
                {
                    "id":"T6",
                    "amount":7200,
                    "sender":"HH2",
                    "receiver": "F1",
                    "sender_type":"Households",
                    "receiver_type":"Firms",
                    "instrument_type":"Bank Notes"
                },
                {
                    "id":"T7",
                    "amount":50000,
                    "sender":"HH2",
                    "receiver": "F1",
                    "sender_type":"Households",
                    "receiver_type":"Firms",
                    "instrument_type":"Bank Notes"
                },
                {
                    "id":"T8",
                    "amount":1000000,
                    "sender":"B1",
                    "receiver": "CB",
                    "sender_type":"Banks",
                    "receiver_type":"Central Bank",
                    "instrument_type":"Reserves"
                },
                {
                    "id":"T9",
                    "amount":1000000,
                    "sender":"B1",
                    "receiver": "F1",
                    "sender_type":"Banks",
                    "receiver_type":"Firms",
                    "instrument_type":"Loans and Bonds"
                },
                {
                    "id":"T10",
                    "amount":500000,
                    "sender":"HH1",
                    "receiver": "HH2",
                    "sender_type":"Households",
                    "receiver_type":"Households",
                    "instrument_type":"Bank Notes"
                }
            ]
        }
    }

    componentDidMount() {
        draw(this.props, this.state.data);
    }

    componentDidUpdate(preProps) {
        draw(this.props, this.state.data);
    }

    render() {
        return ([
            <div class="container">
                <div className='vis-networkchart'></div>
            </div>
        ])
    }
}
