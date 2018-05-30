/*
 * @flow
 */

import React from 'react';
import DateTimePicker from 'react-datetime';
import moment from 'moment';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import StyledButton from '../../components/buttons/StyledButton';
import * as DownloadActionFactory from './DownloadActionFactory';
import * as Routes from '../../core/router/Routes';
import {
  CloseX,
  StyledFormViewWrapper,
  StyledFormWrapper,
  StyledSectionWrapper,
  StyledTitleWrapper,
  StyledTopFormNavBuffer
} from '../../utils/Layout';
import { SUMMARY_REPORT } from '../../utils/consts/ReportDownloadTypes';

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

const DownloadButton = styled(StyledButton)`
  margin: 0 6px;
`;

const Error = styled.div`
  width: 100%;
  text-align: center;
  font-size: 16px;
  color: firebrick;
  margin-top: 15px;
`;

type Props = {
  actions :{
    downloadPsaForms :(value :{
      startDate :string,
      endDate :string,
      filters? :Object
    }) => void
  },
  history :string[]
};

type State = {
  startDate :?string,
  endDate :?string
};

class DownloadPSA extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      startDate: undefined,
      endDate: undefined
    };
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
            <DateTimePicker
                value={startDate}
                onChange={(date) => {
                  this.setState({ startDate: date });
                }} />
          </DatePickerGroupContainer>
          <DatePickerGroupContainer>
            <div>End Date:</div>
            <DateTimePicker
                value={endDate}
                onChange={(date) => {
                  this.setState({ endDate: date });
                }} />
          </DatePickerGroupContainer>
        </DateRangeContainer>
      </div>
    );
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
        errorText = 'The selected start date cannot be later than today.';
      }
      else if (end.isBefore(start)) {
        errorText = 'The selected end date must be after the selected start date.';
      }
    }
    return errorText;
  }

  renderError = () => <Error>{this.getErrorText()}</Error>

  download = (filters) => {
    const { startDate, endDate } = this.state;
    if (startDate && endDate) {
      this.props.actions.downloadPsaForms({ startDate, endDate, filters });
    }
  }

  renderDownload = () => {
    const { startDate, endDate } = this.state;
    if (!startDate || !endDate || this.getErrorText()) return null;
    return (
      <div>
        <DownloadButton onClick={() => this.download()}>Download All PSA Data</DownloadButton>
        <DownloadButton onClick={() => this.download(SUMMARY_REPORT)}>Download Summary Report</DownloadButton>
      </div>
    );
  }

  render() {
    return (
      <StyledFormViewWrapper>
        <StyledFormWrapper>
          <StyledTitleWrapper>
            <div>Download PSA Forms</div>
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
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(null, mapDispatchToProps)(DownloadPSA);
