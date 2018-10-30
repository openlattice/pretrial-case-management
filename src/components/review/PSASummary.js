/*
 * @flow
 */
import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';

import ArrestCard from '../arrest/ArrestCard';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import ContentBlock from '../ContentBlock';
import PersonCardSummary from '../person/PersonCardSummary';
import PSAReportDownloadButton from './PSAReportDownloadButton';
import PSAStats from './PSAStats';
import SummaryDMFDetails from '../dmf/SummaryDMFDetails';
import { Title } from '../../utils/Layout';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { PSA_NEIGHBOR, PSA_ASSOCIATION } from '../../utils/consts/FrontEndStateConsts';
import { formatDateTimeList } from '../../utils/FormattingUtils';


const SummaryWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const RowWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 66% 33%;
  margin: 30px 0;
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

const NotesWrapper = styled.div`
  width: 100%;
  padding: 0 30px 30px;
`;

type Props = {
  pendingCharges :boolean,
  notes :string,
  scores :Immutable.Map<*, *>,
  neighbors :Immutable.Map<*, *>,
  manualCaseHistory :Immutable.List<*>,
  downloadFn :(values :{
    neighbors :Immutable.Map<*, *>,
    scores :Immutable.Map<*, *>
  }) => void,
};

class PSASummary extends React.Component<Props, *> {

  renderArrestInfo = () => {
    const { neighbors, manualCaseHistory } = this.props;
    const caseNum = neighbors.getIn(
      [ENTITY_SETS.MANUAL_PRETRIAL_CASES, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CASE_ID, 0], ''
    );
    const pretrialCase = manualCaseHistory
      .filter(caseObj => caseObj.getIn([PROPERTY_TYPES.CASE_ID, 0], '') === caseNum)
      .get(0, Immutable.Map());
    return (
      <ArrestCard arrest={pretrialCase} component={CONTENT_CONSTS.ARREST} />
    );
  };

  renderNotes = () => {
    const { notes } = this.props;
    return (
      <NotesWrapper>
        <Title withSubtitle><span>Notes</span></Title>
        {notes}
      </NotesWrapper>
    );
  };

  renderPersonInfo = () => {
    const { neighbors } = this.props;
    const person = neighbors.getIn([ENTITY_SETS.PEOPLE, PSA_NEIGHBOR.DETAILS], Immutable.Map());

    return (
      <PersonCardSummary person={person} />
    );
  };

  renderPSADetails = () => {
    const { neighbors, downloadFn, scores } = this.props;
    let filer;
    const psaDate = formatDateTimeList(
      neighbors.getIn(
        [ENTITY_SETS.PSA_RISK_FACTORS, PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.TIMESTAMP], Immutable.Map()
      )
    );
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
              downloadFn={downloadFn}
              neighbors={neighbors}
              scores={scores} />
        </DownloadButtonWrapper>
      </PSADetails>
    );
  };
  render() {
    const {
      neighbors,
      notes,
      scores
    } = this.props;

    return (
      <SummaryWrapper>
        <RowWrapper>
          {this.renderPersonInfo()}
          {this.renderArrestInfo()}
        </RowWrapper>
        <hr />
        <RowWrapper>
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
        </RowWrapper>
        <hr />
        {notes ? this.renderNotes() : null}
        {notes ? <hr /> : null}
      </SummaryWrapper>
    );
  }
}

export default PSASummary;
