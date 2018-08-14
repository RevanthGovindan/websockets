import React, { Component } from 'react';
import './App.css';
import Total from './Total.js';
class App extends Component {
  constructor() {
    super();
    this.state = { status: 'subscribed', totalPorL: 0, totalprice: 0, stock: "SBI", price: '', quantity: '', data: [], list: [], PorLcolor: 'green' };
  }
  subscription() {
    const res = this.state.status === 'subscribed' ? 'unsubscribed' : 'subscribed';
    this.setState({ status: res })
  }
  updateList() {
    if (this.state.status !== 'unsubscribed') {
      let list = this.state.list;
      let data = this.state.data;
      let totalPrice = 0;
      const arrNew = [];
      this.setState({ totalPorL: Number(0) })
      for (var i = 0; i < list.length; i++) {
        for (var j = 0; j < data.length; j++) {
          if (list[i].stock === data[j].stock) {
            var calcProandLoss;
            var colour = 'green';
            if (list[i].average < data[j].price) {
              calcProandLoss = this.funcPro(list[i].average, data[j].price);
            } else {
              colour = 'red';
              calcProandLoss = this.funcLoss(list[i].average, data[j].price)
            }
            totalPrice = totalPrice + data[j].price;
            const temp = { stock: list[i].stock, price: data[j].price, quantity: list[i].quantity, average: list[i].average, profitorloss: calcProandLoss, color: colour };
            arrNew.push(temp);
            break;
          }
        }
      }
      this.setState({ list: arrNew, totalprice: totalPrice });
      this.totalProAndLossCalc();
    }
  }
  funcPro(avg, price) {
    let sum = price - avg;
    return sum;
  }
  funcLoss(avg, price) {
    let sub = avg - price;
    return sub;
  }
  totalProAndLossCalc() {
    var totalProandLoss = 0;
    var color;
    for (var i = 0; i < this.state.list.length; i++) {
      if (this.state.list[i].color === 'green') {
        totalProandLoss += this.state.list[i].profitorloss;
      }
      else {
        totalProandLoss -= this.state.list[i].profitorloss;
      }
    }
    if (totalProandLoss >= 0) {
      color = 'green';
    } else {
      color = 'red';
      totalProandLoss = Math.abs(totalProandLoss);
    }
    this.setState({ totalPorL: totalProandLoss, PorLcolor: color });
  }
  formSubmit(e) {
    const Arr = this.state.list;
    const data = this.state.data;
    var stock, quantity, price, flag = false;
    stock = this.state.stock;
    quantity = Number(this.state.quantity);
    price = Number(this.state.price);
    for (var i = 0; i < Arr.length; i++) {
      if (stock === Arr[i].stock) {
        flag = true;
        break;
      }
    }
    if (flag === true) {
      const newQuantity = (Arr[i].quantity + quantity);
      const newAverage = Math.floor(((Arr[i].average * Arr[i].quantity) + (quantity * price)) / newQuantity);
      Arr[i].quantity = newQuantity;
      Arr[i].average = newAverage;
    } else {
      for (let j = 0; j < data.length; j++) {
        if (stock === data[j].stock) {
          var color = 'green';
          var profitorloss;
          if (price < data[j].price) {
            profitorloss = data[j].price - price;
          } else {
            color = 'red';
            profitorloss = price - data[j].price;
          }
          const temp = { stock: stock, quantity: quantity, average: price, price: data[j].price, profitorloss: profitorloss, color: color };
          Arr.push(temp);
          break;
        }
      }
    }
   
    this.setState({ list: Arr, price: '', quantity: '' });
    this.totalProAndLossCalc();
    e.preventDefault();
  }
  socket() {
    var ws = new WebSocket('ws://localhost:8000');
    ws.onopen = function () {
      console.log('websocket is connected ...')
    }
    ws.onmessage = evt => {
      const list = JSON.parse(evt.data);
      this.setState({ data: list });
      this.updateList();
    }
  }
  componentDidMount() {
    this.socket();
  }
  handleChange(e) {
    const data = e.target.value;
    if (e.target.name === "stock") {
      this.setState({ stock: data });
    } else if (e.target.name === "quantity") {
      this.setState({ quantity: data });
    } else if (e.target.name === "price") {
      this.setState({ price: data });
    }
  }
  removeStock(index){
    const list = this.state.list;
    list.splice(index,1);
    this.setState({list:list});    
  }
  render() {
    return (
      <div className="App">
        <div className="box">
          <div className="d-block p-2 header">
            <span className="headings">> Stock Portfolio</span>
            <span className="button">
              <button className="sub btn btn-primary" onClick={this.subscription.bind(this)}>{this.state.status}</button>
              <button type="button" className="btn btn-danger" data-toggle="modal" data-target="#exampleModalCenter">
                Add Stock
            </button></span>
          </div>
          <div className="container content">
            <div className="table-responsive" >
              <table className="table">
                <thead>
                  <tr>
                    <th>Stock Name</th>
                    <th>Quantity</th>
                    <th>Average</th>
                    <th>Price</th>
                    <th>Profitandloss</th>
                    <th></th>
                  </tr>
                </thead>
                {
                  this.state.list.map((item, index) => <tbody key={index}>
                    <tr  className={item.color} id="rowDesign">
                      <td>{item.stock}</td>
                      <td>{item.quantity}</td>
                      <td>{item.average}</td>
                      <td>{item.price}</td>
                      <td>{item.profitorloss}</td>
                      <td><button className="close closeicn" onClick={this.removeStock.bind(this,index)} aria-label="Close"><span aria-hidden="true">&times;</span></button></td>
                    </tr>
                  </tbody>
                  )
                }
              </table>
            </div>
          </div>
         <Total totalprice={this.state.totalprice} totalPorL={this.state.totalPorL} PorLcolor={this.state.PorLcolor}/>

        </div>
        <div className="modal fade" id="exampleModalCenter" tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLongTitle">Add Stock</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={this.formSubmit.bind(this)}>
                  <table>
                    <tbody>
                      <tr>
                        <td>Select Stock:</td><td><select value={this.state.stock} onChange={this.handleChange.bind(this)} name="stock">
                          <option value="SBI">SBI</option>
                          <option value="Infosys">Infosys</option>
                          <option value="Kotak">Kotak</option>
                          <option value="Reliance">Reliance</option>
                        </select></td>
                      </tr>
                      <tr>
                        <td>Quantity:</td>
                        <td><input type="text" value={this.state.quantity} onChange={this.handleChange.bind(this)} name="quantity" /></td>
                      </tr>
                      <tr>
                        <td>Price:</td>
                        <td><input type="text" value={this.state.price} onChange={this.handleChange.bind(this)} name="price" /></td>
                      </tr>
                    </tbody>
                  </table>
                  <input className="btn btn-danger" type="submit" value="Add" />
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;