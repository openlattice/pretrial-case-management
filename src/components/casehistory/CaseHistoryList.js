/*
 * @flow
 */
import React from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Button, Tag } from 'lattice-ui-kit';
import { DateTime } from 'luxon';

import ChargeList from '../charges/ChargeList';
import LoadingSpinner from '../LoadingSpinner';
import { getEntityProperties, getFirstNeighborValue } from '../../utils/DataUtils';
import { formatDateList, formatDateTime } from '../../utils/FormattingUtils';
import { Count, NoResults, Title } from '../../utils/Layout';
import { OL } from '../../utils/consts/Colors';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const TERMINATED = 'Terminated';

const {
  CASE_ID,
  CASE_STATUS,
  ENTITY_KEY_ID,
  FILE_DATE,
  LAST_UPDATED_DATE,
} = PROPERTY_TYPES;

const InfoRow = styled.div`
  align-items: center;
  background-color: ${OL.GREY09};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 15px 30px 15px 0;
`;

const TitleWrapper = styled.div`
  align-items: center;
  border-bottom: ${(props :Object) => (props.modal ? `1px solid ${OL.GREY01}` : 'none')};
  border-top: ${(props :Object) => (props.modal ? `1px solid ${OL.GREY01}` : 'none')};
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  padding-left: 30px;
`;

const InfoItem = styled.div`
  align-items: center;
  color: ${OL.GREY01};
  display: flex;
  padding: 0 30px;
`;

const CaseHistoryContainer = styled.div`
  height: 100%;
  width: 100%;
`;

const StyledSpinner = styled(LoadingSpinner)`
  align-items: center;
  display: flex;
  height: 100px;
  justify-content: center;
  margin: ${(props :Object) => (props.modal ? '0 -30px 30px' : '0')};
  width: 100%;
`;

const InfoRowContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

type Props = {
  addCaseToPSA :(caseEKID :UUID) => void;
  caseHistory :List;
  caseNumbersToAssociationId :Map;
  chargeHistory :Map;
  isCompact ?:boolean;
  loading ?:boolean;
  modal ?:boolean;
  pendingCases ?:boolean;
  psaPermissions ?:boolean;
  removeCaseFromPSA :(associationEKID :UUID) => void,
  title :string;
};

const CaseHistoryList = ({
  addCaseToPSA,
  caseHistory,
  chargeHistory,
  caseNumbersToAssociationId,
  isCompact,
  loading,
  modal,
  pendingCases,
  psaPermissions,
  removeCaseFromPSA,
  title,
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
      // $FlowFixMe
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
        [FILE_DATE]: fileDate,
        [LAST_UPDATED_DATE]: lastUpdated,
        [CASE_STATUS]: caseStatus,
      } = getEntityProperties(caseObj, [ENTITY_KEY_ID, CASE_ID, FILE_DATE, LAST_UPDATED_DATE, CASE_STATUS]);
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
              {
                (psaPermissions && hasBeenUpdated)
                && (
                  <InfoItem modal={modal}>
                    <Tag mode="danger">Updated</Tag>
                  </InfoItem>
                )
              }
              {
                (caseStatus === TERMINATED)
                && (
                  <InfoItem modal={modal}>
                    <Tag mode="danger">{`${TERMINATED} (${formatDateTime(lastUpdated)})`}</Tag>
                  </InfoItem>
                )
              }
            </InfoRowContainer>
            { caseNumbersToAssociationId ? addCaseToPSAButton(caseEKID, caseId) : null }
          </InfoRow>
          <ChargeList
              charges={charges}
              detailed
              isCompact={isCompact}
              modal={modal}
              pretrialCaseDetails={caseObj} />
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
  addCaseToPSA: () => {},
  caseNumbersToAssociationId: Map(),
  isCompact: false,
  loading: false,
  modal: false,
  pendingCases: false,
  psaPermissions: false,
  removeCaseFromPSA: () => {},
};

export default CaseHistoryList;
