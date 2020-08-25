/*
 * @flow
 */
import React from 'react';
import { List, Map } from 'immutable';
import styled from 'styled-components';
// $FlowFixMe
import { DateTime } from 'luxon';
import { Button } from 'lattice-ui-kit';

import ChargeList from '../charges/ChargeList';
import LoadingSpinner from '../LoadingSpinner';
import { OL } from '../../utils/consts/Colors';
import { formatDateList } from '../../utils/FormattingUtils';
import { getEntityProperties, getFirstNeighborValue } from '../../utils/DataUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import {
  NoResults,
  Title,
  Count,
  PendingChargeStatus
} from '../../utils/Layout';

const {
  ENTITY_KEY_ID,
  CASE_ID,
  FILE_DATE,
} = PROPERTY_TYPES;

const InfoRow = styled.div`
  background-color: ${OL.GREY09};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px 15px 0;
  margin: ${(props :Object) => (props.modal ? '0 -30px' : '0')};
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  border-bottom: ${(props :Object) => (props.modal ? `1px solid ${OL.GREY01}` : 'none')};
  border-top: ${(props :Object) => (props.modal ? `1px solid ${OL.GREY01}` : 'none')};
  padding-left: 30px;
  margin: ${(props :Object) => (props.modal ? '20px -30px 0' : 0)};
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  margin: ${(props :Object) => (props.modal ? '0 30px' : '0')};
  padding: ${(props :Object) => (props.modal ? '0' : '0 30px')};
  color: ${OL.GREY01};
`;

const CaseHistoryContainer = styled.div`
  width: ${(props :Object) => (props.modal ? 'auto' : '100%')};
  height: 100%;
`;

const StyledSpinner = styled(LoadingSpinner)`
  margin: ${(props :Object) => (props.modal ? '0 -30px 30px' : '0')};
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  width: 100%;
`;

const InfoRowContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

type Props = {
  addCaseToPSA ?:(caseEKID :UUID) => void,
  removeCaseFromPSA ?:(associationEKID :UUID) => void,
  caseHistory :List<*>,
  chargeHistory :Map<*, *>,
  caseNumbersToAssociationId :Map<*, *>,
  loading :boolean,
  modal ?:boolean,
  pendingCases ?:boolean,
  psaPermissions ?:boolean,
  title :string,
  isCompact ?:boolean
};

const CaseHistoryList = ({
  addCaseToPSA,
  removeCaseFromPSA,
  caseNumbersToAssociationId,
  title,
  caseHistory,
  chargeHistory,
  loading,
  pendingCases,
  psaPermissions,
  modal,
  isCompact
} :Props) => {
  const addCaseToPSAButton = (caseEKID, caseNum) => {
    const associationEKID = caseNumbersToAssociationId.get(caseNum);
    let onClick = () => addCaseToPSA(caseEKID);
    let buttonText = 'Add to PSA';
    if (associationEKID) {
      onClick = () => removeCaseFromPSA(associationEKID);
      buttonText = 'Remove From PSA';
    }
    return (psaPermissions && caseNum && pendingCases)
      ? (
        <Button
            onClick={onClick}>
          {buttonText}
        </Button>
      ) : null;
  };

  const caseCount = caseHistory.size;
  const oneWeekAgo = DateTime.local().minus({ week: 1 });
  const cases = caseHistory
    .sort((c1, c2) => {
      const date1 = DateTime.fromISO(getFirstNeighborValue(c1, PROPERTY_TYPES.FILE_DATE));
      const date2 = DateTime.fromISO(getFirstNeighborValue(c2, PROPERTY_TYPES.FILE_DATE));
      return date1 < date2 ? 1 : -1;
    })
    .filter((caseObj) => {
      const caseId = getFirstNeighborValue(caseObj, PROPERTY_TYPES.CASE_ID);
      const charges = chargeHistory.get(caseId, List());
      return caseId.length && charges.size;
    })
    .map((caseObj) => {
      const {
        [ENTITY_KEY_ID]: caseEKID,
        [CASE_ID]: caseId,
        [FILE_DATE]: fileDate
      } = getEntityProperties(caseObj, [ENTITY_KEY_ID, CASE_ID, FILE_DATE]);
      const formattedFileDate = formatDateList([fileDate]);
      const charges = chargeHistory.get(caseId);
      const dateList = caseObj.get(PROPERTY_TYPES.FILE_DATE, List());
      const hasBeenUpdated = dateList.some((date) => oneWeekAgo < date);
      return (
        <div key={caseId}>
          <InfoRow modal={modal}>
            <InfoRowContainer>
              <InfoItem modal={modal}>{`Case Number: ${caseId}`}</InfoItem>
              <InfoItem modal={modal}>{`File Date: ${formattedFileDate}`}</InfoItem>
              <InfoItem modal={modal}>
                { (psaPermissions && hasBeenUpdated)
                  ? <PendingChargeStatus pendingCharges>Updated</PendingChargeStatus>
                  : null}
              </InfoItem>
            </InfoRowContainer>
            { caseNumbersToAssociationId ? addCaseToPSAButton(caseEKID, caseId) : null }
          </InfoRow>
          <ChargeList
              isCompact={isCompact}
              modal={modal}
              pretrialCaseDetails={caseObj}
              charges={charges}
              detailed />
        </div>
      );
    });

  const instructionsText = cases.size
    ? 'Navigate to Case History tab to add more court cases to this PSA.'
    : 'Navigate to Case History tab to add court cases to this PSA.';
  const noResultsText = psaPermissions ? instructionsText : 'No Cases Found';
  const casesDisplay = (
    <>
      {cases}
      { (cases.size) ? null : <NoResults>{noResultsText}</NoResults> }
    </>
  );

  return (
    <CaseHistoryContainer>
      {
        title
          ? (
            <TitleWrapper modal={modal}>
              <Title withSubtitle>
                <span>{title}</span>
              </Title>
              <Count>{caseCount}</Count>
            </TitleWrapper>
          ) : null
      }
      {
        loading
          ? <StyledSpinner />
          : casesDisplay
      }
    </CaseHistoryContainer>
  );
};

CaseHistoryList.defaultProps = {
  modal: false,
  isCompact: false,
  addCaseToPSA: () => {},
  removeCaseFromPSA: () => {},
  pendingCases: false,
  psaPermissions: false,
};

export default CaseHistoryList;
