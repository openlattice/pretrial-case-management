
/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import type { RequestSequence } from 'redux-reqseq';
import { Button, Select } from 'lattice-ui-kit';
import { DateTime } from 'luxon';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Map, List } from 'immutable';

import DateTimeRangePicker from '../../components/datetime/DateTimeRangePicker';
import DatePicker from '../../components/datetime/DatePicker';
import InfoButton from '../../components/buttons/InfoButton';
import LogoLoader from '../../components/LogoLoader';
import StyledCheckbox from '../../components/controls/StyledCheckbox';
import InCustodyDownloadButton from '../incustody/InCustodyReportButton';
import { OL } from '../../utils/consts/Colors';
import { MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { DATE_FORMAT } from '../../utils/consts/DateTimeConsts';
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
} from '../../utils/consts/ReportDownloadTypes';
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
  getDownloadFilters
} from './DownloadActions';

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

const StyledSearchableSelect = styled(Select)`
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
  grid-template-columns: 18% 15% 60%;
  column-gap: 10px;
  align-items: flex-end;
  label {
    width: 100%;
  }
`;

const Error = styled.div`
  width: 100%;
  text-align: center;
  font-size: 16px;
  color: firebrick;
  margin-top: 30px;
`;

type Props = {
  actions :{
    downloadPsaForms :RequestSequence,
    downloadChargeLists :RequestSequence,
    downloadPSAsByHearingDate :RequestSequence,
    getDownloadFilters :RequestSequence,
  },
  courtroomTimes :Map;
  loadingHearingData :boolean;
  downloadingReports :boolean;
  noHearingResults :boolean;
  selectedOrganizationId :string;
  settings :Map;
};

type State = {
  startDate :?string;
  endDate :?string;
  hearingDate :DateTime;
  selectedHearingData :List;
  byHearingDate :boolean;
  byPSADate :boolean;
  courtTime :string;
};

class DownloadPSA extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      startDate: '',
      endDate: '',
      hearingDate: DateTime.local(),
      selectedHearingData: List(),
      byHearingDate: false,
      byPSADate: false,
      courtTime: ''
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
    const hearingDate = DateTime.fromFormat(dateStr, DATE_FORMAT);
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
        hearingDate: DateTime.local(),
        startDate: '',
        endDate: '',
      });
    }
    else if (name === REPORT_TYPES.BY_PSA) {
      this.setState({
        byHearingDate: false,
        hearingDate: DateTime.local(),
        byPSADate: true,
        startDate: '',
        endDate: '',
      });
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
                      disabled={downloadingReports || this.getErrorText(downloads)}
                      onClick={() => this.downloadbyPSADate(PSA_RESPONSE_TABLE)}>
                    PSA Response Table
                  </Button>
                  <Button
                      disabled={downloadingReports || this.getErrorText(downloads)}
                      onClick={() => this.downloadbyPSADate(SUMMARY_REPORT)}>
                    Summary Report
                  </Button>
                </ButtonRow>
              ) : null
          }
          <ButtonRow>
            <InfoDownloadButton
                disabled={downloadingReports || this.getErrorText(downloads)}
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

  render() {
    const { courtroomTimes, settings } = this.props;
    const {
      byHearingDate,
      byPSADate,
      hearingDate,
      startDate,
      endDate
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
                        <StyledCheckbox
                            name={REPORT_TYPES.BY_HEARING}
                            label="By Hearing Date"
                            checked={byHearingDate}
                            value={byHearingDate}
                            onChange={this.handleCheckboxChange} />
                      ) : <div />
                  }
                  <StyledCheckbox
                      name={REPORT_TYPES.BY_PSA}
                      label="By PSA Date"
                      checked={byPSADate}
                      value={byPSADate}
                      onChange={this.handleCheckboxChange} />
                  {
                    byHearingDate
                      ? (
                        <CourtroomOptionsWrapper>
                          <DatePicker
                              value={hearingDate.toISO()}
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
                        <DateTimeRangePicker
                            startDate={startDate}
                            endDate={endDate}
                            onStartChange={(start) => this.onDateChange({ start })}
                            onEndChange={(end) => this.onDateChange({ end })}
                            format24HourClock />
                      ) : null
                  }
                </OptionsWrapper>
              </SelectionWrapper>
              <SelectionWrapper>
                { includesPretrialModule ? this.renderDownloadByHearing() : null }
                {this.renderDownloadByPSA()}
              </SelectionWrapper>
              <SelectionWrapper>
                <InCustodyDownloadButton />
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
    getDownloadFilters
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(DownloadPSA);
