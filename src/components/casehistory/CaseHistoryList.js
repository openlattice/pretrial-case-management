/*
 * @flow
 */
import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import moment from 'moment';

import ChargeList from '../charges/ChargeList';
import LoadingSpinner from '../LoadingSpinner';
import { Title, Count } from '../../utils/Layout';
import { formatDateList } from '../../utils/FormattingUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const InfoRow = styled.div`
  background-color: #f5f5f8;
  display: flex;
  flex-direction: row;
  padding: 15px 0;
  margin: 0 -30px;
`;

const NoResults = styled.div`
  margin: 0 -30px 30px;
  font-size: 18px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  width: 100%;
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  border-bottom: 1px solid #555e6f;
  border-top: 1px solid #555e6f;
  padding-left: 30px;
  margin: 20px -30px 0;
`;

const InfoItem = styled.div`
  margin: 0 30px;
  color: #555e6f;
`;

const CaseHistoryContainer = styled.div`
  height: 100%;
`;

const StyledSpinner = styled(LoadingSpinner)`
  margin: 0 -30px 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  width: 100%;
`

type Props = {
  caseHistory :Immutable.List<*>,
  chargeHistory :Immutable.Map<*, *>,
  loading :boolean,
  modal :boolean,
  title :string,
};

const CaseHistoryList = ({
  title,
  caseHistory,
  chargeHistory,
  loading,
  modal
} :Props) => {
  const caseCount = caseHistory.size;
  const cases = caseHistory
    .sort((c1, c2) => {
      const date1 = moment(c1.getIn([PROPERTY_TYPES.FILE_DATE, 0], ''));
      const date2 = moment(c2.getIn([PROPERTY_TYPES.FILE_DATE, 0], ''));
      return date1.isBefore(date2) ? 1 : -1;
    })
    .filter(caseObj => caseObj.getIn([PROPERTY_TYPES.CASE_ID, 0], '').length)
    .map((caseObj) => {
      const caseNum = caseObj.getIn([PROPERTY_TYPES.CASE_ID, 0], '');
      const charges = chargeHistory.get(caseNum);
      const fileDate = formatDateList(caseObj.get(PROPERTY_TYPES.FILE_DATE, Immutable.List()));
      return (
        <div key={caseNum}>
          <InfoRow>
            <InfoItem>{`Case Number: ${caseNum}`}</InfoItem>
            <InfoItem>{`File Date: ${fileDate}`}</InfoItem>
          </InfoRow>
          <ChargeList modal={modal} pretrialCaseDetails={caseObj} charges={charges} detailed historical />
        </div>
      );
    });
  const casesDisplay = cases.size
    ? cases
    : <NoResults>No Cases Found</NoResults>;

  return (
    <CaseHistoryContainer>
      <TitleWrapper>
        <Title withSubtitle>
          <span>{title}</span>
        </Title>
        <Count>{caseCount}</Count>
      </TitleWrapper>
      {
        loading
          ? <StyledSpinner />
          : casesDisplay
      }
    </CaseHistoryContainer>
  );
};

export default CaseHistoryList;
