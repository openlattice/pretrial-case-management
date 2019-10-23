/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import { Map, Set } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Card,
  CardSegment,
  Select
} from 'lattice-ui-kit';

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

import { loadPSAModal } from '../psamodal/PSAModalActionFactory';
import { clearSubmit } from '../../utils/submit/SubmitActionFactory';
import { loadHearingsForDate, setManageHearingsDate } from './HearingsActions';
import {
  bulkDownloadPSAReviewPDF,
  checkPSAPermissions,
  loadCaseHistory
} from '../review/ReviewActionFactory';

const { PREFERRED_COUNTY } = SETTINGS;

const StyledTitleWrapper = styled.div`
  color: ${OL.GREY34};
  display: flex;
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
  manageHearingsDate :DateTime,
  countiesById :Map<*, *>,
  hearingsByCounty :Map<*, *>,
  hearingsByCourtroom :Map<*, *>,
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

type State = {
  date :Object
}

class ManageHearingsContainer extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      countyFilter: '',
      courtroom: ''
    };
  }

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
      actions.checkPSAPermissions();
      if (!hearingsByTime.size || !hearingNeighborsById.size) {
        actions.loadHearingsForDate(manageHearingsDate);
      }
    }
    this.setState({ countyFilter: preferredCountyEKID });
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
      actions.checkPSAPermissions();
      if (!hearingsByTime.size || !hearingNeighborsById.size || manageHearingsDate !== nextProps.manageHearingsDate) {
        actions.loadHearingsForDate(manageHearingsDate);
        this.setState({ countyFilter: preferredCountyEKID, courtroom: '' });
      }
    }
  }

  getFilterElement = (title, filter) => (
    <FilterElement>
      <FilterTitle>{title}</FilterTitle>
      <div>{filter}</div>
    </FilterElement>
  );

  setCourtroomFilter = filter => this.setState({ courtroom: filter.value });

  renderCourtroomFilter = () => {
    const { courtroom } = this.state;
    const {
      hearingsByCourtroom,
      loadHearingsForDateReqState,
      loadHearingNeighborsReqState,
    } = this.props;
    const hearingsAreLoading :boolean = requestIsPending(loadHearingsForDateReqState)
      || requestIsPending(loadHearingNeighborsReqState);
    const courtroomOptions :List = hearingsByCourtroom.keySeq().map((courtroomName) => {
      return {
        label: courtroomName,
        value: courtroomName
      };
    }).sort((cr1, cr2) => sortCourtrooms(cr1.label, cr2.label)).toJS();
    const currentFilterValue = { label: (courtroom || 'All'), value: courtroom };
    courtroomOptions.unshift(currentFilterValue);
    return (
      <Select
          value={currentFilterValue}
          options={courtroomOptions}
          isLoading={hearingsAreLoading}
          onChange={this.setCourtroomFilter} />
    );
  }

  handleDateChange = (dateStr) => {
    const { actions } = this.props;
    const date = DateTime.fromFormat(dateStr, DATE_FORMAT);
    if (date.isValid) {
      actions.setManageHearingsDate({ date });
      actions.loadHearingsForDate(date);
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

  setCountyFilter = filter => this.setState({ countyFilter: filter.value });

  renderCountyFilter = () => {
    const { countyFilter } = this.state;
    const {
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
          onChange={this.setCountyFilter} />
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
    </StyledTitleWrapper>
  )

  render() {
    console.log(this.props);
    return (
      <>
        { this.renderHeader() }
        <Card>
          <CardSegment>
            {this.renderFilters()}
          </CardSegment>
          <CardSegment>
            body
          </CardSegment>
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
  const courtDate = hearings.get(HEARINGS_DATA.COURT_DATE).toISODate();
  const hearingsByTime = hearings.getIn([HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME, courtDate], Map());
  const courtrooms = hearings.getIn([HEARINGS_DATA.COURTROOMS_BY_DATE, courtDate], Set());
  return {
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_TITLE]: app.get(APP_DATA.SELECTED_ORG_TITLE),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    // Counties
    [COUNTIES_DATA.COUNTIES_BY_ID]: counties.get(COUNTIES_DATA.COUNTIES_BY_ID),

    // Hearings
    courtrooms,
    hearingsByTime,
    loadHearingsForDateReqState: getReqState(hearings, HEARINGS_ACTIONS.LOAD_HEARINGS_FOR_DATE),
    loadHearingNeighborsReqState: getReqState(hearings, HEARINGS_ACTIONS.LOAD_HEARING_NEIGHBORS),
    [HEARINGS_DATA.MANAGE_HEARINGS_DATE]: hearings.get(HEARINGS_DATA.MANAGE_HEARINGS_DATE),
    [HEARINGS_DATA.HEARINGS_BY_DATE]: hearings.get(HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME),
    [HEARINGS_DATA.HEARINGS_BY_COUNTY]: hearings.get(HEARINGS_DATA.HEARINGS_BY_COUNTY),
    [HEARINGS_DATA.HEARINGS_BY_COURTROOM]: hearings.get(HEARINGS_DATA.HEARINGS_BY_COURTROOM),
    [HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID]: hearings.get(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID),

    [EDM.FQN_TO_ID]: edm.get(EDM.FQN_TO_ID),
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Hearings Actions
    loadHearingsForDate,
    setManageHearingsDate,
    // PSA Modal actions
    loadPSAModal,
    // Review actions
    bulkDownloadPSAReviewPDF,
    checkPSAPermissions,
    loadCaseHistory,
    // Submit Actions
    clearSubmit
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(ManageHearingsContainer);
