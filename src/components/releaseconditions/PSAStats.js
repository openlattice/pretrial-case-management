/*
* @flow
*/

import React from 'react';
import styled from 'styled-components';
import type { RequestState } from 'redux-reqseq';
import { Map } from 'immutable';
import { bindActionCreators } from 'redux';
import { Button } from 'lattice-ui-kit';
import { connect } from 'react-redux';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/pro-light-svg-icons';

import BooleanFlag from '../BooleanFlag';
import PSAMetaData from '../review/PSAMetaData';
import ScoreScale from '../ScoreScale';
import StatusTag from '../StatusTag';
import { OL } from '../../utils/consts/Colors';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getEntityKeyId, getEntityProperties } from '../../utils/DataUtils';
import { Data, Field, Header } from '../../utils/Layout';

import { submitExistingHearing } from '../../containers/hearings/HearingsActions';

// Redux State Imports
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { HEARINGS_ACTIONS } from '../../utils/consts/redux/HearingsConsts';
import { REVIEW } from '../../utils/consts/FrontEndStateConsts';

const SCALE_DIMS = { height: 20, width: 96 };
const FLAG_DIMS = { height: 28, width: 74 };

const {
  CASE_ID,
  ENTITY_KEY_ID,
  FTA_SCALE,
  NCA_SCALE,
  NVCA_FLAG,
  STATUS
} = PROPERTY_TYPES;

const PSAStatsSection = styled.div`
  padding: 30px;
  display: grid;
  grid-template-columns: repeat(4, auto);
  grid-gap: 10px;
  border-bottom: 1px solid ${OL.GREY11};
`;

const FullRowSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-bottom: 20px;
  grid-column-start: 1;
  grid-column-end: 5;
`;

const AssociationStatusWrapper = styled.div`
  font-size: 12px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  color: ${OL.RED01};
  svg {
    margin: 2px;
  }
`;

const PSAStatsHeaderWrapper = styled(FullRowSection)`
  justify-content: space-between;
`;

const PSAStatsHeader = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${OL.GREY15};
`;

const StyledButton = styled(Button)`
  background: none;
  border: solid 1px ${OL.GREY05};
  border-radius: 3px;
  color: ${OL.GREY15};
  font-weight: 600;
  font-size: 11px;
  height: 28px;
  padding: 5px 10px;
  margin-left: 10px;
`;

const StyledHeader = styled(Header)`
  margin-bottom: 10px;
`;

const StyledData = styled(Data)`
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

type Props = {
  entitySetsByOrganization :Map<*, *>,
  hearing :Map<*, *>,
  isAssociatedToHearing :boolean,
  personEKID :string,
  psaNeighborsById :Map<*, *>,
  psaScores :Map<*, *>,
  selectedOrganizationId :string,
  submitExistingHearingReqState :RequestState,
  actions :{
    submitExistingHearing :(values :{
      caseId :string,
      hearingEKID :string,
      personEKID :string,
      psaEKID :string
    }) => void
  }
}

class PSAStats extends React.Component<Props, State> {

  associatePSAToHearing = () => {
    const {
      actions,
      hearing,
      personEKID,
      psaScores
    } = this.props;
    const {
      [ENTITY_KEY_ID]: hearingEKID,
      [CASE_ID]: caseId
    } = getEntityProperties(hearing, [ENTITY_KEY_ID, CASE_ID]);
    const psaEKID = getEntityKeyId(psaScores);
    actions.submitExistingHearing({
      caseId,
      hearingEKID,
      personEKID,
      psaEKID
    });
  }

  renderStatsHeader = () => {
    const { isAssociatedToHearing, submitExistingHearingReqState } = this.props;
    const submittingHearing = requestIsPending(submitExistingHearingReqState);
    return (
      <PSAStatsHeaderWrapper>
        <PSAStatsHeader>PSA</PSAStatsHeader>
        { this.renderAssociationStatus() }
        {
          isAssociatedToHearing
            ? null
            : (
              <StyledButton
                  disabled={submittingHearing}>
                Associate PSA
              </StyledButton>
            )
        }
      </PSAStatsHeaderWrapper>
    );
  }

  renderAssociationStatus = () => {
    const { isAssociatedToHearing } = this.props;
    const statusText = 'This PSA is not associated to the chosen hearing';
    return isAssociatedToHearing
      ? null
      : (
        <AssociationStatusWrapper>
          <FontAwesomeIcon color={OL.RED01} icon={faExclamationTriangle} />
          { statusText }
        </AssociationStatusWrapper>
      );
  }

  renderPSAMetaData =() => {
    const {
      entitySetsByOrganization,
      psaScores,
      psaNeighborsById,
      selectedOrganizationId
    } = this.props;
    const entitySetIdsToAppType = entitySetsByOrganization.get(selectedOrganizationId, Map());
    const psaEKID = getEntityKeyId(psaScores);
    const psaNeighbors = psaNeighborsById.get(psaEKID, Map());
    return (
      <PSAStatsHeaderWrapper>
        <PSAMetaData
            left
            scores={psaScores}
            entitySetIdsToAppType={entitySetIdsToAppType}
            psaNeighbors={psaNeighbors} />
      </PSAStatsHeaderWrapper>
    );
  }

  renderScores = () => {
    const { psaScores } = this.props;
    const {
      [STATUS]: status,
      [NVCA_FLAG]: nvcaFlag,
      [NCA_SCALE]: ncaScale,
      [FTA_SCALE]: ftaScale
    } = getEntityProperties(psaScores, [STATUS, NVCA_FLAG, NCA_SCALE, FTA_SCALE]);
    return (
      <>
        <Field>
          <StyledHeader>status</StyledHeader>
          <StyledData>
            <StatusTag status={status}>{status}</StatusTag>
          </StyledData>
        </Field>
        <Field>
          <StyledHeader>NVCA</StyledHeader>
          <StyledData>
            <BooleanFlag dims={FLAG_DIMS} value={nvcaFlag} />
          </StyledData>
        </Field>
        <Field>
          <StyledHeader>NCA</StyledHeader>
          <StyledData>
            { ncaScale }
            <ScoreScale dims={SCALE_DIMS} score={ncaScale} />
          </StyledData>
        </Field>
        <Field>
          <StyledHeader>FTA</StyledHeader>
          <StyledData>
            { ftaScale }
            <ScoreScale dims={SCALE_DIMS} score={ftaScale} />
          </StyledData>
        </Field>
      </>
    );
  }

  render() {

    return (
      <PSAStatsSection>
        { this.renderStatsHeader() }
        { this.renderPSAMetaData() }
        { this.renderScores() }
      </PSAStatsSection>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const hearings = state.get(STATE.HEARINGS);
  const review = state.get(STATE.REVIEW);

  return {
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.ENTITY_SETS_BY_ORG]: app.get(APP_DATA.ENTITY_SETS_BY_ORG),

    submitExistingHearingReqState: getReqState(hearings, HEARINGS_ACTIONS.SUBMIT_EXISTING_HEARING),
    [REVIEW.PSA_NEIGHBORS_BY_ID]: review.get(REVIEW.PSA_NEIGHBORS_BY_ID)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  actions.submitExistingHearing = submitExistingHearing;

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PSAStats);
