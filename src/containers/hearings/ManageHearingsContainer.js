/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card,
  CardSegment,
  Select
} from 'lattice-ui-kit';

import HearingSettingsButton from '../../components/hearings/HearingSettingsButton';
import ManageHearingsList from './ManageHearingsList';
import ManageHearingsDetails from './ManageHearingsDetails';
import CountiesDropdown from '../counties/CountiesDropdown';
import DatePicker from '../../components/datetime/DatePicker';
import { DATE_FORMAT } from '../../utils/consts/DateTimeConsts';
import { EDM } from '../../utils/consts/FrontEndStateConsts';
import { OL } from '../../utils/consts/Colors';
import { sortCourtrooms } from '../../utils/DataUtils';


import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { COUNTIES_DATA } from '../../utils/consts/redux/CountiesConsts';
import { HEARINGS_ACTIONS, HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';

import { loadHearingsForDate, setManageHearingsDate, setCountyFilter } from './HearingsActions';

const { PREFERRED_COUNTY } = SETTINGS;

const ManageHearingsBody = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
`;

const StyledTitleWrapper = styled.div`
  color: ${OL.GREY34};
  display: flex;
  justify-content: space-between;
  font-size: 24px;
  margin-bottom: 30px;
  width: 100%;
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
  countyFilter :string,
  courtroomFilter :string,
  manageHearingsDate :DateTime,
  countiesById :Map<*, *>,
  courtroomOptions :Map<*, *>,
  hearingsByTime :Map<*, *>,
  hearingNeighborsById :Map<*, *>,
  loadHearingsForDateReqState :RequestState,
  loadHearingNeighborsReqState :RequestState,
  selectedOrganizationId :string,
  selectedOrganizationSettings :Map<*, *>,
  actions :{
    bulkDownloadPSAReviewPDF :({ peopleEntityKeyIds :string[] }) => void,
    changeHearingFilters :({ county? :string, courtroom? :string }) => void,
    checkPSAPermissions :() => void,
    clearSubmit :() => void,
    downloadPSAReviewPDF :(values :{
      neighbors :Map<*, *>,
      scores :Map<*, *>
    }) => void,
    loadCaseHistory :(values :{
      personId :string,
      neighbors :Map<*, *>
    }) => void,
    loadHearingsForDate :(date :Object) => void
  }
};

class ManageHearingsContainer extends React.Component<Props, *> {
  constructor(props :Props) {
    super(props);
    this.state = {
      selectedHearingEKID: ''
    };
  }

  selectHearing = selectedHearingEKID => this.setState({ selectedHearingEKID });

  componentDidMount() {
    const {
      actions,
      manageHearingsDate,
      hearingsByTime,
      hearingNeighborsById,
      selectedOrganizationId,
      selectedOrganizationSettings
    } = this.props;
    const preferredCountyEKID :UUID = selectedOrganizationSettings.get(PREFERRED_COUNTY, '');
    if (selectedOrganizationId) {
      if (!hearingsByTime.size || !hearingNeighborsById.size) {
        actions.loadHearingsForDate({ manageHearingsDate });
      }
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

  renderCourtroomFilter = () => {
    const {
      actions,
      courtroomOptions,
      loadHearingsForDateReqState,
      loadHearingNeighborsReqState,
    } = this.props;
    const hearingsAreLoading :boolean = requestIsPending(loadHearingsForDateReqState)
      || requestIsPending(loadHearingNeighborsReqState);
    const options :List = courtroomOptions.map((courtroomName) => {
      return {
        label: courtroomName,
        value: courtroomName
      };
    }).sort((cr1, cr2) => sortCourtrooms(cr1.label, cr2.label)).toJS();
    const currentFilterValue = { label: 'All', value: '' };
    options.unshift(currentFilterValue);
    return (
      <Select
          value={currentFilterValue}
          options={options}
          isLoading={hearingsAreLoading}
          onChange={actions.setCourtroomFilter} />
    );
  }

  handleDateChange = (dateStr) => {
    const { actions } = this.props;
    const manageHearingsDate = DateTime.fromFormat(dateStr, DATE_FORMAT);
    if (manageHearingsDate.isValid) {
      actions.setManageHearingsDate({ date: manageHearingsDate });
      actions.loadHearingsForDate({ manageHearingsDate });
    }
  }

  renderManageHearingDate = () => {
    const { manageHearingsDate } = this.props;
    return (
      <DatePicker
          value={manageHearingsDate.toFormat(DATE_FORMAT)}
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
    </Filters>
  )

  renderHeader = () => (
    <StyledTitleWrapper>
      <Title>Manage Hearings</Title>
      <HearingSettingsButton />
    </StyledTitleWrapper>
  )

  render() {
    const { countyFilter, courtroomFilter } = this.props;
    const { selectedHearingEKID } = this.state;
    return (
      <>
        { this.renderHeader() }
        <Card>
          <CardSegment>
            {this.renderFilters()}
          </CardSegment>
          <ManageHearingsBody>
            <ManageHearingsList
                selectHearing={this.selectHearing}
                countyFilter={countyFilter}
                courtroomFilter={courtroomFilter} />
            <ManageHearingsDetails hearingEKID={selectedHearingEKID} />
          </ManageHearingsBody>
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

    [EDM.FQN_TO_ID]: edm.get(EDM.FQN_TO_ID),
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Hearings Actions
    loadHearingsForDate,
    setManageHearingsDate,
    setCountyFilter,
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(ManageHearingsContainer);
