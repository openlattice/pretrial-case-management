/*
 * @flow
 */
/* stylelint-disable declaration-colon-newline-after */

import React from 'react';
import type { Element } from 'react';

import styled, { css } from 'styled-components';
import {
  List,
  Map,
  Seq,
  Set
} from 'immutable';
import { PaginationToolbar } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { Dispatch } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { downloadPSAReviewPDF, loadCaseHistory } from './ReviewActions';

import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import LoadingSpinner from '../../components/LoadingSpinner';
import PSAFailureStats from '../../components/review/PSAFailureStats';
import PSAReviewReportsRow from '../../components/review/PSAReviewReportsRow';
// Redux State Imports
import REVIEW_DATA from '../../utils/consts/redux/ReviewConsts';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getEntityKeyId } from '../../utils/DataUtils';
import { NoResults } from '../../utils/Layout';
import { sortByDate, sortByName } from '../../utils/PSAUtils';
import { MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { OL } from '../../utils/consts/Colors';
import { PSA_FAILURE_REASONS, PSA_STATUSES, SORT_TYPES } from '../../utils/consts/Consts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_MODAL, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { PEOPLE_DATA } from '../../utils/consts/redux/PeopleConsts';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { loadHearingNeighbors } from '../hearings/HearingsActions';
import { loadPSAModal } from '../psamodal/PSAModalActionFactory';

const { PEOPLE, PSA_SCORES } = APP_TYPES;

const getSubBarStyles = (props :Object) => {
  switch (props.component) {
    case CONTENT_CONSTS.PENDING_PSAS:
      return css`
        background: white;
        border-radius: 5px;
        border: solid 1px ${OL.GREY11};
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        padding: 0 0 10px 30px;
        font-size: 14px;
        text-align: center;
      `;
    default:
      return css``;
  }
};

const StyledCenteredContainer = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const StyledSubHeaderBar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  ${getSubBarStyles};
`;

const PersonWrapper = styled.div`
  padding: 30px;
`;

const ReviewWrapper = styled.div`
  width: 100%;
`;

const SpinnerWrapper = styled.div`
  margin: 20px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const ReviewRowWrapper = styled.div`
  padding-left: 30px;
`;

const SubContentWrapper = styled.div`
  width: 100%;
  background: white;
  border-radius: 5px;
  border: solid 1px ${OL.GREY11};
  box-sizing: border-box;
  padding: 20px 30px;
  margin-bottom: 30px;
`;

type Props = {
  actions :{
    downloadPSAReviewPDF :RequestSequence;
    loadCaseHistory :RequestSequence;
    loadHearingNeighbors :RequestSequence;
    loadPSAModal :RequestSequence;
  };
  app :Map;
  component :?string;
  entitySetsByOrganization :Map;
  filterType :string;
  hearingIds :Set;
  hideCaseHistory? :boolean;
  loading :boolean;
  neighbors :Map;
  peopleNeighborsById :Map;
  personEKID :string;
  psaNeighborsById :Map;
  renderContent :?((numResults :number) => ?Element<*>);
  renderSubContent :?(() => void);
  scoreSeq :Seq;
  selectedOrganizationSettings :Map;
  sort? :?string;
}

type State = {
  start :number;
}

const MAX_PAGE_SIZE = 4;

class PSAReviewReportsRowList extends React.Component<Props, State> {

  static defaultProps = {
    sort: SORT_TYPES.DATE,
    hideCaseHistory: false
  }

  constructor(props :Props) {
    super(props);
    this.state = {
      start: 1
    };
  }

  componentDidUpdate(prevProps :Props) {
    let { start } = this.state;
    const {
      actions,
      filterType,
      hearingIds,
      scoreSeq
    } = this.props;
    if (filterType && (filterType !== prevProps.filterType)) {
      this.setState({ start: 1 });
    }
    if (scoreSeq.size !== prevProps.scoreSeq.size) {
      const numResults = prevProps.scoreSeq.size;
      const numPages = Math.ceil(numResults / MAX_PAGE_SIZE);
      const currPage = (start / MAX_PAGE_SIZE) + 1;

      if (currPage > numPages) start = (numPages - 1) * MAX_PAGE_SIZE;
      if (start <= 1) start = 1;
      this.setState({ start });
    }
    if (hearingIds.size !== prevProps.hearingIds.size) {
      actions.loadHearingNeighbors({ hearingIds: prevProps.hearingIds.toJS() });
    }
  }

  loadCaseHistoryCallback = (personEKID :UUID, psaNeighbors :Map) => {
    const { actions } = this.props;
    actions.loadCaseHistory({ personEKID, neighbors: psaNeighbors });
  }

  renderRow = (scoreId :UUID, scores :Map) => {
    const {
      app,
      psaNeighborsById,
      entitySetsByOrganization,
      component,
      actions,
      hideCaseHistory,
      selectedOrganizationSettings
    } = this.props;
    const psaScoresEntitySetId = getEntitySetIdFromApp(app, PSA_SCORES);
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);

    const neighbors = psaNeighborsById.get(scoreId, Map());
    const person = neighbors.get(PEOPLE, Map());
    const personEKID = getEntityKeyId(person);

    const hideProfile = (
      component === CONTENT_CONSTS.PROFILE || component === CONTENT_CONSTS.PENDING_PSAS
    );
    return (
      <PSAReviewReportsRow
          includesPretrialModule={includesPretrialModule}
          entitySetIdsToAppType={entitySetsByOrganization}
          psaNeighbors={neighbors}
          scores={scores}
          scoresEntitySetId={psaScoresEntitySetId}
          personEKID={personEKID}
          entityKeyId={scoreId}
          loadCaseHistoryFn={this.loadCaseHistoryCallback}
          loadHearingNeighbors={actions.loadHearingNeighbors}
          loadPSAModal={actions.loadPSAModal}
          key={scoreId}
          hideCaseHistory={hideCaseHistory}
          hideProfile={hideProfile}
          component={component} />
    );
  }

  updatePage = ({ page } :Object) => {
    this.setState({ start: page });
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  renderHeaderBar = (numResults :number) => {
    const { component, renderContent } = this.props;
    return (
      <StyledCenteredContainer>
        <StyledSubHeaderBar component={component}>
          {renderContent && renderContent(numResults)}
        </StyledSubHeaderBar>
      </StyledCenteredContainer>
    );
  }

  renderFTAStats = () => {
    const { peopleNeighborsById, personEKID, neighbors } = this.props;
    if (personEKID && neighbors.size) {
      const personPSAs = peopleNeighborsById.getIn([personEKID, PSA_SCORES], Map());
      let psaFailures = 0;
      let ftas = 0;
      personPSAs.forEach((psa) => {
        const psaDetails = psa.get(PSA_NEIGHBOR.DETAILS, Map());
        const failure = psaDetails.getIn([PROPERTY_TYPES.STATUS, 0], '') === PSA_STATUSES.FAILURE;
        const failureIsFTA = psaDetails.getIn([PROPERTY_TYPES.FAILURE_REASON, 0], '') === PSA_FAILURE_REASONS.FTA;
        if (failure) psaFailures += 1;
        if (failureIsFTA) ftas += 1;
      });
      return (
        <PSAFailureStats padding={false} failures={psaFailures} ftas={ftas} />
      );
    }
    return null;
  }

  sortItems = () => {
    const {
      sort,
      scoreSeq,
      psaNeighborsById
    } = this.props;
    if (!sort) return scoreSeq;
    return sort === SORT_TYPES.DATE
      ? (
        scoreSeq.sort((scores1, scores2) => sortByDate(scores1[1], scores2[1]))
      )
      : (
        scoreSeq.sort(([id1], [id2]) => sortByName(
          psaNeighborsById.get(id1, Map()),
          psaNeighborsById.get(id2, Map())
        ))
      );
  }

  renderContent = (items :List, numPages :number, noResults :boolean) => {
    const { component, renderSubContent } = this.props;

    switch (component) {
      case CONTENT_CONSTS.PENDING_PSAS:
        return (
          <ReviewWrapper>
            {this.renderHeaderBar(numPages)}
            <SubContentWrapper>
              {renderSubContent && renderSubContent()}
            </SubContentWrapper>
            <ReviewRowWrapper>
              {items.map(([scoreId, scores]) => this.renderRow(scoreId, scores))}
            </ReviewRowWrapper>
            {this.renderHeaderBar(numPages)}
          </ReviewWrapper>
        );
      case CONTENT_CONSTS.PROFILE:
        if (noResults) {
          return (
            <PersonWrapper>
              {this.renderHeaderBar(numPages)}
              <NoResults>No Results</NoResults>
            </PersonWrapper>
          );
        }
        return (
          <PersonWrapper>
            {this.renderHeaderBar(numPages)}
            { this.renderFTAStats() }
            {items.map(([scoreId, scores]) => this.renderRow(scoreId, scores))}
          </PersonWrapper>
        );
      default:
        return (
          <ReviewWrapper>
            {this.renderHeaderBar(numPages)}
            {items.map(([scoreId, scores]) => this.renderRow(scoreId, scores))}
            {this.renderHeaderBar(numPages)}
          </ReviewWrapper>
        );
    }
  }

  render() {
    const {
      scoreSeq,
      loading
    } = this.props;
    const { start } = this.state;

    if (loading) return <SpinnerWrapper><LoadingSpinner /></SpinnerWrapper>;

    const items = this.sortItems().slice(start - 1, start + MAX_PAGE_SIZE - 1);
    const numPages = scoreSeq.length || scoreSeq.size;

    const noResults = numPages === 0;

    return (
      <ReviewWrapper>
        {this.renderContent(items, numPages, noResults)}
        <PaginationToolbar
            count={numPages}
            page={start}
            onPageChange={this.updatePage}
            rowsPerPage={MAX_PAGE_SIZE} />
      </ReviewWrapper>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const orgId = app.get(APP_DATA.SELECTED_ORG_ID, '');
  const people = state.get(STATE.PEOPLE);
  const review = state.get(STATE.REVIEW);
  const psaModal = state.get(STATE.PSA_MODAL);
  // TODO: Address prop names so that consts can be used as keys
  return {
    app,
    [APP_DATA.ENTITY_SETS_BY_ORG]: app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId], Map()),
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    [REVIEW_DATA.PSA_NEIGHBORS_BY_ID]: review.get(REVIEW_DATA.PSA_NEIGHBORS_BY_ID),
    readOnlyPermissions: review.get(REVIEW_DATA.READ_ONLY),

    [PSA_MODAL.HEARING_IDS]: psaModal.get(PSA_MODAL.HEARING_IDS),

    [PEOPLE_DATA.PERSON_DATA]: people.get(PEOPLE_DATA.PERSON_DATA),
    [PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID]: people.get(PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, Map()),
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    loadHearingNeighbors,
    loadCaseHistory,
    loadPSAModal,
    downloadPSAReviewPDF
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(PSAReviewReportsRowList);
