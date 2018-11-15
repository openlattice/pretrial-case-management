/*
 * @flow
 */

import React from 'react';
import moment from 'moment';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import StyledCheckbox from '../../components/controls/StyledCheckbox';
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
import { OL } from '../../utils/consts/Colors';

const HeaderSection = styled.div`
  padding: 10px 30px 30px 30px;
  font-family: 'Open Sans', sans-serif;
  font-size: 18px;
  color: ${OL.GREY01};
  border-bottom: 1px solid ${OL.GREY11};
  width: 100%
`;
const SubHeaderSection = styled.div`
  padding-top: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  color: ${OL.GREY01};
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

const SelectionWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: flex-end;
  label {
    width: 25%;
    margin-bottom: 20px;
  }
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
    }) => void,
    downloadPSAsByHearingDate :(value :{
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
      endDate: undefined,
      byHearingDate: true,
      byPSADate: false
    };
  }

  handleClose = () => {
    const { history } = this.props;
    this.setState({
      startDate: undefined,
      endDate: undefined
    });
    history.push(Routes.DASHBOARD);
  }

  getErrorText = (downloads) => {
    const { startDate, endDate } = this.state;
    let errorText;

    if (startDate && endDate) {

      const start = moment(startDate);
      const end = moment(endDate);
      const today = moment();

      if (!start.isValid() || !end.isValid()) {
        errorText = 'At least one of the selected dates is invalid.';
      }
      else if (downloads === 'psas' && start.isAfter(today)) {
        errorText = 'The selected start date cannot be later than today.';
      }
      else if (end.isBefore(start)) {
        errorText = 'The selected end date must be after the selected start date.';
      }
    }
    return errorText;
  }

  renderError = type => <Error>{this.getErrorText(type)}</Error>

  downloadCharges = (jurisdiction) => {
    const { actions } = this.props;
    actions.downloadChargeLists({
      jurisdiction
    });
  }

  downloadbyPSADate = (filters, domain) => {
    const { startDate, endDate } = this.state;
    const { actions } = this.props;
    if (startDate && endDate) {
      actions.downloadPsaForms({
        startDate,
        endDate,
        filters,
        domain
      });
    }
  }

  downloadByHearingDate = (filters, domain) => {
    const { startDate, endDate } = this.state;
    const { actions } = this.props;
    if (startDate && endDate) {
      actions.downloadPSAsByHearingDate({
        startDate,
        endDate,
        filters,
        domain
      });
    }
  }

  renderDownloadByHearing = () => {
    const { startDate, endDate, byHearingDate } = this.state;
    const downloads = 'hearings';
    return byHearingDate
      ? (
        <div>
          {
            (!startDate || !endDate || this.getErrorText(downloads))
              ? this.renderError(downloads)
              : (
                <ButtonRow>
                  <BasicDownloadButton onClick={() => this.downloadByHearingDate(PSA_RESPONSE_TABLE, DOMAIN.MINNEHAHA)}>
                    Download Minnehaha PSA Response Table
                  </BasicDownloadButton>
                  <BasicDownloadButton onClick={() => this.downloadByHearingDate(SUMMARY_REPORT, DOMAIN.MINNEHAHA)}>
                    Download Minnehaha Summary Report
                  </BasicDownloadButton>
                  <BasicDownloadButton onClick={() => this.downloadByHearingDate(SUMMARY_REPORT, DOMAIN.PENNINGTON)}>
                    Download Pennington Summary Report
                  </BasicDownloadButton>
                </ButtonRow>
              )
          }
        </div>
      )
      : null;
  }

  handleCheckboxChange = (e) => {
    const { name } = e.target;
    if (name === 'hearing') {
      this.setState({
        byHearingDate: true,
        byPSADate: false
      });
    }
    else if (name === 'psa') {
      this.setState({
        byHearingDate: false,
        byPSADate: true
      });
    }
  }

  renderDownloadByPSA = () => {
    const { startDate, endDate, byPSADate } = this.state;
    const downloads = 'psas';
    return byPSADate
      ? (
        <div>
          {
            (!startDate || !endDate || this.getErrorText(downloads))
              ? this.renderError(downloads)
              : (
                <div>
                  <ButtonRow>
                    <BasicDownloadButton onClick={() => this.downloadbyPSADate(PSA_RESPONSE_TABLE, DOMAIN.MINNEHAHA)}>
                      Download Minnehaha PSA Response Table
                    </BasicDownloadButton>
                    <BasicDownloadButton onClick={() => this.downloadbyPSADate(SUMMARY_REPORT, DOMAIN.MINNEHAHA)}>
                      Download Minnehaha Summary Report
                    </BasicDownloadButton>
                    <BasicDownloadButton onClick={() => this.downloadbyPSADate(SUMMARY_REPORT, DOMAIN.PENNINGTON)}>
                      Download Pennington Summary Report
                    </BasicDownloadButton>
                  </ButtonRow>
                  <SubHeaderSection>Download All PSA Data by PSA Date</SubHeaderSection>
                  <ButtonRow>
                    <InfoDownloadButton onClick={() => this.downloadbyPSADate()}>
                      Download All PSA Data
                    </InfoDownloadButton>
                  </ButtonRow>
                </div>
              )
          }
        </div>
      )
      : null;
  }

  render() {
    const {
      byHearingDate,
      byPSADate,
      startDate,
      endDate
    } = this.state;
    return (
      <StyledFormViewWrapper>
        <StyledFormWrapper>
          <StyledSectionWrapper>
            <HeaderSection>Download PSA Forms</HeaderSection>
            <SubHeaderSection>Download Charge Lists</SubHeaderSection>
            <ButtonRow>
              <BasicDownloadButton onClick={() => this.downloadCharges(DOMAIN.PENNINGTON)}>
                Download Pennington Charges
              </BasicDownloadButton>
              <BasicDownloadButton onClick={() => this.downloadCharges(DOMAIN.MINNEHAHA)}>
                Download Minnehaha Charges
              </BasicDownloadButton>
            </ButtonRow>
            <SubHeaderSection>PSA Downloads</SubHeaderSection>
            <SelectionWrapper>
              <DateTimeRange
                  noLabel
                  startDate={startDate}
                  endDate={endDate}
                  onStartChange={date => this.setState({ startDate: date })}
                  onEndChange={date => this.setState({ endDate: date })}
                  format24HourClock />
              <StyledCheckbox
                  name="hearing"
                  label="By Hearing Date"
                  checked={byHearingDate}
                  value={byHearingDate}
                  onChange={this.handleCheckboxChange} />
              <StyledCheckbox
                  name="psa"
                  label="By PSA Date"
                  checked={byPSADate}
                  value={byPSADate}
                  onChange={this.handleCheckboxChange} />
            </SelectionWrapper>
            {this.renderDownloadByHearing()}
            {this.renderDownloadByPSA()}
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
