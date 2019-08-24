/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Map, Set } from 'immutable';

import PSAFailureStats from '../../components/review/PSAFailureStats';
import PSAReviewReportsRow from '../../components/review/PSAReviewReportsRow';
import LoadingSpinner from '../../components/LoadingSpinner';
import CustomPagination from '../../components/Pagination';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import { NoResults } from '../../utils/Layout';
import { PSA_FAILURE_REASONS, PSA_STATUSES, SORT_TYPES } from '../../utils/consts/Consts';
import { sortByDate, sortByName } from '../../utils/PSAUtils';
import { getIdOrValue } from '../../utils/DataUtils';
import { OL } from '../../utils/consts/Colors';
import { MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import {
  COURT,
  PEOPLE,
  PSA_NEIGHBOR,
  PSA_MODAL,
  REVIEW,
  SUBMIT
} from '../../utils/consts/FrontEndStateConsts';

// Redux State Imports
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

import * as CourtActionFactory from '../court/CourtActionFactory';
import * as DataActionFactory from '../../utils/data/DataActionFactory';
import * as FormActionFactory from '../psa/FormActionFactory';
import * as HearingsActions from '../hearings/HearingsActions';
import * as PSAModalActionFactory from '../psamodal/PSAModalActionFactory';
import * as ReviewActionFactory from './ReviewActionFactory';
import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';

const { PSA_SCORES } = APP_TYPES;
const peopleFqn :string = APP_TYPES.PEOPLE;

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
          `background: ${OL.WHITE};
           border-radius: 5px;
           border: solid 1px ${OL.GREY11};
           border-top-left-radius: 0;
           border-top-right-radius: 0;
           padding: 0 0 10px 30px;
           font-size: 14px;
           text-align: center;`
        );
      case CONTENT_CONSTS.PENDING_PSAS:
        return (
          `background: ${OL.WHITE};
           border-radius: 5px;
           border: solid 1px ${OL.GREY11};
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

const ReviewRowWrapper = styled.div`
  padding-left: 30px;
`;

const SubContentWrapper = styled.div`
  width: 100%;
  background: ${OL.WHITE};
  border-radius: 5px;
  border: solid 1px ${OL.GREY11};
  padding: 20px 30px;
  margin-bottom: 30px;
`;

type Props = {
  scoreSeq :Seq,
  sort? :?string,
  component :?string,
  entitySetsByOrganization :Map<*, *>,
  hideCaseHistory? :boolean,
  hearingIds :Set<*>,
  filterType :string,
  onStatusChangeCallback? :() => void,
  renderContent :?(() => void),
  renderSubContent :?(() => void),
  actions :{
    downloadPSAReviewPDF :(values :{
      neighbors :Map<*, *>,
      scores :Map<*, *>
    }) => void,
    loadCaseHistory :(values :{
      personId :string,
      neighbors :Map<*, *>
    }) => void,
    loadHearingNeighbors :(hearingIds :string[]) => void,
    checkPSAPermissions :() => void,
    refreshPSANeighbors :({ id :string }) => void,
    replaceEntity :(value :{ entitySetName :string, entityKeyId :string, values :Object }) => void,
    deleteEntity :(value :{ entitySetName :string, entityKeyId :string }) => void,
    clearSubmit :() => void,
  },
  psaNeighborsById :Map<*, *>,
  neighbors :Map<*, *>,
  psaIdsRefreshing :Set<*>,
  personId :string,
  loadingPSAData :boolean,
  loading :boolean,
  scoresEntitySetId :string,
  submitting :boolean,
  selectedOrganizationId :string,
  selectedOrganizationSettings :Map<*, *>
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

  componentWillReceiveProps(nextProps) {
    let { start } = this.state;
    const {
      actions,
      filterType,
      hearingIds,
      scoreSeq
    } = this.props;
    const nextFilterType = nextProps.filterType;
    if (filterType && (filterType !== nextFilterType)) {
      this.setState({ start: 0 });
    }
    if (scoreSeq.size !== nextProps.scoreSeq.size) {
      const numResults = nextProps.scoreSeq.size;
      const numPages = Math.ceil(numResults / MAX_RESULTS);
      const currPage = (start / MAX_RESULTS) + 1;

      if (currPage > numPages) start = (numPages - 1) * MAX_RESULTS;
      if (start <= 0) start = 0;
      this.setState({ start });
    }
    if (hearingIds.size !== nextProps.hearingIds.size) {
      actions.loadHearingNeighbors({ hearingIds: nextProps.hearingIds.toJS() });
    }
  }

  componentWillUnmount() {
    const { actions } = this.props;
    actions.clearSubmit();
  }

  loadCaseHistoryCallback = (personId, psaNeighbors) => {
    const { actions } = this.props;
    const { loadCaseHistory } = actions;
    loadCaseHistory({ personId, neighbors: psaNeighbors });
  }

  renderRow = (scoreId, scores) => {
    const {
      psaNeighborsById,
      entitySetsByOrganization,
      component,
      scoresEntitySetId,
      actions,
      onStatusChangeCallback,
      psaIdsRefreshing,
      hideCaseHistory,
      submitting,
      selectedOrganizationSettings
    } = this.props;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);


    const {
      downloadPSAReviewPDF,
      loadPSAModal,
      loadHearingNeighbors,
      replaceEntity,
      deleteEntity,
      refreshPSANeighbors
    } = actions;

    const neighbors = psaNeighborsById.get(scoreId, Map());
    const personIdValue = getIdOrValue(neighbors, peopleFqn, PROPERTY_TYPES.PERSON_ID);

    const hideProfile = (
      component === CONTENT_CONSTS.PROFILE || component === CONTENT_CONSTS.PENDING_PSAS
    );
    return (
      <PSAReviewReportsRow
          includesPretrialModule={includesPretrialModule}
          entitySetIdsToAppType={entitySetsByOrganization}
          psaNeighbors={neighbors}
          scores={scores}
          scoresEntitySetId={scoresEntitySetId}
          personId={personIdValue}
          entityKeyId={scoreId}
          downloadFn={downloadPSAReviewPDF}
          loadCaseHistoryFn={this.loadCaseHistoryCallback}
          loadHearingNeighbors={loadHearingNeighbors}
          loadPSAModal={loadPSAModal}
          onStatusChangeCallback={onStatusChangeCallback}
          replaceEntity={replaceEntity}
          deleteEntity={deleteEntity}
          refreshPSANeighbors={refreshPSANeighbors}
          refreshingNeighbors={psaIdsRefreshing.has(scoreId)}
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

  renderFTAStats = () => {
    const { neighbors, personId } = this.props;
    if (personId && neighbors.size) {
      const personPSAs = neighbors.getIn([personId, PSA_SCORES], Map());
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
        <PSAFailureStats failures={psaFailures} ftas={ftas} />
      );
    }
    return null;
  }

  sortItems = () => {
    const {
      sort,
      scoreSeq,
      psaNeighborsById,
      entitySetsByOrganization
    } = this.props;
    if (!sort) return scoreSeq;
    const sortFn = sort === SORT_TYPES.DATE ? sortByDate : sortByName;
    return scoreSeq.sort(([id1], [id2]) => sortFn(
      [id1, psaNeighborsById.get(id1, Map())],
      [id2, psaNeighborsById.get(id2, Map())],
      entitySetsByOrganization
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
      loadingPSAData,
      loading
    } = this.props;
    const { start } = this.state;

    if (loadingPSAData || loading) {
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
  const app = state.get(STATE.APP);
  const court = state.get(STATE.COURT);
  const orgId = app.get(APP_DATA.SELECTED_ORG_ID, '');
  const people = state.get(STATE.PEOPLE);
  const review = state.get(STATE.REVIEW);
  const submit = state.get(STATE.SUBMIT);
  const psaModal = state.get(STATE.PSA_MODAL);
  // TODO: Address prop names so that consts can be used as keys
  return {
    [APP_DATA.ENTITY_SETS_BY_ORG]: app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId], Map()),
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.ESELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    [REVIEW.ENTITY_SET_ID]: review.get(REVIEW.ENTITY_SET_ID) || people.get(PEOPLE.SCORES_ENTITY_SET_ID),
    [REVIEW.NEIGHBORS_BY_ID]: review.get(REVIEW.NEIGHBORS_BY_ID),
    [REVIEW.LOADING_DATA]: review.get(REVIEW.LOADING_DATA),
    [REVIEW.PSA_IDS_REFRESHING]: review.get(REVIEW.PSA_IDS_REFRESHING),
    readOnlyPermissions: review.get(REVIEW.READ_ONLY),

    [PSA_MODAL.HEARING_IDS]: psaModal.get(PSA_MODAL.HEARING_IDS),

    [PEOPLE.PERSON_DATA]: people.get(PEOPLE.PERSON_DATA),
    [PEOPLE.NEIGHBORS]: people.get(PEOPLE.NEIGHBORS, Map()),

    [SUBMIT.SUBMITTING]: submit.get(SUBMIT.SUBMITTING, false)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(CourtActionFactory).forEach((action :string) => {
    actions[action] = CourtActionFactory[action];
  });

  Object.keys(FormActionFactory).forEach((action :string) => {
    actions[action] = FormActionFactory[action];
  });

  Object.keys(HearingsActions).forEach((action :string) => {
    actions[action] = HearingsActions[action];
  });

  Object.keys(ReviewActionFactory).forEach((action :string) => {
    actions[action] = ReviewActionFactory[action];
  });

  Object.keys(PSAModalActionFactory).forEach((action :string) => {
    actions[action] = PSAModalActionFactory[action];
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
