/*
 * @flow
 */
import React from 'react';
import { Map, List } from 'immutable';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ArrestCard from '../../components/arrest/ArrestCard';
import BasicButton from '../../components/buttons/BasicButton';
import InfoLink from '../../components/buttons/InfoLink';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import ContentBlock from '../../components/ContentBlock';
import PersonCardSummary from '../../components/person/PersonCardSummary';
import PSAReportDownloadButton from '../../components/review/PSAReportDownloadButton';
import PSAStats from '../../components/review/PSAStats';
import SummaryRCMDetails from '../../components/rcm/SummaryRCMDetails';
import { formatDateTime } from '../../utils/FormattingUtils';
import { getEntityProperties, getNeighborDetailsForEntitySet } from '../../utils/DataUtils';
import { OL } from '../../utils/consts/Colors';
import { NoResults, Title, SummaryRowWrapper } from '../../utils/Layout';
import { MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
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
import * as ReviewActionFactory from './ReviewActionFactory';

const {
  ASSESSED_BY,
  MANUAL_PRETRIAL_CASES,
  PSA_RISK_FACTORS,
  STAFF
} = APP_TYPES;

const peopleFqn :string = APP_TYPES.PEOPLE;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;

const SummaryWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  hr {
    width: 100%;
    height: 1px;
    margin: 0;
  }
`;

const BaseSummaryRowWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const TitleRowWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 30px 30px 0;
`;

const NoStyleWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const ScoresContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: ${props => (props.border ? `solid 1px ${OL.GREY28}` : 'none')};
`;

const ScoreContent = styled.div`
  padding: 20px 30px 0;
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const PSADetails = styled.div`
  margin: ${props => (props.includesPretrialModule ? '20px 0 0' : '20px 0')};
  width: 100%;
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  grid-column-gap: 2%;
`;

const DownloadButtonWrapper = styled.div`
  width: 100%;
  display: flex;
`;

const ScoreTitle = styled.div`
  width: 100%;
  font-family: 'Open Sans', sans-serif;
  padding: 0 30px;
  font-size: 16px;
  font-weight: 600;
  color: ${OL.GREY01};
`;

const NotesTitle = styled(Title)`
  margin-top: 0;
`;

const NotesWrapper = styled.div`
  width: 100%;
  padding: ${props => (props.isProfile ? '0 30px 0' : '30px')};
  border-right: ${props => (props.isProfile ? `solid 1px ${OL.GREY28}` : 'none')};
`;

const ViewPSADetailsButton = styled(BasicButton)`
  width: 180px;
  height: 40px;
`;

type Props = {
  notes :string,
  entitySetsByOrganization :Map<*, *>,
  scores :Map<*, *>,
  neighbors :Map<*, *>,
  fileNewPSA :boolean,
  profile :boolean,
  selectedOrganizationSettings :Map<*, *>,
  openDetailsModal :() => void,
  actions :{
    downloadPSAReviewPDF :(values :{
      neighbors :Map<*, *>,
      scores :Map<*, *>
    }) => void,
  },
};

class PSASummary extends React.Component<Props, *> {

  renderArrestInfo = () => {
    const { neighbors, profile } = this.props;
    const component = profile ? `${CONTENT_CONSTS.PROFILE}|${CONTENT_CONSTS.ARREST}` : CONTENT_CONSTS.ARREST;
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

  renderPersonInfo = () => {
    const { neighbors } = this.props;
    const person = getNeighborDetailsForEntitySet(neighbors, peopleFqn);
    return (
      <PersonCardSummary person={person} />
    );
  }

  viewPSADetailsButton = () => {
    const { openDetailsModal, neighbors } = this.props;
    return neighbors.size
      ? <ViewPSADetailsButton onClick={openDetailsModal}>View PSA Details</ViewPSADetailsButton>
      : null;
  }

  renderProfileHeader = () => {
    const { fileNewPSA } = this.props;
    return (
      <TitleRowWrapper>
        <Title withSubtitle><span>PSA Summary</span></Title>
        <ButtonWrapper>
          { this.viewPSADetailsButton() }
          { fileNewPSA ? <InfoLink to={Routes.DASHBOARD}>File New PSA</InfoLink> : null}
        </ButtonWrapper>
      </TitleRowWrapper>
    );
  }

  renderPSADetails = () => {
    const {
      neighbors,
      actions,
      scores,
      entitySetsByOrganization,
      selectedOrganizationSettings
    } = this.props;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], '');

    const { downloadPSAReviewPDF } = actions;
    let filer;
    const riskFactors = neighbors.get(PSA_RISK_FACTORS, Map());
    const { [PROPERTY_TYPES.DATE_TIME]: psaDate } = getEntityProperties(scores, [PROPERTY_TYPES.DATE_TIME]);
    const {
      [PROPERTY_TYPES.TIMESTAMP]: psaRiskFactorsDate
    } = getEntityProperties(riskFactors, [PROPERTY_TYPES.TIMESTAMP]);
    const usableDate = formatDateTime(psaDate || psaRiskFactorsDate);

    neighbors.get(STAFF, List()).forEach((neighbor) => {
      const associationEntitySetId = neighbor.getIn([PSA_ASSOCIATION.ENTITY_SET, 'id']);
      const appTypeFqn = entitySetsByOrganization.get(associationEntitySetId);
      const personId = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_ID, 0], '');
      if (appTypeFqn === ASSESSED_BY) {
        filer = personId;
      }
    });
    return (
      <PSADetails>
        <ContentBlock
            contentBlock={{ label: 'psa date', content: [usableDate] }}
            component={CONTENT_CONSTS.SUMMARY} />
        <ContentBlock
            contentBlock={{ label: 'filer', content: [filer] }}
            component={CONTENT_CONSTS.SUMMARY} />
        <div />
        <DownloadButtonWrapper>
          <PSAReportDownloadButton
              includesPretrialModule={includesPretrialModule}
              downloadFn={downloadPSAReviewPDF}
              neighbors={neighbors}
              scores={scores} />
        </DownloadButtonWrapper>
      </PSADetails>
    );
  }

  render() {
    const {
      neighbors,
      notes,
      scores,
      profile,
      selectedOrganizationSettings
    } = this.props;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], '');

    const topRow = profile ? this.renderProfileHeader()
      : (
        <NoStyleWrapper>
          <SummaryRowWrapper>
            {this.renderPersonInfo()}
            {this.renderArrestInfo()}
          </SummaryRowWrapper>
          <hr />
        </NoStyleWrapper>
      );

    const pretrialMiddleRow = (
      <SummaryRowWrapper row={!includesPretrialModule}>
        <ScoresContainer border={includesPretrialModule}>
          <ScoreTitle>PSA</ScoreTitle>
          <ScoreContent includesPretrialModule>
            <PSAStats scores={scores} hideProfile />
            {this.renderPSADetails()}
          </ScoreContent>
        </ScoresContainer>
        <ScoresContainer>
          <ScoreTitle>RCM</ScoreTitle>
          <SummaryRCMDetails neighbors={neighbors} scores={scores} />
        </ScoresContainer>
      </SummaryRowWrapper>
    );

    const psaMiddleRow = (
      <BaseSummaryRowWrapper row={!includesPretrialModule}>
        <ScoresContainer border={includesPretrialModule}>
          <ScoreTitle>PSA</ScoreTitle>
          <ScoreContent includesPretrialModule>
            <PSAStats scores={scores} hideProfile />
            {this.renderPSADetails()}
          </ScoreContent>
        </ScoresContainer>
      </BaseSummaryRowWrapper>
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
        { topRow }
        {
          scores.size
            ? (
              <NoStyleWrapper>
                { includesPretrialModule ? pretrialMiddleRow : psaMiddleRow }
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

function mapDispatchToProps(dispatch) {
  const actions :{ [string] :Function } = {};

  Object.keys(ReviewActionFactory).forEach((action :string) => {
    actions[action] = ReviewActionFactory[action];
  });

  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PSASummary);
