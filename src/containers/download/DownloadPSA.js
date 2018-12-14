/*
 * @flow
 */

import React from 'react';
import moment from 'moment';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Map, Set, List } from 'immutable';

import BasicButton from '../../components/buttons/BasicButton';
import DateTimeRangePicker from '../../components/datetime/DateTimeRangePicker';
import DatePicker from '../../components/datetime/DatePicker';
import InfoButton from '../../components/buttons/InfoButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import SearchableSelect from '../../components/controls/SearchableSelect';
import StyledCheckbox from '../../components/controls/StyledCheckbox';
import { OL } from '../../utils/consts/Colors';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { STATE, DOWNLOAD } from '../../utils/consts/FrontEndStateConsts';
import {
  REPORT_TYPES,
  DOMAIN,
  PSA_RESPONSE_TABLE,
  SUMMARY_REPORT
} from '../../utils/consts/ReportDownloadTypes';
import {
  NoResults,
  StyledFormViewWrapper,
  StyledFormWrapper,
  StyledSectionWrapper,
  StyledTopFormNavBuffer
} from '../../utils/Layout';

import * as DownloadActionFactory from './DownloadActionFactory';

const HeaderSection = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 18px;
  color: ${OL.GREY01};
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

const StyledSearchableSelect = styled(SearchableSelect)`
  width: 250px;
`;

const DownloadSection = styled.div`
  width: 100%;
  padding: 30px;
  border-bottom: 1px solid ${OL.GREY11};
`;

const ButtonRow = styled.div`
  width: 100%;
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
  padding-bottom: 20px;
  label {
    width: 25%;
    margin-bottom: 20px;
  }
`;

const SubSelectionWrapper = styled(SelectionWrapper)`
  width: 100%;
  padding: 20px 0 0;
  flex-direction: column;
  align-items: flex-start;
  border-top: 1px solid ${OL.GREY11};
`;

const CourtroomOptionsWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 45% 50%;
  padding: 30px 0 10;
  margin: 10px;
  column-gap: 5%;
`;

const OptionsWrapper = styled.div`
  width: 100%;
  min-height: 94px;
  display: grid;
  grid-template-columns: 60% 18% 15%;
  column-gap: 10px;
  align-items: flex-end;
  label {
    width: 100%;
  }
`;

const CourtOptionTitle = styled.div`
  margin: 0 10px 10px 0;
`;

const Error = styled.div`
  width: 100%;
  text-align: center;
  font-size: 16px;
  color: firebrick;
  margin-top: 30px;
`;

const LoadingReports = styled.div`
  height: 200px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30px;
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
    }) => void,
    getDownloadFilters :(value :{
      startDate :string,
      endDate :string
    }) => void
  },
  courtroomTimes :Map<*, *>,
  history :string[],
  loadingHearingData :boolean,
  downloadingReports :boolean,
  noHearingResults :boolean
};

type State = {
  startDate :?string,
  endDate :?string
};

class DownloadPSA extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      startDate: '',
      endDate: '',
      hearingDate: moment(),
      selectedHearingData: List(),
      byHearingDate: false,
      byPSADate: false,
      courtTime: ''
    };
  }

  componentDidMount() {
    const { actions } = this.props;
    let { hearingDate } = this.state;
    hearingDate = moment(hearingDate);
    if (hearingDate.isValid()) {
      this.setState({ hearingDate });
      actions.getDownloadFilters({ hearingDate });
    }
  }

  getErrorText = (downloads) => {
    const { noHearingResults } = this.props;
    const { startDate, endDate } = this.state;
    let errorText;


    if (startDate && endDate) {

      const start = moment(startDate);
      const end = moment(endDate);
      const today = moment();

      if ((downloads === REPORT_TYPES.BY_HEARING) && noHearingResults) {
        errorText = 'No PSAs match the criteria selected.';
      }
      if (!start.isValid() || !end.isValid()) {
        errorText = 'At least one of the selected dates is invalid.';
      }
      else if ((downloads === REPORT_TYPES.BY_PSA) && start.isAfter(today)) {
        errorText = 'The selected start date cannot be later than today.';
      }
      else if (end.isBefore(start)) {
        errorText = 'The selected end date must be after the selected start date.';
      }
      else if ((downloads === REPORT_TYPES.BY_PSA) && end.isSame(start)) {
        errorText = 'The selected start and end dates must be different for reports by PSA date.';
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
    const { courtTime, hearingDate, selectedHearingData } = this.state;
    const { actions } = this.props;
    if (hearingDate) {
      actions.downloadPSAsByHearingDate({
        courtTime,
        enteredHearingDate: hearingDate,
        selectedHearingData,
        filters,
        domain
      });
    }
  }

  handleCourtAndTimeSelection = (option) => {
    const courtTime = option.getIn([0, PROPERTY_TYPES.DATE_TIME, 0], '');
    const formattedTime = moment(courtTime).format(('HH:mm'));
    const hearingCourtroom = option.getIn([0, PROPERTY_TYPES.COURTROOM, 0]);
    this.setState({
      courtTime: `${hearingCourtroom} - ${formattedTime}`,
      selectedHearingData: option
    });
  }

  renderCourtTimeOptions = () => {
    const { courtTime } = this.state;
    const { courtroomTimes } = this.props;
    return (
      <StyledSearchableSelect
          options={courtroomTimes}
          value={courtTime}
          onSelect={option => this.handleCourtAndTimeSelection(option)}
          short />
    );
  }

  onHearingDateChange = (dateStr) => {
    const { actions } = this.props;
    const hearingDate = moment(dateStr);
    if (hearingDate.isValid()) {
      this.setState({ hearingDate });
      actions.getDownloadFilters({ hearingDate });
    }
  }

  onDateChange = (dates) => {
    let { startDate, endDate } = this.state;
    const { start, end } = dates;

    let nextStart = start || startDate;
    if (nextStart) nextStart = moment(nextStart);
    let nextEnd = end || endDate;
    if (nextEnd) nextEnd = moment(nextEnd);
    startDate = startDate ? moment(startDate) : startDate;
    endDate = endDate ? moment(endDate) : endDate;
    this.setState({
      startDate: nextStart,
      endDate: nextEnd
    });
  }

  renderDownloadByHearing = () => {
    const { loadingHearingData, downloadingReports, noHearingResults } = this.props;
    const { hearingDate, byHearingDate, courtTime } = this.state;
    const downloads = REPORT_TYPES.BY_HEARING;
    if (loadingHearingData) return <LoadingSpinner />;
    return (byHearingDate && hearingDate)
      ? (
        <SubSelectionWrapper>
          <ButtonRow>
            <BasicDownloadButton
                disabled={downloadingReports || !courtTime}
                onClick={() => this.downloadByHearingDate(PSA_RESPONSE_TABLE, DOMAIN.MINNEHAHA)}>
              Download Minnehaha PSA Response Table
            </BasicDownloadButton>
            <BasicDownloadButton
                disabled={downloadingReports || !courtTime}
                onClick={() => this.downloadByHearingDate(SUMMARY_REPORT, DOMAIN.MINNEHAHA)}>
              Download Minnehaha Summary Report
            </BasicDownloadButton>
            <BasicDownloadButton
                disabled={downloadingReports || !courtTime}
                onClick={() => this.downloadByHearingDate(SUMMARY_REPORT, DOMAIN.PENNINGTON)}>
              Download Pennington Summary Report
            </BasicDownloadButton>
          </ButtonRow>
          {
            (!hearingDate || !downloadingReports || this.getErrorText(downloads))
              ? this.renderError(downloads)
              : null
          }
          {
            noHearingResults
              ? <NoResults>There are no open PSAs associated to the criteria selected above.</NoResults>
              : null
          }
          {
            downloadingReports
              ? (
                <LoadingReports>
                  Loading Report
                  <LoadingSpinner />
                </LoadingReports>
              )
              : null
          }
        </SubSelectionWrapper>
      )
      : null;
  }

  handleCheckboxChange = (e) => {
    const { name } = e.target;
    if (name === REPORT_TYPES.BY_HEARING) {
      this.setState({
        byHearingDate: true,
        byPSADate: false,
        hearingDate: moment(),
        startDate: '',
        endDate: '',
      });
    }
    else if (name === REPORT_TYPES.BY_PSA) {
      this.setState({
        byHearingDate: false,
        hearingDate: moment(),
        byPSADate: true,
        startDate: '',
        endDate: '',
      });
    }
  }

  renderDownloadByPSA = () => {
    const { downloadingReports } = this.props;
    const { startDate, endDate, byPSADate } = this.state;
    const downloads = REPORT_TYPES.BY_PSA;
    return (byPSADate && startDate && endDate)
      ? (
        <SubSelectionWrapper>
          <ButtonRow>
            <BasicDownloadButton
                disabled={downloadingReports || this.getErrorText(downloads)}
                onClick={() => this.downloadbyPSADate(PSA_RESPONSE_TABLE, DOMAIN.MINNEHAHA)}>
              Download Minnehaha PSA Response Table
            </BasicDownloadButton>
            <BasicDownloadButton
                disabled={downloadingReports || this.getErrorText(downloads)}
                onClick={() => this.downloadbyPSADate(SUMMARY_REPORT, DOMAIN.MINNEHAHA)}>
              Download Minnehaha Summary Report
            </BasicDownloadButton>
            <BasicDownloadButton
                disabled={downloadingReports || this.getErrorText(downloads)}
                onClick={() => this.downloadbyPSADate(SUMMARY_REPORT, DOMAIN.PENNINGTON)}>
              Download Pennington Summary Report
            </BasicDownloadButton>
          </ButtonRow>
          <ButtonRow>
            <InfoDownloadButton
                disabled={downloadingReports || this.getErrorText(downloads)}
                onClick={() => this.downloadbyPSADate()}>
              Download All PSA Data
            </InfoDownloadButton>
          </ButtonRow>
          {
            (!startDate || !endDate || !downloadingReports || this.getErrorText(downloads))
              ? this.renderError(downloads)
              : null
          }
          {
            downloadingReports
              ? (
                <LoadingReports>
                  Loading Report
                  <LoadingSpinner />
                </LoadingReports>
              )
              : null
          }
        </SubSelectionWrapper>
      )
      : null;
  }

  render() {
    const {
      byHearingDate,
      byPSADate,
      hearingDate,
      startDate,
      endDate
    } = this.state;
    return (
      <StyledFormViewWrapper>
        <StyledFormWrapper>
          <StyledSectionWrapper>
            <DownloadSection>
              <HeaderSection>Download PSA Forms</HeaderSection>
            </DownloadSection>
            {/* <DownloadSection>
              <SubHeaderSection>Download Charge Lists</SubHeaderSection>
              <ButtonRow>
                <BasicDownloadButton onClick={() => this.downloadCharges(DOMAIN.PENNINGTON)}>
                  Download Pennington Charges
                </BasicDownloadButton>
                <BasicDownloadButton onClick={() => this.downloadCharges(DOMAIN.MINNEHAHA)}>
                  Download Minnehaha Charges
                </BasicDownloadButton>
              </ButtonRow>
            </DownloadSection> */}
            <DownloadSection>
              <SubHeaderSection>PSA Downloads</SubHeaderSection>
              <SelectionWrapper>
                <OptionsWrapper>
                  {
                    byHearingDate
                      ? (
                        <CourtroomOptionsWrapper>
                          <DatePicker
                              value={hearingDate.format('YYYY-MM-DD')}
                              onChange={date => this.onHearingDateChange(date)} />
                          { this.renderCourtTimeOptions() }
                        </CourtroomOptionsWrapper>
                      )
                      : (
                        <DateTimeRangePicker
                            startDate={startDate}
                            endDate={endDate}
                            onStartChange={start => this.onDateChange({ start })}
                            onEndChange={end => this.onDateChange({ end })}
                            format24HourClock />
                      )
                  }
                  <StyledCheckbox
                      name={REPORT_TYPES.BY_HEARING}
                      label="By Hearing Date"
                      checked={byHearingDate}
                      value={byHearingDate}
                      onChange={this.handleCheckboxChange} />
                  <StyledCheckbox
                      name={REPORT_TYPES.BY_PSA}
                      label="By PSA Date"
                      checked={byPSADate}
                      value={byPSADate}
                      onChange={this.handleCheckboxChange} />
                </OptionsWrapper>
              </SelectionWrapper>
              <SelectionWrapper>
                {this.renderDownloadByHearing()}
                {this.renderDownloadByPSA()}
              </SelectionWrapper>
            </DownloadSection>
            <StyledTopFormNavBuffer />
          </StyledSectionWrapper>
        </StyledFormWrapper>
      </StyledFormViewWrapper>
    );
  }

}

function mapStateToProps(state) {
  const download = state.get(STATE.DOWNLOAD);
  return {
    [DOWNLOAD.DOWNLOADING_REPORTS]: download.get(DOWNLOAD.DOWNLOADING_REPORTS),
    [DOWNLOAD.COURTROOM_OPTIONS]: download.get(DOWNLOAD.COURTROOM_OPTIONS),
    [DOWNLOAD.COURTROOM_TIMES]: download.get(DOWNLOAD.COURTROOM_TIMES),
    [DOWNLOAD.ERROR]: download.get(DOWNLOAD.ERROR),
    [DOWNLOAD.NO_RESULTS]: download.get(DOWNLOAD.NO_RESULTS),
    [DOWNLOAD.ALL_HEARING_DATA]: download.get(DOWNLOAD.ALL_HEARING_DATA),
    [DOWNLOAD.LOADING_HEARING_DATA]: download.get(DOWNLOAD.LOADING_HEARING_DATA)
  };
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

export default connect(mapStateToProps, mapDispatchToProps)(DownloadPSA);
