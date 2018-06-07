/*
 * @flow
 */

import React from 'react';
import moment from 'moment';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import StyledButton from '../../components/buttons/StyledButton';
import DateTimeRange from '../../components/datetime/DateTimeRange';
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
import { DOMAIN, SUMMARY_REPORT } from '../../utils/consts/ReportDownloadTypes';

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

  download = (filters, domain) => {
    const { startDate, endDate } = this.state;
    if (startDate && endDate) {
      this.props.actions.downloadPsaForms({
        startDate,
        endDate,
        filters,
        domain
      });
    }
  }

  renderDownload = () => {
    const { startDate, endDate } = this.state;
    if (!startDate || !endDate || this.getErrorText()) return null;
    return (
      <div>
        <DownloadButton onClick={() => this.download()}>Download All PSA Data</DownloadButton>
        <DownloadButton onClick={() => this.download(SUMMARY_REPORT, DOMAIN.MINNEHAHA)}>
          Download Minnehaha Summary Report
        </DownloadButton>
        <DownloadButton onClick={() => this.download(SUMMARY_REPORT, DOMAIN.PENNINGTON)}>
          Download Pennington Summary Report
        </DownloadButton>
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
            <DateTimeRange
                startDate={this.state.startDate}
                endDate={this.state.endDate}
                onStartChange={startDate => this.setState({ startDate })}
                onEndChange={endDate => this.setState({ endDate })} />
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
