/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { SearchInput } from 'lattice-ui-kit';
import { DateTime } from 'luxon';
import { Map, Set, List } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ManageHearingsListItem from '../../components/managehearings/ManageHearingsListItem';
import { OL } from '../../utils/consts/Colors';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { COURT, PSA_ASSOCIATION } from '../../utils/consts/FrontEndStateConsts';
import { TIME_FORMAT } from '../../utils/consts/DateTimeConsts';
import { formatDate } from '../../utils/FormattingUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { HEARINGS_ACTIONS, HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';
import { getReqState } from '../../utils/consts/redux/ReduxUtils';
import { getEntityProperties } from '../../utils/DataUtils';

import { bulkDownloadPSAReviewPDF } from '../review/ReviewActionFactory';

const { PEOPLE } = APP_TYPES;

const {
  COMPLETED_DATE_TIME,
  COURTROOM,
  DATE_TIME,
  ENTITY_KEY_ID,
  FIRST_NAME,
  HEARING_TYPE,
  LAST_NAME,
  MIDDLE_NAME
} = PROPERTY_TYPES;


const ManageHearingsList = styled.div`
  width: 100%;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
`;

const HeaderItem = styled.div`
  font-size: 14px;
  width: 100%;
  padding: 15px 30px;
  border-bottom: 1px solid ${OL.GREY11};
`;

const HearingType = styled.div`
  font-size: 12px;
  font-style: italic;
`;

const HearingTime = styled(HeaderItem)`
  font-size: 18px;
  font-weight: 600;
  background: ${OL.GREY09};
`;

type Props = {
  courtroomFilter :string,
  countyFilter :string,
  hearingsByCounty :Map<*, *>,
  hearingsByTime :Map<*, *>,
  hearingNeighborsById :Map<*, *>,
  peopleIdsToOpenPSAIds :Map<*, *>,
  peopleReceivingReminders :Set<*>,
  peopleWithMultipleOpenPsas :Set<*>,
  psaEditDatesById :Map<*, *>,
  actions :{
    bulkDownloadPSAReviewPDF :({ peopleEntityKeyIds :string[] }) => void
  }
};

class ManageHearingsContainer extends React.Component<Props, *> {
  constructor(props :Props) {
    super(props);
    this.state = {
      searchTerm: ''
    };
  }
  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  renderSearch = () => {
    const { searchTerm } = this.state;
    return <SearchInput onChange={this.handleInputChange} name="searchTerm" value={searchTerm} />
  }

  filterByPeople = (hearing) => {
    const { searchTerm } = this.state;
    const { hearingNeighborsById } = this.props;
    const { [ENTITY_KEY_ID]: hearingEKID } = getEntityProperties(hearing, [ENTITY_KEY_ID]);
    const person = hearingNeighborsById.getIn([hearingEKID, PEOPLE], Map());
    const {
      [FIRST_NAME]: firstName,
      [MIDDLE_NAME]: middleName,
      [LAST_NAME]: lastName,
    } = getEntityProperties(person, [FIRST_NAME, MIDDLE_NAME, LAST_NAME]);
    return firstName.toLowerCase().includes(searchTerm.toLowerCase())
      || middleName.toLowerCase().includes(searchTerm.toLowerCase())
      || lastName.toLowerCase().includes(searchTerm.toLowerCase());
  }

  sortHearings = (h1, h2) => {
    const { hearingNeighborsById } = this.props;
    const { [ENTITY_KEY_ID]: h1EKID } = getEntityProperties(h1, [ENTITY_KEY_ID]);
    const { [ENTITY_KEY_ID]: h2EKID } = getEntityProperties(h2, [ENTITY_KEY_ID]);
    const person1 = hearingNeighborsById.getIn([h1EKID, PEOPLE], Map());
    const person2 = hearingNeighborsById.getIn([h2EKID, PEOPLE], Map());
    const {
      [FIRST_NAME]: firstName1,
      [MIDDLE_NAME]: middleName1,
      [LAST_NAME]: lastName1,
    } = getEntityProperties(person1, [FIRST_NAME, MIDDLE_NAME, LAST_NAME]);
    const {
      [FIRST_NAME]: firstName2,
      [MIDDLE_NAME]: middleName2,
      [LAST_NAME]: lastName2,
    } = getEntityProperties(person2, [FIRST_NAME, MIDDLE_NAME, LAST_NAME]);

    if (lastName1 !== lastName2) return lastName1 > lastName2 ? 1 : -1;
    if (firstName1 !== firstName2) return firstName1 > firstName2 ? 1 : -1;
    if (middleName1 !== middleName2) return middleName1 > middleName2 ? 1 : -1;
    return 0;
  }

  renderHearingsByTimeAndCourtroom = () => {
    const {
      courtroomFilter,
      countyFilter,
      hearingsByTime,
      hearingsByCounty,
      hearingNeighborsById,
      peopleIdsToOpenPSAIds,
      peopleReceivingReminders,
      peopleWithMultipleOpenPsas,
      psaEditDatesById
    } = this.props;
    const hearinIdsForCountyFilter = hearingsByCounty.get(countyFilter, Set());

    const hearingsByTimeAndCourtroom = Map().withMutations((mutableMap) => {
      hearingsByTime.entrySeq().forEach(([time, hearings]) => {
        if (hearings.size) {
          hearings
            .sort((h1, h2) => this.sortHearings(h1, h2))
            .filter(this.filterByPeople)
            .forEach((hearing) => {
              let shouldInclude = true;
              const {
                [COURTROOM]: hearingCourtroom,
                [ENTITY_KEY_ID]: hearingEKID,
                [HEARING_TYPE]: hearingType
              } = getEntityProperties(hearing, [COURTROOM, ENTITY_KEY_ID, HEARING_TYPE]);
              const hearingNeighbors = hearingNeighborsById.get(hearingEKID, Map());
              if (courtroomFilter.length && hearingCourtroom !== courtroomFilter) shouldInclude = false;
              if (countyFilter.length && !hearinIdsForCountyFilter.includes(hearingEKID)) shouldInclude = false;
              if (shouldInclude) {
                const person = hearingNeighbors.get(PEOPLE, Map());
                const {
                  [ENTITY_KEY_ID]: personEKID,
                } = getEntityProperties(person, [ENTITY_KEY_ID]);
                const psaEKID :string = peopleIdsToOpenPSAIds.get(personEKID, '');
                const isReceivingReminders :boolean = peopleReceivingReminders.includes(personEKID);
                const hasMultipleOpenPSAs :boolean = peopleWithMultipleOpenPsas.includes(personEKID);

                const completedDateFromAssociation = psaEditDatesById
                  .getIn([psaEKID, PSA_ASSOCIATION.DETAILS, COMPLETED_DATE_TIME, 0], '');
                const dateTimeFromAssociation = psaEditDatesById
                  .getIn([psaEKID, PSA_ASSOCIATION.DETAILS, DATE_TIME, 0], '');
                const editDateFromPSA = psaEditDatesById.getIn([psaEKID, DATE_TIME], '');
                const lastEditDateString = completedDateFromAssociation || dateTimeFromAssociation || editDateFromPSA;

                const lastEditDate :string = formatDate(lastEditDateString);

                mutableMap.setIn(
                  [time, `${hearingCourtroom}-${hearingType}`],
                  mutableMap
                    .getIn([time, `${hearingCourtroom}-${hearingType}`], List()).push(
                      <ManageHearingsListItem
                          hearingNeighbors={hearingNeighbors}
                          lastEditDate={lastEditDate}
                          isReceivingReminders={isReceivingReminders}
                          hasMultipleOpenPSAs={hasMultipleOpenPSAs} />
                    )
                );
              }
            });
        }
      });
    });
    const hearingTimes = hearingsByTimeAndCourtroom.keySeq().sort((h1DateTime, h2DateTime) => {
      const h1DT = DateTime.fromFormat(h1DateTime, TIME_FORMAT);
      const h2DT = DateTime.fromFormat(h2DateTime, TIME_FORMAT);
      return h1DT < h2DT ? -1 : 1;
    });
    return hearingTimes.map((time) => {
      const hearingsByCoutroom = hearingsByTimeAndCourtroom.get(time, Map());
      return (
        <>
          <HearingTime>{time}</HearingTime>
          {
            hearingsByCoutroom.entrySeq().map(([courtroomHearingTypeString, hearings]) => {
              const courtroomHearingTypeArray = courtroomHearingTypeString.split('-');
              const courtroom = courtroomHearingTypeArray[0];
              const hearingType = courtroomHearingTypeArray[1];
              return (
                <>
                  <HeaderItem>
                    {courtroom}
                    <HearingType>{hearingType}</HearingType>
                  </HeaderItem>
                  {hearings}
                </>
              );
            })
          }
        </>
      );
    });
  }

  render() {
    return (
      <ManageHearingsList>
        <HeaderItem>{this.renderSearch()}</HeaderItem>
        { this.renderHearingsByTimeAndCourtroom() }
      </ManageHearingsList>
    );
  }
}

function mapStateToProps(state) {
  const court = state.get(STATE.COURT);
  const hearings = state.get(STATE.HEARINGS);
  const hearingDate = hearings.get(HEARINGS_DATA.MANAGE_HEARINGS_DATE).toISODate();
  const hearingsByTime = hearings.getIn([HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME, hearingDate], Map());
  return {
    // Court
    [COURT.PEOPLE_WITH_OPEN_PSAS]: court.get(COURT.PEOPLE_WITH_OPEN_PSAS),
    [COURT.PEOPLE_WITH_MULTIPLE_OPEN_PSAS]: court.get(COURT.PEOPLE_WITH_MULTIPLE_OPEN_PSAS),
    [COURT.PEOPLE_RECEIVING_REMINDERS]: court.get(COURT.PEOPLE_RECEIVING_REMINDERS),
    [COURT.PSA_EDIT_DATES]: court.get(COURT.PSA_EDIT_DATES),
    [COURT.OPEN_PSA_IDS]: court.get(COURT.OPEN_PSA_IDS),
    [COURT.PEOPLE_IDS_TO_OPEN_PSA_IDS]: court.get(COURT.PEOPLE_IDS_TO_OPEN_PSA_IDS),

    // Hearings
    hearingsByTime,
    loadHearingsForDateReqState: getReqState(hearings, HEARINGS_ACTIONS.LOAD_HEARINGS_FOR_DATE),
    loadHearingNeighborsReqState: getReqState(hearings, HEARINGS_ACTIONS.LOAD_HEARING_NEIGHBORS),
    [HEARINGS_DATA.HEARINGS_BY_COUNTY]: hearings.get(HEARINGS_DATA.HEARINGS_BY_COUNTY),
    [HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID]: hearings.get(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID),
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Review actions
    bulkDownloadPSAReviewPDF,
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(ManageHearingsContainer);
