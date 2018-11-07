/*
 * @flow
 */
import React from 'react';
import Immutable from 'immutable';
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
import SummaryDMFDetails from '../../components/dmf/SummaryDMFDetails';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { formatDateTimeList } from '../../utils/FormattingUtils';
import { getTimeStamp, getNeighborDetailsForEntitySet } from '../../utils/DataUtils';
import { OL } from '../../utils/consts/Colors';
import { Title, SummaryRowWrapper } from '../../utils/Layout';
import {
  STATE,
  REVIEW,
  PEOPLE,
  PSA_NEIGHBOR,
  PSA_ASSOCIATION
} from '../../utils/consts/FrontEndStateConsts';

import * as Routes from '../../core/router/Routes';
import * as ReviewActionFactory from './ReviewActionFactory';

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;

const SummaryWrapper = styled.div`
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
  margin-top: 20px;
  width: 100%;
  display: grid;
  grid-template-columns: 25% 25% 46%;
  grid-column-gap: 2%;
`;

const DownloadButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
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
  padding: ${props => (props.profile ? '0 30px 0' : '30px')};
  border-right: ${props => (props.profile ? `solid 1px ${OL.GREY28}` : 'none')};
`;

const ViewPSADetailsButton = styled(BasicButton)`
  width: 180px;
  height: 40px;
`;

type Props = {
  notes :string,
  scores :Immutable.Map<*, *>,
  neighbors :Immutable.Map<*, *>,
  fileNewPSA :boolean,
  profile :boolean,
  openDetailsModal :() => void,
  actions :{
    downloadPSAReviewPDF :(values :{
      neighbors :Immutable.Map<*, *>,
      scores :Immutable.Map<*, *>
    }) => void,
  },
};

class PSASummary extends React.Component<Props, *> {

  renderArrestInfo = () => {
    const { neighbors, profile } = this.props;
    const component = profile ? `${CONTENT_CONSTS.PROFILE}|${CONTENT_CONSTS.ARREST}` : CONTENT_CONSTS.ARREST;
    const pretrialCase = getNeighborDetailsForEntitySet(neighbors, ENTITY_SETS.MANUAL_PRETRIAL_CASES);
    return (
      <ArrestCard profile arrest={pretrialCase} component={component} />
    );
  };

  renderNotes = () => {
    const { notes, profile } = this.props;
    return (
      <NotesWrapper profile={profile}>
        <NotesTitle withSubtitle><span>Notes</span></NotesTitle>
        {notes || 'No Notes'}
      </NotesWrapper>
    );
  }

  renderPersonInfo = () => {
    const { neighbors } = this.props;
    const person = getNeighborDetailsForEntitySet(neighbors, ENTITY_SETS.PEOPLE);
    return (
      <PersonCardSummary person={person} />
    );
  }

  viewPSADetailsButton = () => {
    const { openDetailsModal } = this.props;
    return (
      <ViewPSADetailsButton onClick={openDetailsModal}>View PSA Details</ViewPSADetailsButton>
    );
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
    const { neighbors, actions, scores } = this.props;
    const { downloadPSAReviewPDF } = actions;
    let filer;
    const psaDate = formatDateTimeList(getTimeStamp(neighbors, ENTITY_SETS.PSA_RISK_FACTORS));
    neighbors.get(ENTITY_SETS.STAFF, Immutable.List()).forEach((neighbor) => {
      const associationEntitySetName = neighbor.getIn([PSA_ASSOCIATION.ENTITY_SET, 'name']);
      const personId = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_ID, 0], '');
      if (associationEntitySetName === ENTITY_SETS.ASSESSED_BY) {
        filer = personId;
      }
    });
    return (
      <PSADetails>
        <ContentBlock
            contentBlock={{ label: 'psa date', content: [psaDate] }}
            component={CONTENT_CONSTS.SUMMARY} />
        <ContentBlock
            contentBlock={{ label: 'filer', content: [filer] }}
            component={CONTENT_CONSTS.SUMMARY} />
        <DownloadButtonWrapper>
          <PSAReportDownloadButton
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
      profile
    } = this.props;

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
        <SummaryRowWrapper>
          <ScoresContainer border>
            <ScoreTitle>PSA</ScoreTitle>
            <ScoreContent>
              <PSAStats scores={scores} />
              {this.renderPSADetails()}
            </ScoreContent>
          </ScoresContainer>
          <ScoresContainer>
            <ScoreTitle>DMF</ScoreTitle>
            <SummaryDMFDetails neighbors={neighbors} scores={scores} />
          </ScoresContainer>
        </SummaryRowWrapper>
        <hr />
        {(!profile && notes) ? this.renderNotes() : null}
        {(!profile && notes) ? <hr /> : null}
        { bottomRow }
      </SummaryWrapper>
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
    [PEOPLE.MOST_RECENT_PSA]: people.get(PEOPLE.MOST_RECENT_PSA)
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
