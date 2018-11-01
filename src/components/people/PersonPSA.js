/*
 * @flow
 */

import React from 'react';
import { Map } from 'immutable';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Constants } from 'lattice';

import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import LoadingSpinner from '../LoadingSpinner';
import MultiSelectCheckbox from '../MultiSelectCheckbox';
import PSAReviewPersonRowList from '../../containers/review/PSAReviewReportsRowList';
import PSASummary from '../../containers/review/PSASummary';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getIdOrValue } from '../../utils/DataUtils';
import { SORT_TYPES, PSA_STATUSES } from '../../utils/consts/Consts';
import { STATUS_OPTION_CHECKBOXES } from '../../utils/consts/ReviewPSAConsts';
import {
  AlternateSectionHeader,
  Count,
  StyledColumn,
  StyledColumnRow,
  StyledColumnRowWrapper,
  Wrapper
} from '../../utils/Layout';
import {
  STATE,
  PEOPLE,
  REVIEW,
  PSA_NEIGHBOR,
} from '../../utils/consts/FrontEndStateConsts';

import * as ReviewActionFactory from '../../containers/review/ReviewActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;

const StyledSectionHeader = styled(AlternateSectionHeader)`
  padding: 0;
`;

const FilterWrapper = styled.div`
  display: flex;
  z-index: 1;
  flex-direction: row;
  white-space: nowrap;
  width: 25%;
  position: absolute;
  transform: translateX(200px) translateY(50%);
`;

type Props = {
  psaNeighborsById :Map<*, *>,
  neighbors :Map<*, *>,
  mostRecentPSA :Map<*, *>,
  mostRecentPSAEntityKeyId :string,
  loading :boolean,
  actions :{
    downloadPSAReviewPDF :(values :{
      neighbors :Map<*, *>,
      scores :Map<*, *>
    }) => void,
  }
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

  handleCheckboxChange = (e) => {
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

  renderHeaderSection = numResults => (
    <StyledSectionHeader>
      PSA History
      <Count>{numResults}</Count>
    </StyledSectionHeader>
  );

  renderStatusOptions = () => {
    const { statusFilters } = this.state;
    const statusOptions = Object.values(STATUS_OPTION_CHECKBOXES);
    return (
      <FilterWrapper>
        <MultiSelectCheckbox
            displayTitle="Filter Status"
            options={statusOptions}
            onChange={this.handleCheckboxChange}
            selected={statusFilters} />
      </FilterWrapper>
    );
  }

  renderPSAs = () => {
    const { neighbors, loading } = this.props;
    const { statusFilters } = this.state;
    const scoreSeq = neighbors.get(ENTITY_SETS.PSA_SCORES, Map())
      .filter(neighbor => !!neighbor.get(PSA_NEIGHBOR.DETAILS)
        && statusFilters.includes(neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.STATUS, 0])))
      .map(neighbor => [
        neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]),
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
          personProfile />
    );
  };

  render() {
    const {
      loading,
      mostRecentPSA,
      mostRecentPSAEntityKeyId,
      psaNeighborsById,
      actions
    } = this.props;
    const { downloadPSAReviewPDF } = actions;
    const mostRecentPSANeighbors = psaNeighborsById.get(mostRecentPSAEntityKeyId, Map());
    const scores = mostRecentPSA.get(PSA_NEIGHBOR.DETAILS, Map());
    const notes = getIdOrValue(
      mostRecentPSANeighbors, ENTITY_SETS.RELEASE_RECOMMENDATIONS, PROPERTY_TYPES.RELEASE_RECOMMENDATION
    );
    if (loading) {
      return <LoadingSpinner />;
    }
    return (
      <Wrapper>
        <StyledColumn>
          <StyledColumnRowWrapper>
            <StyledColumnRow>
              <PSASummary
                  profile
                  notes={notes}
                  scores={scores}
                  neighbors={mostRecentPSANeighbors}
                  downloadFn={downloadPSAReviewPDF} />
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
  const review = state.get(STATE.REVIEW);
  const people = state.get(STATE.PEOPLE);

  return {
    [REVIEW.NEIGHBORS_BY_ID]: review.get(REVIEW.NEIGHBORS_BY_ID),
    [REVIEW.LOADING_DATA]: review.get(REVIEW.LOADING_DATA),
    [REVIEW.LOADING_RESULTS]: review.get(REVIEW.LOADING_RESULTS),
    [PEOPLE.FETCHING_PERSON_DATA]: people.get(PEOPLE.FETCHING_PERSON_DATA),
    [PEOPLE.PERSON_DATA]: people.get(PEOPLE.PERSON_DATA),
    [PEOPLE.MOST_RECENT_PSA]: people.get(PEOPLE.MOST_RECENT_PSA),
    [PEOPLE.MOST_RECENT_PSA_ENTITY_KEY]: people.get(PEOPLE.MOST_RECENT_PSA_ENTITY_KEY)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(ReviewActionFactory).forEach((action :string) => {
    actions[action] = ReviewActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PersonOverview);
