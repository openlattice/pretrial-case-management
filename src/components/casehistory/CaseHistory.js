/*
 * @flow
 */
import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';

import ChargeHistoryStats from './ChargeHistoryStats';
import CaseHistoryList from './CaseHistoryList';

const CaseHistoryWrapper = styled.div`
  hr {
    margin: ${props => (props.modal ? '30px -30px' : '15px 0')};
    width: ${props => (props.modal ? 'calc(100% + 60px)' : '100%')};
  }
`;

type Props = {
  caseHistory :Immutable.List<*>,
  chargeHistory :Immutable.Map<*, *>,
  modal :boolean
};

const CaseHistory = ({ caseHistory, chargeHistory, modal } :Props) => (
  <CaseHistoryWrapper modal={modal}>
    <ChargeHistoryStats chargeHistory={chargeHistory} />
    <CaseHistoryList
        caseHistory={caseHistory}
        chargeHistory={chargeHistory}
        modal={modal} />
  </CaseHistoryWrapper>
);

export default CaseHistory;
