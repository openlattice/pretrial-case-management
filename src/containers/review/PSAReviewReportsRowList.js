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
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { SORT_TYPES } from '../../utils/consts/Consts';
import { sortByDate, sortByName } from '../../utils/PSAUtils';
import * as FormActionFactory from '../psa/FormActionFactory';
import * as ReviewActionFactory from './ReviewActionFactory';
import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';

const StyledCenteredContainer = styled.div`
  text-align: center;
  margin-bottom: 20px;

  .pagination {
    display: inline-block;
    margin-right: 30px;

    .active a {
      background-color: #6124e2;
      border-radius: 2px;
      color: white;
    }

    .disabled {
      visibility: hidden;
    }
  }

  .pagination a {
    color: #555e6f;
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    }
  }
`;

const StyledFiltersBar1 = styled.div`
  width: 100%;
  background: #fff;
  border-radius: 5px;
  border: solid 1px #e1e1eb;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  padding: 0px 0px 10px 30px;
  font-size: 14px;
  text-align: center;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const StyledFiltersBar2 = styled.div`
  width: 100%;
  margin-bottom: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const PersonWrapper = styled.div`
  padding: 30px;
  width: 100%;
`

const ReviewWrapper = styled.div`\
  width: 100%;
`

type Props = {
  scoreSeq :Immutable.Seq,
  sort? :?string,
  hideCaseHistory? :boolean,
  hideProfile? :boolean,
  onStatusChangeCallback? :() => void,
  actions :{
    downloadPSAReviewPDF :(values :{
      neighbors :Immutable.Map<*, *>,
      scores :Immutable.Map<*, *>
    }) => void,
    loadCaseHistory :(values :{
      personId :string,
      neighbors :Immutable.Map<*, *>
    }) => void,
    updateScoresAndRiskFactors :(values :{
      scoresEntitySetId :string,
      scoresId :string,
      scoresEntity :Immutable.Map<*, *>,
      riskFactorsEntitySetId :string,
      riskFactorsId :string,
      riskFactorsEntity :Immutable.Map<*, *>,
      dmfEntitySetId :string,
      dmfId :string,
      dmfEntity :Object,
      dmfRiskFactorsEntitySetId :string,
      dmfRiskFactorsId :string,
      dmfRiskFactorsEntity :Object
    }) => void,
    changePSAStatus :(values :{
      scoresId :string,
      scoresEntity :Immutable.Map<*, *>
    }) => void,
    checkPSAPermissions :() => void,
    refreshPSANeighbors :({ id :string }) => void,
    submit :(value :{ config :Object, values :Object}) => void,
    replaceEntity :(value :{ entitySetName :string, entityKeyId :string, values :Object }) => void,
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
  submitting :boolean
}

type State = {
  start :number
}

const MAX_RESULTS = 4;

class PSAReviewReportsRowList extends React.Component<Props, State> {

  static defaultProps = {
    hideCaseHistory: false,
    hideProfile: false,
    onStatusChangeCallback: () => {}
  }

  constructor(props :Props) {
    super(props);
    this.state = {
      start: 0
    };
  }

  componentDidMount() {
    this.props.actions.checkPSAPermissions();
  }

  componentWillUnmount() {
    this.props.actions.clearSubmit();
  }

  renderRow = (scoreId, scores) => {
    const neighbors = this.props.psaNeighborsById.get(scoreId, Immutable.Map());
    const personId = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborId'], '');
    const personIdValue = neighbors.getIn([ENTITY_SETS.PEOPLE, 'neighborDetails', PROPERTY_TYPES.PERSON_ID, 0], '');
    const caseHistory = this.props.caseHistory.get(personId, Immutable.List());
    const manualCaseHistory = this.props.manualCaseHistory.get(personId, Immutable.List());
    const chargeHistory = this.props.chargeHistory.get(personId, Immutable.Map());
    const manualChargeHistory = this.props.manualChargeHistory.get(personId, Immutable.Map());
    const sentenceHistory = this.props.sentenceHistory.get(personId, Immutable.Map());
    const ftaHistory = this.props.ftaHistory.get(personId, Immutable.Map());
    const hearings = this.props.hearings.get(personId, Immutable.List());
    return (
      <PSAReviewReportsRow
          neighbors={neighbors}
          scores={scores}
          personId={personIdValue}
          entityKeyId={scoreId}
          downloadFn={this.props.actions.downloadPSAReviewPDF}
          loadCaseHistoryFn={this.props.actions.loadCaseHistory}
          updateScoresAndRiskFactors={this.props.actions.updateScoresAndRiskFactors}
          changePSAStatus={this.props.actions.changePSAStatus}
          onStatusChangeCallback={this.props.onStatusChangeCallback}
          submitData={this.props.actions.submit}
          replaceEntity={this.props.actions.replaceEntity}
          refreshPSANeighbors={this.props.actions.refreshPSANeighbors}
          caseHistory={caseHistory}
          manualCaseHistory={manualCaseHistory}
          chargeHistory={chargeHistory}
          manualChargeHistory={manualChargeHistory}
          sentenceHistory={sentenceHistory}
          ftaHistory={ftaHistory}
          hearings={hearings}
          refreshingNeighbors={this.props.psaIdsRefreshing.has(scoreId)}
          readOnly={this.props.readOnlyPermissions}
          key={scoreId}
          hideCaseHistory={this.props.hideCaseHistory}
          hideProfile={this.props.hideProfile}
          submitting={this.props.submitting} />
    );
  }


  updatePage = (start) => {
    this.setState({ start });
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  renderFiltersBar = (numResults) => {
    const { start } = this.state;
    const { hideProfile } = this.props;

    const numPages = Math.ceil(numResults / MAX_RESULTS);
    const currPage = (start / MAX_RESULTS) + 1;

    const StyledFiltersBar = hideProfile ? StyledFiltersBar2 : StyledFiltersBar1;

    return (
      <StyledCenteredContainer>
        <StyledFiltersBar>
          {this.props.renderContent(numResults)}
          <CustomPagination
              numPages={numPages}
              activePage={currPage}
              onChangePage={page => this.updatePage((page - 1) * MAX_RESULTS)} />
        </StyledFiltersBar>
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

  renderContent = (items, numPages) => {
    const { hideProfile } = this.props;

    if (hideProfile) {
      return (
        <PersonWrapper>
          {this.renderFiltersBar(numPages)}
          {items.map(([scoreId, scores]) => this.renderRow(scoreId, scores))}
        </PersonWrapper>
      )
    }
    return (
      <ReviewWrapper>
        {this.renderFiltersBar(numPages)}
        {items.map(([scoreId, scores]) => this.renderRow(scoreId, scores))}
        {this.renderFiltersBar(numPages)}
      </ReviewWrapper>
    )
  }

  render() {
    const { scoreSeq, loadingPSAData } = this.props;
    const { start } = this.state;

    if (loadingPSAData) {
      return <LoadingSpinner />;
    }

    const items = this.sortItems(scoreSeq).slice(start, start + MAX_RESULTS);
    const numPages = scoreSeq.length || scoreSeq.size;
    return (
      <ReviewWrapper>
        {this.renderContent(items, numPages)}
      </ReviewWrapper>
    );
  }
}

function mapStateToProps(state) {
  const review = state.get('review');
  return {
    psaNeighborsById: review.get('psaNeighborsById'),
    caseHistory: review.get('caseHistory'),
    manualCaseHistory: review.get('manualCaseHistory'),
    chargeHistory: review.get('chargeHistory'),
    manualChargeHistory: review.get('manualChargeHistory'),
    sentenceHistory: review.get('sentenceHistory'),
    ftaHistory: review.get('ftaHistory'),
    hearings: review.get('hearings'),
    readOnlyPermissions: review.get('readOnly'),
    loadingPSAData: review.get('loadingPSAData'),
    psaIdsRefreshing: review.get('psaIdsRefreshing'),
    submitting: state.getIn(['submit', 'submitting'], false)
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

  Object.keys(SubmitActionFactory).forEach((action :string) => {
    actions[action] = SubmitActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PSAReviewReportsRowList);
