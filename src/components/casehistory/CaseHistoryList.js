/*
 * @flow
 */
import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import moment from 'moment';

import ChargeList from '../charges/ChargeList';
import { OL } from '../../utils/consts/Colors';
import { Title } from '../../utils/Layout';
import { formatDateList } from '../../utils/FormattingUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const InfoRow = styled.div`
  background-color: ${OL.GREY09};
  display: flex;
  flex-direction: row;
  padding: 15px 0;
  margin: 0 -30px;
`;

const InfoItem = styled.div`
  margin: 0 30px;
  color: ${OL.GREY01};
`;

const CaseHistoryContainer = styled.div`
  height: 100%;
`;

type Props = {
  caseHistory :Immutable.List<*>,
  chargeHistory :Immutable.Map<*, *>,
  modal :boolean
};

const CaseHistoryList = ({ caseHistory, chargeHistory, modal } :Props) => {

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

  return (
    <CaseHistoryContainer>
      <Title withSubtitle >
        <span>Case History</span>
      </Title>
      {cases}
    </CaseHistoryContainer>
  );
};

export default CaseHistoryList;
