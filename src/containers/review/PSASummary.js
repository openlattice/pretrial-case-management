/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import type { RequestSequence } from 'redux-reqseq';
import { Button, DataGrid } from 'lattice-ui-kit';
import { fromJS, List, Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ArrestCard from '../../components/arrest/ArrestCard';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import PSAReportDownloadButton from '../../components/review/PSAReportDownloadButton';
import PSAStats from '../../components/review/PSAStats';
import SummaryRCMDetails from '../../components/rcm/SummaryRCMDetails';
import { formatDateTime } from '../../utils/FormattingUtils';
import { getEntityProperties, getNeighborDetailsForEntitySet } from '../../utils/DataUtils';
import { OL } from '../../utils/consts/Colors';
import { NoResults, Title, SummaryRowWrapper } from '../../utils/Layout';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { CONTEXTS, MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { RCM, CONTEXT } from '../../utils/consts/Consts';
import {
  EDM,
  REVIEW,
  PSA_NEIGHBOR,
  PSA_ASSOCIATION
} from '../../utils/consts/FrontEndStateConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { PEOPLE_DATA } from '../../utils/consts/redux/PeopleConsts';

import * as Routes from '../../core/router/Routes';
import { goToPath } from '../../core/router/RoutingActions';
import { downloadPSAReviewPDF } from './ReviewActions';
import { loadPersonDetails } from '../person/PersonActions';
import { selectPerson, setPSAValues } from '../psa/PSAFormActions';

const {
  ASSESSED_BY,
  MANUAL_PRETRIAL_CASES,
  PSA_RISK_FACTORS,
  STAFF
} = APP_TYPES;

const {
  DATE_TIME,
  ENTITY_KEY_ID,
  PERSON_ID,
  TIMESTAMP,
} = PROPERTY_TYPES;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;

  button {
    margin-left: 10px;
  }
`;

const SummaryWrapper = styled.div`
  align-items: center;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;

  hr {
    width: 100%;
    height: 0;
    border: solid 1px ${OL.GREY28};
  }
`;

const TitleRowWrapper = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 30px 30px 0;
  width: 100%;
`;

const NoStyleWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const ScoresContainer = styled.div`
  align-items: center;
  border-right: ${(props :Object) => (props.border ? `solid 1px ${OL.GREY28}` : 'none')};
  display: flex;
  flex-direction: column;
`;

const ScoreContent = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 20px 30px 0;
  width: 100%;
`;

const PSADetails = styled.div`
  margin: ${(props :Object) => (props.includesPretrialModule ? '20px 0 0' : '20px 0')};
  width: 100%;
  display: grid;
  grid-auto-columns: 2fr 1fr;
  grid-auto-flow: column;
  grid-column-gap: 10px;
`;

const DownloadButtonWrapper = styled.div`
  width: 100%;
  display: flex;
`;

const ScoreTitle = styled.div`
  box-sizing: border-box;
  color: ${OL.GREY01};
  font-size: 16px;
  font-weight: 600;
  padding: 0 30px;
  width: 100%;
`;

const NotesTitle = styled(Title)`
  margin-top: 0;
`;

const NotesWrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  padding: ${(props :Object) => (props.isProfile ? '0 30px 0' : '30px')};
  border-right: ${(props :Object) => (props.isProfile ? `solid 1px ${OL.GREY28}` : 'none')};
`;

const labelMap = fromJS({
  [DATE_TIME]: 'psa date',
  filer: 'filer'
});

type Props = {
  actions :{
    downloadPSAReviewPDF :RequestSequence;
    goToPath :RequestSequence;
    selectPerson :RequestSequence;
    setPSAValues :(value :{
      newValues :Map
    }) => void;
    loadPersonDetails :RequestSequence;
  },
  entitySetsByOrganization :Map;
  fileNewPSA :boolean;
  neighbors :Map;
  notes :string;
  openDetailsModal :() => void;
  person :Map;
  profile :boolean;
  selectedOrganizationSettings :Map;
  scores :Map;
};

class PSASummary extends React.Component<Props, *> {

  renderArrestInfo = () => {
    const { neighbors, profile } = this.props;
    const component :string = profile ? `${CONTENT_CONSTS.PROFILE}|${CONTENT_CONSTS.ARREST}` : CONTENT_CONSTS.ARREST;
    const pretrialCase = getNeighborDetailsForEntitySet(neighbors, MANUAL_PRETRIAL_CASES);
    return (
      <ArrestCard arrest={pretrialCase} component={component} />
    );
  };

  renderNotes = () => {
    const { notes, profile } = this.props;
    return (
      <NotesWrapper isProfile={profile}>
        <NotesTitle withSubtitle><span>Notes</span></NotesTitle>
        {notes || 'No Notes'}
      </NotesWrapper>
    );
  }

  viewPSADetailsButton = () => {
    const { openDetailsModal, neighbors } = this.props;
    return neighbors.size
      ? <Button onClick={openDetailsModal}>View PSA Details</Button>
      : null;
  }

  goToCreatePSA = () => {
    const { actions, selectedOrganizationSettings, person } = this.props;
    const { [ENTITY_KEY_ID]: personEKID } = getEntityProperties(person, [ENTITY_KEY_ID]);
    const shouldLoadCases :boolean = selectedOrganizationSettings.get(SETTINGS.LOAD_CASES, false);
    const caseContext = selectedOrganizationSettings.getIn([SETTINGS.CASE_CONTEXTS, CONTEXTS.COURT]);
    const newValues = Map()
      .set(RCM.COURT_OR_BOOKING, CONTEXT.COURT)
      .set(RCM.CASE_CONTEXT, caseContext);
    actions.setPSAValues({ newValues });
    actions.selectPerson({ selectedPerson: person });
    actions.loadPersonDetails({ entityKeyId: personEKID, shouldLoadCases });
    actions.goToPath(Routes.PSA_FORM_ARREST);
  }

  render() {
    const {
      actions,
      entitySetsByOrganization,
      fileNewPSA,
      neighbors,
      notes,
      scores,
      profile,
      selectedOrganizationSettings
    } = this.props;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], '');
    let filer;
    const riskFactors = neighbors.get(PSA_RISK_FACTORS, Map());
    const { [DATE_TIME]: psaDate } = getEntityProperties(scores, [DATE_TIME]);
    const {
      [TIMESTAMP]: psaRiskFactorsDate
    } = getEntityProperties(riskFactors, [TIMESTAMP]);
    const usableDate = formatDateTime(psaDate || psaRiskFactorsDate);

    neighbors.get(STAFF, List()).forEach((neighbor) => {
      const associationEntitySetId = neighbor.getIn([PSA_ASSOCIATION.ENTITY_SET, 'id']);
      const appTypeFqn = entitySetsByOrganization.get(associationEntitySetId);
      const personId = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PERSON_ID, 0], '');
      if (appTypeFqn === ASSESSED_BY) {
        filer = personId;
      }
    });

    const data = fromJS({
      [DATE_TIME]: usableDate,
      filer
    });

    const middleRow = (
      <SummaryRowWrapper row={!includesPretrialModule}>
        <ScoresContainer border={includesPretrialModule}>
          <ScoreTitle>PSA</ScoreTitle>
          <ScoreContent includesPretrialModule>
            <PSAStats scores={scores} hideProfile />
            <PSADetails>
              <DataGrid
                  columns={2}
                  data={data}
                  labelMap={labelMap}
                  truncate />
              <DownloadButtonWrapper>
                <PSAReportDownloadButton
                    includesPretrialModule={includesPretrialModule}
                    downloadFn={actions.downloadPSAReviewPDF}
                    neighbors={neighbors}
                    scores={scores} />
              </DownloadButtonWrapper>
            </PSADetails>
          </ScoreContent>
        </ScoresContainer>
        <ScoresContainer>
          <ScoreTitle>Release Conditions Matrix</ScoreTitle>
          <SummaryRCMDetails neighbors={neighbors} scores={scores} />
        </ScoresContainer>
      </SummaryRowWrapper>
    );

    const bottomRow = !profile ? null
      : (
        <SummaryRowWrapper>
          {this.renderNotes()}
          {this.renderArrestInfo()}
        </SummaryRowWrapper>
      );

    return (
      <SummaryWrapper>
        <TitleRowWrapper>
          <Title withSubtitle><span>PSA Summary</span></Title>
          <ButtonWrapper>
            { this.viewPSADetailsButton() }
            { fileNewPSA ? <Button color="primary" onClick={this.goToCreatePSA}>File New PSA</Button> : null}
          </ButtonWrapper>
        </TitleRowWrapper>
        {
          scores.size
            ? (
              <NoStyleWrapper>
                { middleRow }
                <hr />
                {(!profile && notes) ? this.renderNotes() : null}
                {(!profile && notes) ? <hr /> : null}
                { bottomRow }
              </NoStyleWrapper>
            )
            : <NoResults>No PSA</NoResults>
        }
      </SummaryWrapper>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const orgId = app.get(APP_DATA.SELECTED_ORG_ID, '');
  const edm = state.get(STATE.EDM);
  const review = state.get(STATE.REVIEW);
  const people = state.get(STATE.PEOPLE);

  return {
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),
    [APP_DATA.ENTITY_SETS_BY_ORG]: app.getIn([APP_DATA.ENTITY_SETS_BY_ORG, orgId]),

    [EDM.FQN_TO_ID]: edm.get(EDM.FQN_TO_ID),

    [REVIEW.PSA_NEIGHBORS_BY_ID]: review.get(REVIEW.PSA_NEIGHBORS_BY_ID),
    [REVIEW.SCORES]: review.get(REVIEW.SCORES),
    [REVIEW.LOADING_DATA]: review.get(REVIEW.LOADING_DATA),
    [REVIEW.LOADING_RESULTS]: review.get(REVIEW.LOADING_RESULTS),

    [PEOPLE_DATA.PERSON_DATA]: people.get(PEOPLE_DATA.PERSON_DATA),
    [PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID]: people.get(PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID)
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Review Actions
    downloadPSAReviewPDF,
    // Routing Actions
    goToPath,
    // Person Actions
    selectPerson,
    setPSAValues,
    loadPersonDetails
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(PSASummary);
