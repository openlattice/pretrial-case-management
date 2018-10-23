/*
 * @flow
 */

import React from 'react';
import moment from 'moment';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import BasicButton from '../../components/buttons/BasicButton';
import InfoButton from '../../components/buttons/InfoButton';
import DateTimeRange from '../../components/datetime/DateTimeRange';
import * as DownloadActionFactory from './DownloadActionFactory';
import * as Routes from '../../core/router/Routes';
import {
  StyledFormViewWrapper,
  StyledFormWrapper,
  StyledSectionWrapper,
  StyledTopFormNavBuffer
} from '../../utils/Layout';
import { DOMAIN, PSA_RESPONSE_TABLE, SUMMARY_REPORT } from '../../utils/consts/ReportDownloadTypes';

const HeaderSection = styled.div`
  padding: 10px 30px 30px 30px;
  font-family: 'Open Sans', sans-serif;
  font-size: 18px;
  color: #555e6f;
  border-bottom: 1px solid #e1e1eb;
  width: 100%
`;

const ButtonRow = styled.div`
  margin-top: 30px;
  text-align: center;
`;

const BasicDownloadButton = styled(BasicButton)`
  margin: 0 6px;
  padding: 10px;
`;

const InfoDownloadButton = styled(InfoButton)`
  margin: 0 6px;
  padding: 10px 46px;
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
    }) => void,
    downloadChargeLists :(value :{
      jurisdiction :string
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

  downloadCharges = (jurisdiction) => {
    this.props.actions.downloadChargeLists({
      jurisdiction
    });
  }

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
        <ButtonRow>
          <BasicDownloadButton onClick={() => this.download(PSA_RESPONSE_TABLE, DOMAIN.MINNEHAHA)}>
            Download Minnehaha PSA Response Table
          </BasicDownloadButton>
          <BasicDownloadButton onClick={() => this.download(SUMMARY_REPORT, DOMAIN.MINNEHAHA)}>
            Download Minnehaha Summary Report
          </BasicDownloadButton>
          <BasicDownloadButton onClick={() => this.download(SUMMARY_REPORT, DOMAIN.PENNINGTON)}>
            Download Pennington Summary Report
          </BasicDownloadButton>
        </ButtonRow>
        <ButtonRow>
          <InfoDownloadButton onClick={() => this.download()}>Download All PSA Data</InfoDownloadButton>
        </ButtonRow>
        <ButtonRow>
          <BasicDownloadButton onClick={() => this.downloadCharges(DOMAIN.PENNINGTON)}>
            Download Pennington Charges
          </BasicDownloadButton>
          <BasicDownloadButton onClick={() => this.downloadCharges(DOMAIN.MINNEHAHA)}>
            Download Minnehaha Charges
          </BasicDownloadButton>
        </ButtonRow>
      </div>
    );
  }

  render() {
    return (
      <StyledFormViewWrapper>
        <StyledFormWrapper>
          <StyledSectionWrapper>
            <HeaderSection>Download PSA Forms</HeaderSection>
            <DateTimeRange
                label="Set a date range to download."
                startDate={this.state.startDate}
                endDate={this.state.endDate}
                onStartChange={startDate => this.setState({ startDate })}
                onEndChange={endDate => this.setState({ endDate })}
                format24HourClock />
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
