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
import { TIME_FORMAT } from '../../utils/consts/DateTimeConsts';
import { formatDate } from '../../utils/FormattingUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getEntityProperties } from '../../utils/DataUtils';
import { getOpenPSAs } from '../../utils/PSAUtils';
import { getPreferredMobileContacts } from '../../utils/ContactInfoUtils';

import { HEARINGS_ACTIONS, HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';
import { PEOPLE_ACTIONS, PEOPLE_DATA } from '../../utils/consts/redux/PeopleConsts';
import { getReqState } from '../../utils/consts/redux/ReduxUtils';

import { bulkDownloadPSAReviewPDF } from '../review/ReviewActionFactory';

const {
  CONTACT_INFORMATION,
  PEOPLE,
  PSA_SCORES,
  SUBSCRIPTION
} = APP_TYPES;

const {
  COURTROOM,
  DATE_TIME,
  ENTITY_KEY_ID,
  FIRST_NAME,
  HEARING_TYPE,
  IS_ACTIVE,
  LAST_NAME,
  MIDDLE_NAME
} = PROPERTY_TYPES;


const ManageHearingsList = styled.div`
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
`;

const ListInnerWrapper = styled.div`
  flex-basis: 400px;
  flex-grow: 1;
  overflow: hidden;
  overflow-y: scroll;
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
  peopleNeighborsById :Map<*, *>,
  selectHearing :() => void,
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
    return <SearchInput onChange={this.handleInputChange} name="searchTerm" value={searchTerm} />;
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
      peopleNeighborsById,
      selectHearing
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
                const personNeighbors = peopleNeighborsById.get(personEKID, Map());
                const personPSAs = personNeighbors.get(PSA_SCORES, List());
                const personOpenPSAs = getOpenPSAs(personPSAs);
                const personContacts = personNeighbors.get(CONTACT_INFORMATION, List());
                const personPreferredContacts = getPreferredMobileContacts(personContacts);
                const personSubscription = personNeighbors.get(SUBSCRIPTION, Map());
                const { [IS_ACTIVE]: subscriptionIsActive } = getEntityProperties(personSubscription, [IS_ACTIVE]);
                const hearingPSA = hearingNeighbors.get(PSA_SCORES, Map());
                const { [DATE_TIME]: psaDate } = getEntityProperties(hearingPSA, [DATE_TIME]);

                const psaCreationDate :string = formatDate(psaDate);

                mutableMap.setIn(
                  [time, `${hearingCourtroom}-${hearingType}`],
                  mutableMap
                    .getIn([time, `${hearingCourtroom}-${hearingType}`], List()).push(
                      <ManageHearingsListItem
                          hearingEKID={hearingEKID}
                          selectHearing={selectHearing}
                          hearingNeighbors={hearingNeighbors}
                          lastEditDate={psaCreationDate}
                          isReceivingReminders={subscriptionIsActive && personPreferredContacts.size}
                          hasMultipleOpenPSAs={personOpenPSAs.size > 1} />
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
          <HearingTime key={time}>{time}</HearingTime>
          {
            hearingsByCoutroom.entrySeq().map(([courtroomHearingTypeString, hearings]) => {
              const courtroomHearingTypeArray = courtroomHearingTypeString.split('-');
              const courtroom = courtroomHearingTypeArray[0];
              const hearingType = courtroomHearingTypeArray[1];
              return (
                <>
                  <HeaderItem key={courtroomHearingTypeString}>
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
        <HeaderItem key="headerItem">{this.renderSearch()}</HeaderItem>
        <ListInnerWrapper>
          { this.renderHearingsByTimeAndCourtroom() }
        </ListInnerWrapper>
      </ManageHearingsList>
    );
  }
}

function mapStateToProps(state) {
  const hearings = state.get(STATE.HEARINGS);
  const people = state.get(STATE.PEOPLE);
  const hearingDate = hearings.get(HEARINGS_DATA.MANAGE_HEARINGS_DATE).toISODate();
  const hearingsByTime = hearings.getIn([HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME, hearingDate], Map());
  return {
    // Hearings
    hearingsByTime,
    loadHearingsForDateReqState: getReqState(hearings, HEARINGS_ACTIONS.LOAD_HEARINGS_FOR_DATE),
    loadHearingNeighborsReqState: getReqState(hearings, HEARINGS_ACTIONS.LOAD_HEARING_NEIGHBORS),
    [HEARINGS_DATA.HEARINGS_BY_COUNTY]: hearings.get(HEARINGS_DATA.HEARINGS_BY_COUNTY),
    [HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID]: hearings.get(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID),

    // People
    getPeopleNeighborsRequestState: getReqState(people, PEOPLE_ACTIONS.GET_PEOPLE_NEIGHBORS),
    [PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID]: people.get(PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, Map()),
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Review actions
    bulkDownloadPSAReviewPDF,
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(ManageHearingsContainer);
