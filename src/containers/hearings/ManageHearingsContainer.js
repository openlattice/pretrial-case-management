/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import { DateTime } from 'luxon';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card,
  CardSegment,
  DatePicker,
  Select
} from 'lattice-ui-kit';

import HearingSettingsButton from '../../components/hearings/HearingSettingsButton';
import LogoLoader from '../../components/LogoLoader';
import ManageHearingsList from './ManageHearingsList';
import ManageHearingsDetails from './ManageHearingsDetails';
import CountiesDropdown from '../counties/CountiesDropdown';
import { OUTCOME_OPTIONS } from '../../utils/consts/HearingConsts';
import { EDM } from '../../utils/consts/FrontEndStateConsts';
import { OL } from '../../utils/consts/Colors';
import { sortCourtrooms } from '../../utils/DataUtils';
import { StyledTitleWrapper } from '../../utils/Layout';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { COUNTIES_DATA } from '../../utils/consts/redux/CountiesConsts';
import { HEARINGS_ACTIONS, HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';
import { PEOPLE_ACTIONS } from '../../utils/consts/redux/PeopleConsts';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';

import {
  loadHearingsForDate,
  setManageHearingsDate,
  setCountyFilter,
  setCourtroomFilter
} from './HearingsActions';

const { PREFERRED_COUNTY } = SETTINGS;

const ManageHearingsBody = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
`;

const Title = styled.div`
  height: 100%;
  font-size: 24px;
  display: flex;
`;

const Filters = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 30px;
`;

const FilterTitle = styled.div`
  font-size: 14px;
  color: ${OL.GREY01};
  margin-bottom: 10px;
`;

const FilterElement = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

type Props = {
  actions :{
    bulkDownloadPSAReviewPDF :RequestSequence;
    changeHearingFilters :({ county :string, courtroom :string }) => void;
    checkPSAPermissions :RequestSequence;
    loadHearingsForDate :RequestSequence;
    setCountyFilter :(value :Object) => void;
    setCourtroomFilter :(value :Object) => void;
    setManageHearingsDate :(value :Object) => void;
  };
  countiesById :Map;
  countyFilter :string;
  courtroomFilter :string;
  courtroomOptions :Map;
  getPeopleNeighborsReqState :RequestState;
  hearingNeighborsById :Map;
  hearingsByTime :Map;
  loadHearingNeighborsReqState :RequestState;
  loadHearingsForDateReqState :RequestState;
  manageHearingsDate :DateTime;
  selectedOrganizationId :string;
  selectedOrganizationSettings :Map;
};

class ManageHearingsContainer extends React.Component<Props, *> {
  constructor(props :Props) {
    super(props);
    this.state = {
      selectedHearingEKID: '',
      outcomeFilter: 'All'
    };
  }

  selectHearing = (selectedHearingEKID) => this.setState({ selectedHearingEKID });

  componentDidMount() {
    const {
      actions,
      manageHearingsDate,
      selectedOrganizationId,
      selectedOrganizationSettings
    } = this.props;
    const preferredCountyEKID :UUID = selectedOrganizationSettings.get(PREFERRED_COUNTY, '');
    if (selectedOrganizationId) {
      actions.loadHearingsForDate({ manageHearingsDate });
      if (preferredCountyEKID) actions.setCountyFilter({ value: preferredCountyEKID });
    }
  }

  componentDidUpdate(nextProps) {
    const {
      actions,
      manageHearingsDate,
      hearingsByTime,
      hearingNeighborsById,
      selectedOrganizationId,
      selectedOrganizationSettings
    } = this.props;
    const preferredCountyEKID :UUID = selectedOrganizationSettings.get(PREFERRED_COUNTY, '');
    if (selectedOrganizationId !== nextProps.selectedOrganizationId) {
      if (!hearingsByTime.size || !hearingNeighborsById.size || manageHearingsDate !== nextProps.manageHearingsDate) {
        actions.loadHearingsForDate({ manageHearingsDate });
        if (preferredCountyEKID) actions.setCountyFilter({ value: preferredCountyEKID });
      }
    }
  }

  getFilterElement = (title, filter) => (
    <FilterElement>
      <FilterTitle>{title}</FilterTitle>
      <div>{filter}</div>
    </FilterElement>
  );

  setOutcomeFilter = (outcomeFilter) => this.setState({ outcomeFilter: outcomeFilter.label });

  renderOutcomeFilter = () => {
    const { loadHearingsForDateReqState, loadHearingNeighborsReqState } = this.props;
    const { outcomeFilter } = this.state;
    const currentFilterValue = { label: outcomeFilter, value: outcomeFilter };
    const options = Object.values(OUTCOME_OPTIONS).map((outcome) => ({ label: outcome, value: outcome }));
    const hearingsAreLoading :boolean = requestIsPending(loadHearingsForDateReqState)
      || requestIsPending(loadHearingNeighborsReqState);
    return (
      <Select
          value={currentFilterValue}
          options={options}
          isLoading={hearingsAreLoading}
          onChange={this.setOutcomeFilter} />
    );
  }

  renderCourtroomFilter = () => {
    const { courtroomFilter } = this.props;
    const {
      actions,
      courtroomOptions,
      loadHearingsForDateReqState,
      loadHearingNeighborsReqState,
    } = this.props;
    const hearingsAreLoading :boolean = requestIsPending(loadHearingsForDateReqState)
      || requestIsPending(loadHearingNeighborsReqState);
    const options :List = courtroomOptions.map((courtroomName) => ({
      label: courtroomName,
      value: courtroomName
    })).sort((cr1, cr2) => sortCourtrooms(cr1.label, cr2.label)).toJS();
    const currentFilterValue = courtroomFilter
      ? { label: courtroomFilter, value: courtroomFilter }
      : { label: 'All', value: '' };
    options.unshift({ label: 'All', value: '' });
    return (
      <Select
          value={currentFilterValue}
          options={options}
          isLoading={hearingsAreLoading}
          onChange={actions.setCourtroomFilter} />
    );
  }

  handleDateChange = (dateString :string) => {
    const { actions } = this.props;
    const manageHearingsDate = DateTime.fromISO(dateString);
    if (manageHearingsDate.isValid) {
      actions.setManageHearingsDate({ date: manageHearingsDate });
      actions.loadHearingsForDate({ manageHearingsDate });
    }
  }

  renderManageHearingDate = () => {
    const { manageHearingsDate } = this.props;
    return (
      <DatePicker
          value={manageHearingsDate.toISO()}
          onChange={this.handleDateChange} />
    );
  }

  renderCountyFilter = () => {
    const { countyFilter } = this.props;
    const {
      actions,
      countiesById,
      loadHearingsForDateReqState,
      loadHearingNeighborsReqState,
    } = this.props;
    const hearingsAreLoading :boolean = requestIsPending(loadHearingsForDateReqState)
      || requestIsPending(loadHearingNeighborsReqState);
    return (
      <CountiesDropdown
          value={countyFilter}
          options={countiesById}
          loading={hearingsAreLoading}
          onChange={actions.setCountyFilter} />
    );
  }

  renderFilters = () => (
    <Filters>
      { this.getFilterElement('Hearing Date', this.renderManageHearingDate())}
      { this.getFilterElement('County', this.renderCountyFilter())}
      { this.getFilterElement('Courtroom', this.renderCourtroomFilter())}
      { this.getFilterElement('Outcome', this.renderOutcomeFilter())}
    </Filters>
  )

  renderHeader = () => (
    <StyledTitleWrapper>
      <Title>Manage Hearings</Title>
      <HearingSettingsButton />
    </StyledTitleWrapper>
  )

  renderManageHearingsBody = () => {
    const {
      countyFilter,
      courtroomFilter,
      getPeopleNeighborsReqState,
      loadHearingsForDateReqState,
      loadHearingNeighborsReqState,
    } = this.props;
    const { outcomeFilter, selectedHearingEKID } = this.state;
    const hearingsAreLoading :boolean = requestIsPending(loadHearingsForDateReqState)
      || requestIsPending(loadHearingNeighborsReqState)
      || requestIsPending(getPeopleNeighborsReqState);
    return hearingsAreLoading
      ? (
        <LogoLoader loadingText="Loading Hearings..." />
      )
      : (
        <ManageHearingsBody>
          <ManageHearingsList
              selectHearing={this.selectHearing}
              countyFilter={countyFilter}
              courtroomFilter={courtroomFilter}
              outcomeFilter={outcomeFilter}
              selectedHearingEKID={selectedHearingEKID} />
          <ManageHearingsDetails selectHearing={this.selectHearing} hearingEKID={selectedHearingEKID} />
        </ManageHearingsBody>
      );
  }

  render() {
    return (
      <>
        { this.renderHeader() }
        <Card>
          <CardSegment>
            {this.renderFilters()}
          </CardSegment>
          { this.renderManageHearingsBody() }
        </Card>
      </>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const counties = state.get(STATE.COUNTIES);
  const edm = state.get(STATE.EDM);
  const hearings = state.get(STATE.HEARINGS);
  const people = state.get(STATE.PEOPLE);

  const courtDate = hearings.get(HEARINGS_DATA.MANAGE_HEARINGS_DATE).toISODate();
  const hearingsByTime = hearings.getIn([HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME, courtDate], Map());
  return {
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    // Counties
    [COUNTIES_DATA.COUNTIES_BY_ID]: counties.get(COUNTIES_DATA.COUNTIES_BY_ID),

    // Hearings
    hearingsByTime,
    loadHearingsForDateReqState: getReqState(hearings, HEARINGS_ACTIONS.LOAD_HEARINGS_FOR_DATE),
    loadHearingNeighborsReqState: getReqState(hearings, HEARINGS_ACTIONS.LOAD_HEARING_NEIGHBORS),
    [HEARINGS_DATA.COUNTY_FILTER]: hearings.get(HEARINGS_DATA.COUNTY_FILTER),
    [HEARINGS_DATA.COURTROOM_FILTER]: hearings.get(HEARINGS_DATA.COURTROOM_FILTER),
    [HEARINGS_DATA.COURTROOM_OPTIONS]: hearings.get(HEARINGS_DATA.COURTROOM_OPTIONS),
    [HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID]: hearings.get(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID),
    [HEARINGS_DATA.MANAGE_HEARINGS_DATE]: hearings.get(HEARINGS_DATA.MANAGE_HEARINGS_DATE),

    // People
    getPeopleNeighborsReqState: getReqState(people, PEOPLE_ACTIONS.GET_PEOPLE_NEIGHBORS),

    [EDM.FQN_TO_ID]: edm.get(EDM.FQN_TO_ID),
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Hearings Actions
    loadHearingsForDate,
    setManageHearingsDate,
    setCountyFilter,
    setCourtroomFilter
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(ManageHearingsContainer);
