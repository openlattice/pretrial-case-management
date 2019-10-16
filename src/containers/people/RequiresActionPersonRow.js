/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import { fromJS, Map, List } from 'immutable';
import { connect } from 'react-redux';

import LogoLoader from '../../components/LogoLoader';
import { OL } from '../../utils/consts/Colors';
import { getEntityProperties } from '../../utils/DataUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PEOPLE, SEARCH } from '../../utils/consts/FrontEndStateConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

const { PSA_SCORES } = APP_TYPES;
const {
  DATE_TIME,
  DOB,
  ENTITY_KEY_ID,
  FIRST_NAME,
  LAST_NAME,
} = PROPERTY_TYPES;

const RequiresActionRowWrapper = styled.tr.attrs(() => ({ tabIndex: '1' }))`
  border-bottom: 1px solid ${OL.GREY11};
  background: ${props => (props.selected ? OL.PURPLE06 : '')};
`;

const CellContent = styled.div`
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const StyledCell = styled.td`
  padding: 10px 10px;
  text-align: ${props => props.align || 'left'};
  word-wrap: break-word;
`;

type Props = {
  data :Map<*, *>,
  handleSelect :() => void;
  loadingRequiresActionPeople :boolean,
  requiresActionPeopleNeighbors :Map<*, *>,
  selectedPersonId :string,
  actions :{
    loadPSAsByDate :(filter :string) => void
  }
};

class RequiresActionPersonRow extends React.Component<Props, State> {

  getPersonData = () => {
    const { data, requiresActionPeopleNeighbors } = this.props;
    const {
      [DOB]: dob,
      [FIRST_NAME]: firstName,
      [LAST_NAME]: lastName,
      [ENTITY_KEY_ID]: personEKID,
    } = getEntityProperties(fromJS(data), [DOB, FIRST_NAME, LAST_NAME, ENTITY_KEY_ID]);
    let oldestPSADate;
    let newestPSADate;
    requiresActionPeopleNeighbors.getIn([personEKID, PSA_SCORES], List()).forEach((psaScore) => {
      const { [DATE_TIME]: psaCreationDate } = getEntityProperties(psaScore, [DATE_TIME]);
      const psaDateTime = DateTime.fromISO(psaCreationDate);
      if (!oldestPSADate || oldestPSADate > psaDateTime) oldestPSADate = psaDateTime;
      if (!newestPSADate || newestPSADate < psaDateTime) newestPSADate = psaDateTime;
    });
    return {
      dob,
      firstName,
      lastName,
      newestPSADate: newestPSADate.toISODate(),
      oldestPSADate: oldestPSADate.toISODate(),
      personEKID
    };
  }

  render() {
    const { handleSelect, loadingRequiresActionPeople, selectedPersonId } = this.props;
    if (loadingRequiresActionPeople) {
      return <LogoLoader loadingText="Loading..." />;
    }
    const {
      dob,
      firstName,
      lastName,
      newestPSADate,
      oldestPSADate,
      personEKID
    } = this.getPersonData();
    const selected :boolean = selectedPersonId === personEKID;
    return (
      <RequiresActionRowWrapper
          onClick={() => handleSelect(personEKID)}
          selected={selected}>
        <StyledCell>
          <CellContent>
            { lastName }
          </CellContent>
        </StyledCell>
        <StyledCell>
          <CellContent>
            { firstName }
          </CellContent>
        </StyledCell>
        <StyledCell>
          <CellContent>
            { dob }
          </CellContent>
        </StyledCell>
        <StyledCell>
          <CellContent>
            { newestPSADate }
          </CellContent>
        </StyledCell>
        <StyledCell>
          <CellContent>
            { oldestPSADate }
          </CellContent>
        </StyledCell>
      </RequiresActionRowWrapper>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const people = state.get(STATE.PEOPLE);
  const search = state.get(STATE.SEARCH);
  const orgId = app.get(APP_DATA.SELECTED_ORG_ID);
  return {
    [APP_DATA.SELECTED_ORG_ID]: orgId,
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),
    entitySetIdsToAppType: app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId], Map()),

    [PEOPLE.REQUIRES_ACTION_PEOPLE]: people.get(PEOPLE.REQUIRES_ACTION_PEOPLE),
    [PEOPLE.REQUIRES_ACTION_NEIGHBORS]: people.get(PEOPLE.REQUIRES_ACTION_NEIGHBORS),

    [SEARCH.LOADING]: search.get(SEARCH.LOADING)
  };
}

export default connect(mapStateToProps, null)(RequiresActionPersonRow);
