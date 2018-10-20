/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';

import PSAReviewReportsRow from '../../components/review/PSAReviewReportsRow';
import LoadingSpinner from '../../components/LoadingSpinner';
import CustomPagination from '../../components/Pagination';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { SORT_TYPES } from '../../utils/consts/Consts';
import { sortByDate, sortByName } from '../../utils/PSAUtils';
import { getEntityKeyId, getIdValue } from '../../utils/DataUtils';
import {
  STATE,
  REVIEW,
  SUBMIT,
  PEOPLE,
  COURT
} from '../../utils/consts/FrontEndStateConsts';

import * as FormActionFactory from '../psa/FormActionFactory';
import * as ReviewActionFactory from './ReviewActionFactory';
import * as CourtActionFactory from '../court/CourtActionFactory';
import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';
import * as DataActionFactory from '../../utils/data/DataActionFactory';

const StyledCenteredContainer = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const StyledSubHeaderBar = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  ${(props) => {
    switch (props.component) {
      case CONTENT_CONSTS.REVIEW:
        return (
          `background: #fff;
           border-radius: 5px;
           border: solid 1px #e1e1eb;
           border-top-left-radius: 0;
           border-top-right-radius: 0;
           padding: 0 0 10px 30px;
           font-size: 14px;
           text-align: center;`
        );
      case CONTENT_CONSTS.PENDING_PSAS:
        return (
          `background: #fff;
           border-radius: 5px;
           border: solid 1px #e1e1eb;
           border-top-left-radius: 0;
           border-top-right-radius: 0;
           padding: 0 0 10px 30px;
           font-size: 14px;
           text-align: center;`
        );
      default:
        return '';
    }
  }};
`;

const PersonWrapper = styled.div`
  padding: 30px;
  width: 100%;
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

const NoResults = styled.div`
  margin: 0 -30px 30px;
  font-size: 16px;
  text-align: center;
  width: 960px;
`;

const ReviewRowWrapper = styled.div`
  padding-left: 30px;
`;

const SubContentWrapper = styled.div`
  width: 100%;
  background: #fff;
  border-radius: 5px;
  border: solid 1px #e1e1eb;
  padding: 20px 30px;
  margin-bottom: 30px;
`;

type Props = {
  scoreSeq :Immutable.Seq,
  sort? :?string,
  component :?string,
  hideCaseHistory? :boolean,
  onStatusChangeCallback? :() => void,
  renderContent :?(() => void),
  renderSubContent :?(() => void),
  actions :{
    downloadPSAReviewPDF :(values :{
      neighbors :Immutable.Map<*, *>,
      scores :Immutable.Map<*, *>
    }) => void,
    loadCaseHistory :(values :{
      personId :string,
      neighbors :Immutable.Map<*, *>
    }) => void,
    loadHearingNeighbors :(hearingIds :string[]) => void,
    loadJudges :() => void,
    checkPSAPermissions :() => void,
    refreshPSANeighbors :({ id :string }) => void,
    submit :(value :{ config :Object, values :Object}) => void,
    replaceEntity :(value :{ entitySetName :string, entityKeyId :string, values :Object }) => void,
    deleteEntity :(value :{ entitySetName :string, entityKeyId :string }) => void,
    clearSubmit :() => void,
  },
  psaNeighborsById :Immutable.Map<*, *>,
  caseHistory :Immutable.List<*>,
  manualCaseHistory :Immutable.List<*>,
  chargeHistory :Immutable.Map<*, *>,
  manualChargeHistory :Immutable.Map<*, *>,
  sentenceHistory :Immutable.Map<*, *>,
  ftaHistory :Immutable.Map<*, *>,
  hearings :Immutable.List<*>,
  psaIdsRefreshing :Immutable.Set<*>,
  readOnlyPermissions :boolean,
  loadingPSAData :boolean,
  scoresEntitySetId :string,
  submitting :boolean
}

type State = {
  start :number
}

const MAX_RESULTS = 4;

class PSAReviewReportsRowList extends React.Component<Props, State> {

  static defaultProps = {
    sort: SORT_TYPES.DATE,
    hideCaseHistory: false,
    onStatusChangeCallback: () => {}
  }

  constructor(props :Props) {
    super(props);
    this.state = {
      start: 0
    };
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.checkPSAPermissions();
    actions.loadJudges();
  }

  componentWillUnmount() {
    const { actions } = this.props;
    actions.clearSubmit();
  }

  renderRow = (scoreId, scores) => {
    const {
      psaNeighborsById,
      caseHistory,
      manualCaseHistory,
      chargeHistory,
      manualChargeHistory,
      sentenceHistory,
      ftaHistory,
      hearings,
      component,
      scoresEntitySetId,
      actions,
      onStatusChangeCallback,
      psaIdsRefreshing,
      readOnlyPermissions,
      hideCaseHistory,
      submitting
    } = this.props;

    const {
      downloadPSAReviewPDF,
      loadCaseHistory,
      loadHearingNeighbors,
      submit,
      replaceEntity,
      deleteEntity,
      refreshPSANeighbors
    } = actions;

    const neighbors = psaNeighborsById.get(scoreId, Immutable.Map());
    const personId = getEntityKeyId(neighbors, ENTITY_SETS.PEOPLE);
    const personIdValue = getIdValue(neighbors, ENTITY_SETS.PEOPLE, PROPERTY_TYPES.PERSON_ID);
    const personCaseHistory = caseHistory.get(personId, Immutable.List());
    const personManualCaseHistory = manualCaseHistory.get(personId, Immutable.List());
    const personChargeHistory = chargeHistory.get(personId, Immutable.Map());
    const personManualChargeHistory = manualChargeHistory.get(personId, Immutable.Map());
    const personSentenceHistory = sentenceHistory.get(personId, Immutable.Map());
    const personFTAHistory = ftaHistory.get(personId, Immutable.Map());
    const personHearings = hearings.get(personId, Immutable.List());

    const hideProfile = (
      component === CONTENT_CONSTS.PROFILE ||
      component === CONTENT_CONSTS.PENDING_PSAS
    );
    return (
      <PSAReviewReportsRow
          neighbors={neighbors}
          scores={scores}
          scoresEntitySetId={scoresEntitySetId}
          personId={personIdValue}
          entityKeyId={scoreId}
          downloadFn={downloadPSAReviewPDF}
          loadCaseHistoryFn={loadCaseHistory}
          loadHearingNeighbors={loadHearingNeighbors}
          onStatusChangeCallback={onStatusChangeCallback}
          submitData={submit}
          replaceEntity={replaceEntity}
          deleteEntity={deleteEntity}
          refreshPSANeighbors={refreshPSANeighbors}
          caseHistory={personCaseHistory}
          manualCaseHistory={personManualCaseHistory}
          chargeHistory={personChargeHistory}
          manualChargeHistory={personManualChargeHistory}
          sentenceHistory={personSentenceHistory}
          ftaHistory={personFTAHistory}
          hearings={personHearings}
          refreshingNeighbors={psaIdsRefreshing.has(scoreId)}
          readOnly={readOnlyPermissions}
          key={scoreId}
          hideCaseHistory={hideCaseHistory}
          hideProfile={hideProfile}
          submitting={submitting}
          component={component} />
    );
  }


  updatePage = (start) => {
    this.setState({ start });
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  renderHeaderBar = (numResults) => {
    const { start } = this.state;
    const { component, renderContent } = this.props;

    const numPages = Math.ceil(numResults / MAX_RESULTS);
    const currPage = (start / MAX_RESULTS) + 1;

    return (
      <StyledCenteredContainer>
        <StyledSubHeaderBar component={component}>
          {renderContent(numResults)}
          <CustomPagination
              numPages={numPages}
              activePage={currPage}
              onChangePage={page => this.updatePage((page - 1) * MAX_RESULTS)} />
        </StyledSubHeaderBar>
      </StyledCenteredContainer>
    );

  }

  sortItems = () => {
    const { sort, scoreSeq, psaNeighborsById } = this.props;
    if (!sort) return scoreSeq;
    const sortFn = sort === SORT_TYPES.DATE ? sortByDate : sortByName;
    return scoreSeq.sort(([id1], [id2]) => sortFn(
      [id1, psaNeighborsById.get(id1, Immutable.Map())], [id2, psaNeighborsById.get(id2, Immutable.Map())]
    ));
  }

  renderContent = (items, numPages, noResults) => {
    const { component, renderSubContent } = this.props;

    switch (component) {
      case CONTENT_CONSTS.REVIEW:
        return (
          <ReviewWrapper>
            {this.renderHeaderBar(numPages)}
            {items.map(([scoreId, scores]) => this.renderRow(scoreId, scores))}
            {this.renderHeaderBar(numPages)}
          </ReviewWrapper>
        );
      case CONTENT_CONSTS.PENDING_PSAS:
        return (
          <ReviewWrapper>
            {this.renderHeaderBar(numPages)}
            <SubContentWrapper>
              {renderSubContent()}
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
    const { scoreSeq, loadingPSAData } = this.props;
    const { start } = this.state;

    if (loadingPSAData) {
      return <SpinnerWrapper><LoadingSpinner /></SpinnerWrapper>;
    }

    const items = this.sortItems(scoreSeq).slice(start, start + MAX_RESULTS);
    const numPages = scoreSeq.length || scoreSeq.size;

    const noResults = numPages === 0;

    return (
      <ReviewWrapper>
        {this.renderContent(items, numPages, noResults)}
      </ReviewWrapper>
    );
  }
}

function mapStateToProps(state) {
  const people = state.get(STATE.PEOPLE);
  const review = state.get(STATE.REVIEW);
  const court = state.get(STATE.COURT);
  const submit = state.get(STATE.SUBMIT);
  // TODO: Address prop names so that consts can be used as keys
  return {
    [REVIEW.ENTITY_SET_ID]: review.get(REVIEW.ENTITY_SET_ID) || people.get(PEOPLE.SCORES_ENTITY_SET_ID),
    [REVIEW.NEIGHBORS_BY_ID]: review.get(REVIEW.NEIGHBORS_BY_ID),
    [REVIEW.CASE_HISTORY]: review.get(REVIEW.CASE_HISTORY),
    [REVIEW.MANUAL_CASE_HISTORY]: review.get(REVIEW.MANUAL_CASE_HISTORY),
    [REVIEW.CHARGE_HISTORY]: review.get(REVIEW.CHARGE_HISTORY),
    [REVIEW.MANUAL_CHARGE_HISTORY]: review.get(REVIEW.MANUAL_CHARGE_HISTORY),
    [REVIEW.SENTENCE_HISTORY]: review.get(REVIEW.SENTENCE_HISTORY),
    [REVIEW.FTA_HISTORY]: review.get(REVIEW.FTA_HISTORY),
    [REVIEW.HEARINGS]: review.get(REVIEW.HEARINGS),
    [REVIEW.LOADING_DATA]: review.get(REVIEW.LOADING_DATA),
    [REVIEW.PSA_IDS_REFRESHING]: review.get(REVIEW.PSA_IDS_REFRESHING),
    readOnlyPermissions: review.get(REVIEW.READ_ONLY),

    [COURT.LOADING_HEARING_NEIGHBORS]: court.get(COURT.LOADING_HEARING_NEIGHBORS),
    [COURT.HEARINGS_NEIGHBORS_BY_ID]: court.get(COURT.HEARINGS_NEIGHBORS_BY_ID),
    [COURT.HEARING_IDS_REFRESHING]: court.get(COURT.HEARING_IDS_REFRESHING),
    [COURT.ALL_JUDGES]: court.get(COURT.ALL_JUDGES),

    [SUBMIT.SUBMITTING]: submit.get(SUBMIT.SUBMITTING, false)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(FormActionFactory).forEach((action :string) => {
    actions[action] = FormActionFactory[action];
  });

  Object.keys(ReviewActionFactory).forEach((action :string) => {
    actions[action] = ReviewActionFactory[action];
  });

  Object.keys(CourtActionFactory).forEach((action :string) => {
    actions[action] = CourtActionFactory[action];
  });

  Object.keys(SubmitActionFactory).forEach((action :string) => {
    actions[action] = SubmitActionFactory[action];
  });

  Object.keys(DataActionFactory).forEach((action :string) => {
    actions[action] = DataActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PSAReviewReportsRowList);
