/*
 * @flow
 */

import React from 'react';
import { Map } from 'immutable';
import styled from 'styled-components';
import { connect } from 'react-redux';

import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import LogoLoader from '../LogoLoader';
import MultiSelectCheckbox from '../MultiSelectCheckbox';
import PSAReviewPersonRowList from '../../containers/review/PSAReviewReportsRowList';
import PSASummary from '../../containers/review/PSASummary';
import { getIdOrValue } from '../../utils/DataUtils';
import { SORT_TYPES, PSA_STATUSES } from '../../utils/consts/Consts';
import { STATUS_OPTION_CHECKBOXES } from '../../utils/consts/ReviewPSAConsts';
import { MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { REVIEW, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';
import {
  AlternateSectionHeader,
  Count,
  StyledColumn,
  StyledColumnRow,
  StyledColumnRowWrapper,
  Wrapper
} from '../../utils/Layout';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { getReqState } from '../../utils/consts/redux/ReduxUtils';
import { PEOPLE_ACTIONS, PEOPLE_DATA } from '../../utils/consts/redux/PeopleConsts';

const { PSA_SCORES, RELEASE_RECOMMENDATIONS } = APP_TYPES;

const { ENTITY_KEY_ID, RELEASE_RECOMMENDATION, STATUS } = PROPERTY_TYPES;


const StyledSectionHeader = styled(AlternateSectionHeader)`
  padding: 0;
`;

const FilterWrapper = styled.div`
  display: flex;
  z-index: 1;
  flex-direction: row;
  white-space: nowrap;
  position: absolute;
  transform: translateX(200px) translateY(50%);
`;

type Props = {
  mostRecentPSANeighbors :Map;
  settings :Map;
  neighbors :Map;
  mostRecentPSA :Map;
  personEKID :string;
  loading :boolean;
  openDetailsModal :() => void;
  selectedPersonData :Map;
}

type State = {
  statusFilters :string[];
}

class PersonOverview extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      statusFilters: [
        PSA_STATUSES.OPEN,
        PSA_STATUSES.SUCCESS,
        PSA_STATUSES.FAILURE,
        PSA_STATUSES.DECLINED,
        PSA_STATUSES.DISMISSED
      ]
    };
  }

  handleCheckboxChange = (e :SyntheticInputEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const { statusFilters } = this.state;
    const values = statusFilters;

    if (checked && !values.includes(value)) {
      values.push(value);
    }
    if (!checked && values.includes(value)) {
      values.splice(values.indexOf(value), 1);
    }

    this.setState({ statusFilters: values });
  }

  renderHeaderSection = (numResults :number) => (
    <StyledSectionHeader>
      PSA History
      <Count>{numResults}</Count>
    </StyledSectionHeader>
  );

  renderStatusOptions = () => {
    const { statusFilters } = this.state;
    const statusOptions = Object.values(STATUS_OPTION_CHECKBOXES);
    const { settings } = this.props;
    const includesPretrialModule = settings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], '');
    return includesPretrialModule
      ? (
        <FilterWrapper>
          <MultiSelectCheckbox
              displayTitle="Filter Status"
              options={statusOptions}
              onChange={this.handleCheckboxChange}
              selected={statusFilters} />
        </FilterWrapper>
      ) : null;
  }

  renderPSAs = () => {
    const {
      neighbors,
      loading,
      personEKID
    } = this.props;
    const { statusFilters } = this.state;
    const scoreSeq = neighbors.get(PSA_SCORES, Map())
      .filter((neighbor) => !!neighbor.get(PSA_NEIGHBOR.DETAILS)
        && statusFilters.includes(neighbor.getIn([PSA_NEIGHBOR.DETAILS, STATUS, 0])))
      .map((neighbor) => [
        neighbor.getIn([PSA_NEIGHBOR.DETAILS, ENTITY_KEY_ID, 0]),
        neighbor.get(PSA_NEIGHBOR.DETAILS)
      ]);
    return (
      <PSAReviewPersonRowList
          loading={loading}
          scoreSeq={scoreSeq}
          sort={SORT_TYPES.DATE}
          renderContent={this.renderHeaderSection}
          component={CONTENT_CONSTS.PROFILE}
          hideCaseHistory
          hideProfile
          personEKID-={personEKID}
          personProfile />
    );
  };

  render() {
    const {
      loading,
      mostRecentPSA,
      mostRecentPSANeighbors,
      openDetailsModal,
      selectedPersonData
    } = this.props;
    const scores = mostRecentPSA.get(PSA_NEIGHBOR.DETAILS, Map());
    const notes = getIdOrValue(
      mostRecentPSANeighbors, RELEASE_RECOMMENDATIONS, RELEASE_RECOMMENDATION
    );

    if (loading) {
      return <LogoLoader loadingText="Loading..." />;
    }
    return (
      <Wrapper>
        <StyledColumn>
          <StyledColumnRowWrapper>
            <StyledColumnRow>
              <PSASummary
                  profile
                  fileNewPSA
                  person={selectedPersonData}
                  notes={notes}
                  scores={scores}
                  neighbors={mostRecentPSANeighbors}
                  openDetailsModal={openDetailsModal} />
            </StyledColumnRow>
          </StyledColumnRowWrapper>
          <StyledColumnRowWrapper>
            <StyledColumnRow>
              {(!loading) ? this.renderStatusOptions() : null}
              {this.renderPSAs()}
            </StyledColumnRow>
          </StyledColumnRowWrapper>
        </StyledColumn>
      </Wrapper>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const review = state.get(STATE.REVIEW);
  const people = state.get(STATE.PEOPLE);
  const settings = state.get(STATE.SETTINGS);

  return {
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    [REVIEW.PSA_NEIGHBORS_BY_ID]: review.get(REVIEW.PSA_NEIGHBORS_BY_ID),
    [REVIEW.LOADING_DATA]: review.get(REVIEW.LOADING_DATA),
    [REVIEW.LOADING_RESULTS]: review.get(REVIEW.LOADING_RESULTS),

    getPersonDataRequestState: getReqState(people, PEOPLE_ACTIONS.GET_PERSON_DATA),
    [PEOPLE_DATA.PERSON_DATA]: people.get(PEOPLE_DATA.PERSON_DATA),

    /* Settings */
    settings: settings.get(SETTINGS_DATA.APP_SETTINGS)
  };
}

// $FlowFixMe
export default connect(mapStateToProps, null)(PersonOverview);
