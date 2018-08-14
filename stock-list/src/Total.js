import React, { Component } from 'react';

class TotalandProfit extends Component {

    render() {
        return (
            <div className="d-block p-2 footer">
                <span className="total">Total Price : <span className="totalvalue">{this.props.totalprice}</span></span>
                <div className="profit">Profit and Loss : <span className={this.props.PorLcolor}>{this.props.totalPorL}</span></div>
            </div>

        );
    }

};
export default TotalandProfit;