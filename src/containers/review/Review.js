import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import DatePicker from 'react-bootstrap-date-picker';
import moment from 'moment';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import StyledButton from '../../components/buttons/StyledButton';
import * as DownloadActionFactory from './DownloadActionFactory';
import * as Routes from '../../core/router/Routes';

const StyledFormViewWrapper = styled.div`
  display: flex;
  width: 100%;
`;

const StyledFormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 55px auto;
  width: 1300px;
`;

const StyledTitleWrapper = styled.div`
  align-items: center;
  color: #37454a;
  display: flex;
  font-size: 32px;
  justify-content: space-between;
  margin-bottom: 30px;
  width: 100%;
`;

const StyledSectionWrapper = styled.div`
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 55px;
  width: 100%;
`;

const CloseX = styled(FontAwesome)`
  cursor: pointer;
`;

const StyledTopFormNavBuffer = styled.div`
  height: 55px;
`;

const DatePickerTitle = styled.div`
  font-size: 16px;
  margin: 15px 0;
  text-align: center;
`;

const DateRangeContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const DatePickerGroupContainer = styled.div`
  max-width: 300px;
  margin: 10px;
`;

const Error = styled.div`
  width: 100%;
  text-align: center;
  font-size: 16px;
  color: firebrick;
  margin-top: 15px;
`;


class Review extends React.Component {

  static propTypes = {
    actions: PropTypes.shape({
      downloadRequest: PropTypes.func.isRequired
    })
  }

  constructor(props) {
    super(props);
    this.state = {
      startDate: undefined,
      endDate: undefined
    }
  }

  handleClose = () => {
    this.setState({
      startDate: undefined,
      endDate: undefined
    });
    this.props.history.push(Routes.DASHBOARD);
  }

  renderDateRangePicker = () => {
    const { startDate, endDate } = this.state;

    return (
      <div>
        <DatePickerTitle>Choose a date range.</DatePickerTitle>
        <DateRangeContainer>
          <DatePickerGroupContainer>
            <div>Start Date:</div>
            <DatePicker
              value={startDate}
              onChange={(date) => {
                this.setState({ startDate: date });
              }} />
          </DatePickerGroupContainer>
          <DatePickerGroupContainer>
            <div>End Date:</div>
            <DatePicker
              value={endDate}
              onChange={(date) => {
                this.setState({ endDate: date });
              }} />
          </DatePickerGroupContainer>
        </DateRangeContainer>
      </div>
    )
  }

  getErrorText = () => {
    const { startDate, endDate } = this.state;
    let errorText;

    if (startDate && endDate) {

      const start = moment(startDate);
      const end = moment(endDate);
      const today = moment();

      if (!start.isValid() || !end.isValid()) {
        errorText = 'At least one of the selected dates is invalid.';
      }
      else if (start.isAfter(today)) {
        errorText = 'The selected start date cannot be later than today.'
      }
      else if (end.isBefore(start)) {
        errorText = 'The selected end date must be after the selected start date.';
      }
    }
    return errorText
  }

  renderError = () => {
    return <Error>{this.getErrorText()}</Error>;
  }

  download = () => {
    this.props.actions.downloadRequest(this.state.startDate, this.state.endDate);
  }

  renderDownload = () => {
    const { startDate, endDate } = this.state;
    if (!startDate || !endDate || this.getErrorText()) return null;
    return <StyledButton onClick={this.download}>Download PSAs in This Range</StyledButton>
  }

  render() {
    return (
      <StyledFormViewWrapper>
        <StyledFormWrapper>
          <StyledTitleWrapper>
            <div>Review PSA Forms</div>
            <CloseX name="close" onClick={this.handleClose} />
          </StyledTitleWrapper>
          <StyledSectionWrapper>
            {this.renderDateRangePicker()}
            {this.renderError()}
            {this.renderDownload()}
            <StyledTopFormNavBuffer />
          </StyledSectionWrapper>
        </StyledFormWrapper>
      </StyledFormViewWrapper>
    );
  }

}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(DownloadActionFactory).forEach((action :string) => {
    actions[action] = DownloadActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch),
    }
  };
}

export default connect(null, mapDispatchToProps)(Review);
