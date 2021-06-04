import React from 'react';
import AppViews from './views/AppViews';
import ValidatorViews from './views/ValidatorViews';
import MemberViews from './views/MemberViews';
import {renderDOM, renderView} from './views/render';
import './index.css';
import * as backend from './build/index.main.mjs';
import * as reach from '@reach-sh/stdlib/ETH';
//Imports standard library, views, and stylesheet
//Also imports the backend

const vote_array = {'No': 0, 'Yes': 1};
const outcome_array = ['Alice does not get 5 Algo', 'Consensus Not Reached', 'Alice gets 5 Algo!'];
const {standardUnit} = reach;
const defaults = {defaultFundAmt: '30', defaultStake: '10', standardUnit};
//Declares the vote_array and assigns numerical numbers to each one of them.
//Also declares the outcome array and ensures that the addition leads to a result.

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {view: 'ConnectAccount', ...defaults};
  }
  async componentDidMount() {
    const acc = await reach.getDefaultAccount();
    const balAtomic = await reach.balanceOf(acc);
    const bal = reach.formatCurrency(balAtomic, 4);
    this.setState({acc, bal});
    try {
      const faucet = await reach.getFaucet();
      this.setState({view: 'FundAccount', faucet});
    } catch (e) {
      this.setState({view: 'ValidatorOrMember'});
    }
  }
  //Allows the user to fund their account before the voting process.
  //Gets the user' account
  async fundAccount(fundAmount) {
    await reach.transfer(this.state.faucet, this.state.acc, reach.parseCurrency(fundAmount));
    this.setState({view: 'ValidatorOrMember'});
  }
  async skipFundAccount() { this.setState({view: 'ValidatorOrMember'}); }
  selectMember() { this.setState({view: 'Wrapper', ContentView: Member}); }
  selectValidator() { this.setState({view: 'Wrapper', ContentView:Validator}); }
  render() { return renderView(this, AppViews); }
}

class Voter extends React.Component {
  random() { return reach.hasRandom.random(); }
  async getVote() { // Fun([], UInt)
    const vote = await new Promise(resolveVoteP => {
      this.setState({view: 'GetVote', workable: true, resolveVoteP});
    });
    this.setState({view: 'WaitingForResults', vote});
    return vote_array[vote];
  }
  seeResult(i) { this.setState({view: 'Done', result: outcome_array[i]}); }
  informTimeout() { this.setState({view: 'Timeout'}); }
  workVote(vote) { this.state.resolveVoteP(vote); }
}
//Sets the definiton for a vote and allows the vote to be read by the backend for caluclation.
// Allows the user to see the result as well through a view

class Validator extends Voter {
  constructor(props) {
    super(props);
    this.state = {view: 'SetStake'};
  }
  setStake(stake) { this.setState({view: 'Validator', stake}); }
  async validate() {
    const ctc = this.props.acc.deploy(backend);
    this.setState({view: 'Validating', ctc});
    this.stake = reach.parseCurrency(this.state.stake); // UInt
    backend.Alice(ctc, this);
    const ctcInfoStr = JSON.stringify(await ctc.getInfo(), null, 2);
    this.setState({view: 'WaitingForMember', ctcInfoStr});
  }
  render() { return renderView(this,ValidatorViews); }
}
//Defines the Validator class, who can set a stake/ticket price for their assigned voter.
class Member extends Voter {
  constructor(props) {
    super(props);
    this.state = {view: 'Secure'};
  }
  attach(ctcInfoStr) {
    const ctc = this.props.acc.attach(backend, JSON.parse(ctcInfoStr));
    this.setState({view: 'Securing'});
    backend.Bob(ctc, this);
  }
  async acceptStake(stakeAtomic) { // Fun([UInt], Null)
    const stake = reach.formatCurrency(stakeAtomic, 4);
    return await new Promise(resolveAcceptedP => {
      this.setState({view: 'AcceptStake', stake, resolveAcceptedP});
    });
  }
  //Defines the Member class, who is assigned a validator and can accept the stake.
  termsAccepted() {
    this.state.resolveAcceptedP();
    this.setState({view: 'WaitingForTurn'});
  }
  render() { return renderView(this, MemberViews); }
}

renderDOM(<App />);
