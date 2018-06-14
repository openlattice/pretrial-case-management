/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import moment from 'moment';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ButtonToolbar, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  LineChart,
  Line,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import LoadingSpinner from '../../components/LoadingSpinner';
import { DOMAIN } from '../../utils/consts/ReportDownloadTypes';
import {
  CloseX,
  StyledFormViewWrapper,
  StyledFormWrapper,
  StyledSectionWrapper,
  StyledTitleWrapper,
  StyledTopFormNavBuffer
} from '../../utils/Layout';
import * as DashboardActionFactory from './DashboardActionFactory';

const SpinnerWrapper = styled.div`
  margin: 20px 0;
`;

const DomainContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const DomainText = styled.div`
  font-size: 14px;
  margin: -5px 0 5px 0;
`;

const DomainButton = styled(ToggleButton)`
  -webkit-appearance: none !important;
`;

const ChartRow = styled.div`
  display: flex;
  flex-direction: row;
`;

const ChartWrapper = styled.div`
  margin: 20px 15px;
  text-align: center;
`;

const ChartTitle = styled.div`
  display: inline-block;
  font-size: 16px;
  margin-bottom: 10px;
`;

const CHART_HEIGHT = 300;
const CHART_WIDTH = 600;

const CHARGE_COLORS = {
  Unknown: '#bbbbbb', // gray

  P: '#6F9DC6', // blue gray

  M2: '#72a329', // medium green
  M1: '#8fcc33', // more of a lime green

  F6: '#e99a9b', // light red
  F5: '#e78785',
  F4: '#e47170',
  F3: '#e1605b',
  F2: '#de4d47',
  F1: '#d82e20', // intense red

  FC: '#ba68c8', // light purple
  FB: '#ab47bc',
  FA: '#9c27b0' // intense purple
};

type Props = {
  actions :{
    loadDashboardData :() => void
  },
  dashboardData :Immutable.Map<*, *>,
  isLoading :boolean
}

type State = {
  domain :string
};

class DashboardContainer extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      domain: DOMAIN.PENNINGTON
    };
  }

  componentDidMount() {
    this.props.actions.loadDashboardData();
  }

  onDomainChange = (domain) => {
    this.setState({ domain });
  }

  getData = key => this.props.dashboardData.getIn([this.state.domain, key], Immutable.Map())

  renderLineChart = (data, label) => (
    <LineChart width={CHART_WIDTH} height={CHART_HEIGHT} data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <CartesianGrid strokeDasharray="3 3" />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey={label} stroke="#8884d8" activeDot={{ r: 8 }} />
    </LineChart>
  )

  renderBarChart = (key, label, optionalFill) => (
    <BarChart width={CHART_WIDTH} height={CHART_HEIGHT} data={this.formatNumberKeyData(key, label)}>
      <XAxis dataKey="name" />
      <YAxis />
      <CartesianGrid strokeDasharray="3 3" />
      <Tooltip />
      <Legend />
      <Bar dataKey={label} fill={optionalFill || '#8884d8'} />
    </BarChart>
  )

  renderPsasPerDayChart = () => {
    const label = 'Number of PSAs Created';
    const psasPerDay = this.getData('psasPerDay');
    const data = Object.keys(psasPerDay.toJS())
      .sort((d1, d2) => (moment(d1).isBefore(moment(d2)) ? -1 : 1))
      .map(dateStr => ({
        name: moment(dateStr).format('MM/DD/YYYY'),
        [label]: psasPerDay.get(dateStr)
      }));

    return this.renderLineChart(data, label);
  }

  formatNumberKeyData = (key, label) => {
    const dataMap = this.getData(key);
    return Object.keys(dataMap.toJS())
      .sort((num1, num2) => ((Number.parseInt(num1, 10) < Number.parseInt(num2, 10)) ? -1 : 1))
      .map(num => ({
        name: num,
        [label]: dataMap.get(num)
      }));
  }

  renderPendingChargesChart = () => this.renderBarChart('pendingChargeLength', 'Number of Pending Charges', '#00C49F')

  renderDaysToReoffenseChart = () => this.renderBarChart('daysToReoffense', 'Number of Reoffenses', '#FFBB28')

  renderReoffensePSAsChart = () => {
    const reoffensePsas = this.getData('reoffensePsaScores');
    const data = [];
    data.push(Object.assign({}, reoffensePsas.get('fta', Immutable.Map()).toJS(), { name: 'FTA' }));
    data.push(Object.assign({}, reoffensePsas.get('nca', Immutable.Map()).toJS(), { name: 'NCA' }));
    data.push({
      name: 'NVCA',
      yes: reoffensePsas.getIn(['nvca', '1']),
      no: reoffensePsas.getIn(['nvca', '0'])
    });

    return (
      <BarChart width={CHART_WIDTH} height={CHART_HEIGHT} data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend />
        <Bar dataKey="no" fill="#f8bbd0" />
        <Bar dataKey="yes" fill="#880e4f" />
        <Bar dataKey="1" fill="#f48fb1" />
        <Bar dataKey="2" fill="#f06292" />
        <Bar dataKey="3" fill="#ec407a" />
        <Bar dataKey="4" fill="#e91e63" />
        <Bar dataKey="5" fill="#d81b60" />
        <Bar dataKey="6" fill="#c2185b" />
      </BarChart>
    );
  }

  renderPsaChargeDegreesChart = () => {
    const chargeDegrees = this.getData('psaChargeDegrees');
    const data = Object.keys(CHARGE_COLORS).map((name) => {
      const key = name === 'Unknown' ? '' : name;
      const value = chargeDegrees.get(key);
      return { name, value };
    });
    return (
      <PieChart width={600} height={400}>
        <Pie isAnimationActive data={data} dataKey="value" cx={200} cy={200} outerRadius={80} fill="#8884d8" label>
          { data.map(entry => <Cell key={entry.name} fill={CHARGE_COLORS[entry.name]} />) }
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    );
  }

  renderViolentPsaChargesChart = () => {
    const violentCharges = this.getData('psaViolentCharges');
    const data = [
      {
        name: 'Nonviolent',
        value: violentCharges.get('false'),
        color: '#8da6c3'
      },
      {
        name: 'Violent',
        value: violentCharges.get('true'),
        color: '#3a536f'
      }
    ];

    return (
      <PieChart width={600} height={400}>
        <Pie isAnimationActive data={data} dataKey="value" cx={200} cy={200} outerRadius={80} fill="#8884d8" label>
          { data.map(entry => <Cell key={entry.name} fill={entry.color} />) }
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    );

  }

  renderContent = () => {
    if (this.props.isLoading) {
      return <SpinnerWrapper><LoadingSpinner /></SpinnerWrapper>;
    }

    const Chart = ({ title, render }) => (
      <ChartWrapper>
        <ChartTitle>{title}</ChartTitle>
        {render()}
      </ChartWrapper>
    );

    return (
      <div>
        <ChartRow>
          <Chart title="PSAs Created Per Day" render={this.renderPsasPerDayChart} />
          <Chart title="Length of Current Pending Charges (Days)" render={this.renderPendingChargesChart} />
        </ChartRow>
        <ChartRow>
          <Chart title="Days to Reoffense" render={this.renderDaysToReoffenseChart} />
          <Chart title="PSA Scores Which Led to Reoffense" render={this.renderReoffensePSAsChart} />
        </ChartRow>
        <ChartRow>
          <Chart title="PSA Charge Degrees" render={this.renderPsaChargeDegreesChart} />
          <Chart title="Violent PSA Charges" render={this.renderViolentPsaChargesChart} />
        </ChartRow>
      </div>
    );
  }

  renderDomainChoices = () => (
    <DomainContainer>
      <DomainText>County:</DomainText>
      <ButtonToolbar>
        <ToggleButtonGroup type="radio" name="domainPicker" value={this.state.domain} onChange={this.onDomainChange}>
          <DomainButton value={DOMAIN.PENNINGTON}>Pennington</DomainButton>
          <DomainButton value={DOMAIN.MINNEHAHA}>Minnehaha</DomainButton>
        </ToggleButtonGroup>
      </ButtonToolbar>
    </DomainContainer>
  )

  render() {
    return (
      <StyledFormViewWrapper>
        <StyledFormWrapper>
          <StyledTitleWrapper>
            <div>Dashboard</div>
            <CloseX name="close" onClick={this.handleClose} />
          </StyledTitleWrapper>
          <StyledSectionWrapper>
            {this.renderDomainChoices()}
            {this.renderContent()}
            <StyledTopFormNavBuffer />
          </StyledSectionWrapper>
        </StyledFormWrapper>
      </StyledFormViewWrapper>
    );
  }
}

function mapStateToProps(state) {
  const dashboard = state.get('dashboard');
  return {
    dashboardData: dashboard.get('dashboardData'),
    isLoading: dashboard.get('isLoading')
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(DashboardActionFactory).forEach((action :string) => {
    actions[action] = DashboardActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardContainer);
