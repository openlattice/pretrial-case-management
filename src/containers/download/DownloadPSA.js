import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import type { RequestSequence } from 'redux-reqseq';
import { DateTime } from 'luxon';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Map, List } from 'immutable';
import {
  Button,
  Checkbox,
  DatePicker,
  DateTimePicker,
  Select
} from 'lattice-ui-kit';

import LogoLoader from '../../components/LogoLoader';
import InCustodyDownloadButton from '../incustody/InCustodyReportButton';
import { InstructionalSubText } from '../../components/TextStyledComponents';
import { OL } from '../../utils/consts/Colors';
import { MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { DOWNLOAD } from '../../utils/consts/FrontEndStateConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { IN_CUSTODY_ACTIONS, IN_CUSTODY_DATA } from '../../utils/consts/redux/InCustodyConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';
import { getReqState } from '../../utils/consts/redux/ReduxUtils';

import {
  REPORT_TYPES,
  PSA_RESPONSE_TABLE,
  SUMMARY_REPORT
} from '../../utils/downloads/ReportDownloadTypes';
import {
  NoResults,
  StyledFormViewWrapper,
  StyledFormWrapper,
  StyledSectionWrapper,
  StyledTopFormNavBuffer
} from '../../utils/Layout';

import {
  downloadPsaForms,
  downloadPSAsByHearingDate,
  downloadReminderData,
  getDownloadFilters
} from './DownloadActions';

const MONTH_OPTIONS = [
  { label: 'January', value: 1 },
  { label: 'Febuary', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 }
];

const YEAR_OPTIONS = List().withMutations((mutableList) => {
  const lastYear = DateTime.local().year;
  for (let y = 2019; y <= lastYear; y += 1) {
    mutableList.push({ label: y.toString(), value: y });
  }
});

const RAW_DATA_OPTION = 'rawData';

const DateRangeContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const DateTimeContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;

  div {
    margin-right: 10px;
  }
`;

const HeaderSection = styled.div`
  color: ${OL.GREY01};
  font-size: 18px;
  width: 100%;
`;

const SubHeaderSection = styled.div`
  align-items: center;
  color: ${OL.GREY01};
  display: flex;
  font-size: 16px;
  justify-content: center;
  padding-top: 30px;
  width: 100%;
`;

const StyledSearchableSelect = styled(Select)`
  width: 250px;
`;

const DownloadSection = styled.div`
  border-bottom: 1px solid ${OL.GREY11};
  padding: 30px;
  width: 100%;
`;

const ButtonRow = styled.div`
  margin-top: 30px;
  text-align: center;
  width: 100%;
`;

const InfoDownloadButton = styled(Button)`
  margin: 0 6px;
  padding: 10px 46px;
`;

const SelectionWrapper = styled.div`
  align-items: flex-end;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  padding-bottom: 20px;
  width: 100%;

  label {
    margin-bottom: 20px;
    width: 25%;
  }
`;

const SubSelectionWrapper = styled(SelectionWrapper)`
  align-items: flex-start;
  border-top: 1px solid ${OL.GREY11};
  flex-direction: column;
  padding: 20px 0 0;
  width: 100%;
`;

const CourtroomOptionsWrapper = styled.div`
  column-gap: 5%;
  display: grid;
  grid-template-columns: 45% 50%;
  margin: 10px;
  padding: 30px 0 10;
  width: 100%;
`;

const OptionsWrapper = styled.div`
  align-items: flex-end;
  column-gap: 10px;
  display: grid;
  grid-template-columns: 18% 15% 60%;
  min-height: 94px;
  width: 100%;

  label {
    width: 100%;
  }
`;

const RemindersOptionsWrapper = styled.div`
  align-items: center;
  column-gap: 20px;
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 2fr;
  min-height: 94px;
  width: 100%;

  label {
    margin-bottom: 0;
    width: 100%;
  }
`;

const Error = styled.div`
  color: firebrick;
  font-size: 16px;
  margin-top: 30px;
  text-align: center;
  width: 100%;
`;

type Props = {
  actions :{
    downloadChargeLists :RequestSequence,
    downloadPsaForms :RequestSequence,
    downloadPSAsByHearingDate :RequestSequence,
    downloadReminderData :RequestSequence,
    getDownloadFilters :RequestSequence,
  },
  courtroomTimes :Map;
  downloadingReports :boolean;
  loadingHearingData :boolean;
  noHearingResults :boolean;
  selectedOrganizationId :string;
  settings :Map;
};

type State = {
  byHearingDate :boolean;
  byPSADate :boolean;
  courtTime :string;
  endDate :?string;
  hearingDate :DateTime;
  month :null | number;
  rawData :boolean;
  selectedHearingData :List;
  startDate :?string;
  year :null | number;
};

class DownloadPSA extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      byHearingDate: false,
      byPSADate: false,
      courtTime: '',
      endDate: '',
      hearingDate: DateTime.local(),
      month: null,
      [RAW_DATA_OPTION]: false,
      selectedHearingData: List(),
      startDate: '',
      year: null
    };
  }

  componentDidUpdate(prevProps :Props, prevState :State) {
    const { hearingDate } = this.state;
    const { actions, selectedOrganizationId } = this.props;
    if (selectedOrganizationId !== prevProps.selectedOrganizationId) {
      actions.getDownloadFilters({ hearingDate });
    }
    if (selectedOrganizationId && (hearingDate !== prevState.hearingDate)) {
      actions.getDownloadFilters({ hearingDate });
    }

  }

  getErrorText = (downloads :string) => {
    const { noHearingResults } = this.props;
    const { startDate, endDate } = this.state;
    let errorText;

    if (startDate && endDate) {

      const start = DateTime.fromISO(startDate);
      const end = DateTime.fromISO(endDate);
      const today = DateTime.local();

      if ((downloads === REPORT_TYPES.BY_HEARING) && noHearingResults) {
        errorText = 'No PSAs match the criteria selected.';
      }
      if (!start.isValid || !end.isValid) {
        errorText = 'At least one of the selected dates is invalid.';
      }
      else if ((downloads === REPORT_TYPES.BY_PSA) && start > today) {
        errorText = 'The selected start date cannot be later than today.';
      }
      else if (end < start) {
        errorText = 'The selected end date must be after the selected start date.';
      }
      else if ((downloads === REPORT_TYPES.BY_PSA) && end.hasSame(start, 'minutes')) {
        errorText = 'The selected start and end dates must be different for reports by PSA date.';
      }
    }

    return errorText;
  }

  renderError = (type :string) => <Error>{this.getErrorText(type)}</Error>

  downloadbyPSADate = (filters :Object) => {
    const { startDate, endDate } = this.state;
    const { actions } = this.props;
    if (startDate && endDate) {
      actions.downloadPsaForms({
        startDate,
        endDate,
        filters
      });
    }
  }

  downloadByHearingDate = (filters :Object) => {
    const { courtTime, hearingDate, selectedHearingData } = this.state;
    const { actions } = this.props;
    if (hearingDate) {
      actions.downloadPSAsByHearingDate({
        courtTime,
        enteredHearingDate: hearingDate,
        selectedHearingData,
        filters
      });
    }
  }

  downloadReminderData = () => {
    const { month, rawData, year } = this.state;
    const { actions } = this.props;
    if (month && year) {
      actions.downloadReminderData({ month, year, rawData });
    }
  }

  handleCourtAndTimeSelection = (option :Object) => {
    const courtTime = option.value.getIn([0, PROPERTY_TYPES.DATE_TIME, 0], '');
    const formattedTime = DateTime.fromISO(courtTime).toISOTime();
    const hearingCourtroom = option.value.getIn([0, PROPERTY_TYPES.COURTROOM, 0]);
    this.setState({
      courtTime: `${hearingCourtroom} - ${formattedTime}`,
      selectedHearingData: option.value
    });
  }

  onHearingDateChange = (dateStr :string) => {
    const { actions } = this.props;
    const hearingDate = DateTime.fromISO(dateStr);
    if (hearingDate.isValid) {
      this.setState({ hearingDate });
      actions.getDownloadFilters({ hearingDate });
    }
  }

  onDateChange = (dates :Object) => {
    let { startDate, endDate } = this.state;
    const { start, end } = dates;

    let nextStart = start || startDate;
    if (nextStart) nextStart = DateTime.fromISO(nextStart);
    let nextEnd = end || endDate;
    if (nextEnd) nextEnd = DateTime.fromISO(nextEnd);
    startDate = startDate ? DateTime.fromISO(startDate) : startDate;
    endDate = endDate ? DateTime.fromISO(endDate) : endDate;
    this.setState({
      startDate: nextStart,
      endDate: nextEnd
    });
  }

  renderDownloadByHearing = () => {
    const { loadingHearingData, downloadingReports, noHearingResults } = this.props;
    const { hearingDate, byHearingDate, courtTime } = this.state;
    const downloads = REPORT_TYPES.BY_HEARING;
    if (loadingHearingData) return <LogoLoader />;
    return (byHearingDate && hearingDate)
      ? (
        <SubSelectionWrapper>
          <ButtonRow>
            <Button
                disabled={downloadingReports || !courtTime}
                onClick={() => this.downloadByHearingDate(PSA_RESPONSE_TABLE)}>
              Download PSA Response Table
            </Button>
            <Button
                disabled={downloadingReports || !courtTime}
                onClick={() => this.downloadByHearingDate(SUMMARY_REPORT)}>
              Download Summary Report
            </Button>
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
                <LogoLoader loadingText="Loading Report..." />
              )
              : null
          }
        </SubSelectionWrapper>
      )
      : null;
  }

  handleCheckboxChange = (e :SyntheticEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (name === REPORT_TYPES.BY_HEARING) {
      this.setState({
        byHearingDate: true,
        byPSADate: false,
        endDate: '',
        hearingDate: DateTime.local(),
        startDate: '',
      });
    }
    else if (name === REPORT_TYPES.BY_PSA) {
      this.setState({
        byHearingDate: false,
        byPSADate: true,
        endDate: '',
        hearingDate: DateTime.local(),
        startDate: '',
      });
    }
    else if (name === RAW_DATA_OPTION) {
      this.setState({ [RAW_DATA_OPTION]: e.target.checked });
    }
  }

  renderDownloadByPSA = () => {
    const { downloadingReports, settings } = this.props;
    const { startDate, endDate, byPSADate } = this.state;
    const includesPretrialModule = settings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);
    const downloads = REPORT_TYPES.BY_PSA;
    return (byPSADate && startDate && endDate)
      ? (
        <SubSelectionWrapper>
          {
            includesPretrialModule
              ? (
                <ButtonRow>
                  <Button
                      disabled={downloadingReports || !!this.getErrorText(downloads)}
                      onClick={() => this.downloadbyPSADate(PSA_RESPONSE_TABLE)}>
                    PSA Response Table
                  </Button>
                  <Button
                      disabled={downloadingReports || !!this.getErrorText(downloads)}
                      onClick={() => this.downloadbyPSADate(SUMMARY_REPORT)}>
                    Summary Report
                  </Button>
                </ButtonRow>
              ) : null
          }
          <ButtonRow>
            <InfoDownloadButton
                disabled={downloadingReports || !!this.getErrorText(downloads)}
                onClick={() => this.downloadbyPSADate()}>
              All PSA Data
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
                <LogoLoader loadingText="Loading Report..." />
              )
              : null
          }
        </SubSelectionWrapper>
      )
      : null;
  }

  monthIsDisabled = (option :Object) => {
    const { value: month } = option;
    const { year } = this.state;
    return DateTime.local() < DateTime.fromObject({ month, year });
  }

  setMonth = (option :Object) => this.setState({ month: option.value });
  setYear = (option :Object) => this.setState({ year: option.value });

  render() {
    const { courtroomTimes, downloadingReports, settings } = this.props;
    const {
      byHearingDate,
      byPSADate,
      month,
      rawData,
      year
    } = this.state;
    const courtroomOptions = courtroomTimes.entrySeq().map(([label, value]) => ({ label, value }));
    const includesPretrialModule = settings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);

    return (
      <StyledFormViewWrapper>
        <StyledFormWrapper>
          <StyledSectionWrapper>
            <DownloadSection>
              <HeaderSection>Download PSA Forms</HeaderSection>
            </DownloadSection>
            <DownloadSection>
              <SubHeaderSection>PSA Downloads</SubHeaderSection>
              <SelectionWrapper>
                <OptionsWrapper>
                  {
                    includesPretrialModule
                      ? (
                        <Checkbox
                            checked={byHearingDate}
                            label="By Hearing Date"
                            name={REPORT_TYPES.BY_HEARING}
                            onChange={this.handleCheckboxChange}
                            value={byHearingDate} />
                      ) : <div />
                  }
                  <Checkbox
                      checked={byPSADate}
                      label="By PSA Date"
                      name={REPORT_TYPES.BY_PSA}
                      onChange={this.handleCheckboxChange}
                      value={byPSADate} />
                  {
                    byHearingDate
                      ? (
                        <CourtroomOptionsWrapper>
                          <DatePicker
                              onChange={this.onHearingDateChange} />
                          <StyledSearchableSelect
                              options={courtroomOptions}
                              onChange={this.handleCourtAndTimeSelection} />
                        </CourtroomOptionsWrapper>
                      ) : null
                  }
                  {
                    byPSADate
                      ? (
                        <DateRangeContainer>
                          <DateTimeContainer>
                            <div>Start:</div>
                            <DateTimePicker ampm={false} onChange={(start) => this.onDateChange({ start })} />
                          </DateTimeContainer>
                          <DateTimeContainer>
                            <div>End:</div>
                            <DateTimePicker ampm={false} onChange={(end) => this.onDateChange({ end })} />
                          </DateTimeContainer>
                        </DateRangeContainer>
                      ) : null
                  }
                </OptionsWrapper>
              </SelectionWrapper>
              <SelectionWrapper>
                { includesPretrialModule ? this.renderDownloadByHearing() : null }
                {this.renderDownloadByPSA()}
              </SelectionWrapper>
            </DownloadSection>
            <DownloadSection>
              <SelectionWrapper>
                <SubHeaderSection>In-Custody Report</SubHeaderSection>
              </SelectionWrapper>
              <SelectionWrapper>
                <InCustodyDownloadButton />
              </SelectionWrapper>
            </DownloadSection>
            <DownloadSection>
              <SelectionWrapper>
                <SubHeaderSection>Reminders Monthly Report</SubHeaderSection>
              </SelectionWrapper>
              <SelectionWrapper>
                <InstructionalSubText>
                  {
                    'This report is a monthly tally of every person that has received a'
                    + ' reminder for a hearing at a given date, time, and location. Note that'
                    + ' people may have multiple methods of contact and multiple hearings may'
                    + ' be scheduled at the same date, time, and location. When either of these'
                    + ' cases is true, we check if that person has received at least one successful'
                    + ' reminder among all of those scenarios, and count that once. Failed reminders'
                    + ' will not be counted if someone receives at least one successful reminder for'
                    + " a given hearing. For this reason, the total count under the 'Reminders' tab"
                    + " on the 'Manage People' page, will not match the counts on this report. Please"
                    + ' contact OpenLattice if you need more information.'
                  }
                </InstructionalSubText>
              </SelectionWrapper>
              <SelectionWrapper>
                <InstructionalSubText>
                  {
                    "If you want raw data for the entire state, check the 'Raw Data' checkbox."
                    + ' This option will include the following headers: DATE, WAS NOTIFIED, TYPE, LAST,'
                    + ' FIRST, MIDDLE, SEX, DOB, RACE, ETHNICITY, CASE ID, HEARING DATE, COURTROOM,'
                    + ' HEARING TYPE, and COUNTY.'
                  }
                </InstructionalSubText>
              </SelectionWrapper>
              <SelectionWrapper>
                <RemindersOptionsWrapper>
                  <StyledSearchableSelect
                      options={YEAR_OPTIONS}
                      onChange={this.setYear} />
                  <StyledSearchableSelect
                      isDisabled={!year}
                      isOptionDisabled={this.monthIsDisabled}
                      options={MONTH_OPTIONS}
                      onChange={this.setMonth} />
                  <Checkbox
                      checked={rawData}
                      label="Raw Data"
                      name={RAW_DATA_OPTION}
                      onChange={this.handleCheckboxChange}
                      value={rawData} />
                  <Button
                      disabled={!year || !month || downloadingReports}
                      onClick={this.downloadReminderData}>
                    Reminders Report
                  </Button>
                </RemindersOptionsWrapper>
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
  const app = state.get(STATE.APP, Map());
  const download = state.get(STATE.DOWNLOAD, Map());
  const inCustody = state.get(STATE.IN_CUSTODY, Map());
  const settings = state.get(STATE.SETTINGS, Map());
  return {
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    [DOWNLOAD.DOWNLOADING_REPORTS]: download.get(DOWNLOAD.DOWNLOADING_REPORTS),
    [DOWNLOAD.COURTROOM_OPTIONS]: download.get(DOWNLOAD.COURTROOM_OPTIONS),
    [DOWNLOAD.COURTROOM_TIMES]: download.get(DOWNLOAD.COURTROOM_TIMES),
    [DOWNLOAD.ERROR]: download.get(DOWNLOAD.ERROR),
    [DOWNLOAD.NO_RESULTS]: download.get(DOWNLOAD.NO_RESULTS),
    [DOWNLOAD.ALL_HEARING_DATA]: download.get(DOWNLOAD.ALL_HEARING_DATA),
    [DOWNLOAD.LOADING_HEARING_DATA]: download.get(DOWNLOAD.LOADING_HEARING_DATA),

    // In-Custody Request States
    downloadInCustodyReportReqState: getReqState(inCustody, IN_CUSTODY_ACTIONS.DOWNLOAD_IN_CUSTODY_REPORT),

    // In-Custody Data
    [IN_CUSTODY_DATA.PEOPLE_IN_CUSTODY]: inCustody.get(IN_CUSTODY_DATA.PEOPLE_IN_CUSTODY),

    /* Settings */
    settings: settings.get(SETTINGS_DATA.APP_SETTINGS, Map())
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Download Actions
    downloadPsaForms,
    downloadPSAsByHearingDate,
    downloadReminderData,
    getDownloadFilters
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(DownloadPSA);
