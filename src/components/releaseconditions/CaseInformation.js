/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Button } from 'lattice-ui-kit';

import ChargeRows from './ChargeRows';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getChargeHistory } from '../../utils/CaseUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { formatDate } from '../../utils/FormattingUtils';
import { OL } from '../../utils/consts/Colors';

const { PRETRIAL_CASES } = APP_TYPES;

const {
  ENTITY_KEY_ID,
  CASE_ID,
  FILE_DATE,
} = PROPERTY_TYPES;

const CaseInformationWrapper = styled.div`
  border-bottom: 1px solid ${OL.GREY11};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 30px;
  width: 100%;
`;

const SectionHeader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  h1 {
    font-size: 16px;
    font-weight: 600;
    color: ${OL.GREY15};
  }
`;

const CaseInfoHeader = styled.div`
  background-color: ${OL.GREY09};
  padding: 0 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const CaseInfoHeaderText = styled.div`
  font-size: 12px;
  color: ${OL.GREY01};
`;

const IndividualCase = styled.div`
  margin: 0 -30px;
`;

type Props = {
  personNeighbors :Map<*, *>,
  hearingNeighbors :Map<*, *>,
  violentChargeList :Map<*, *>,
};

type State = {
  showDetails :boolean
};

class CaseInformation extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      showDetails: false
    };
  }

  showDetails = () => this.setState({ showDetails: true });
  hideDetails = () => this.setState({ showDetails: false });

  render() {
    const { showDetails } = this.state;
    const {
      personNeighbors,
      hearingNeighbors,
      violentChargeList
    } = this.props;
    const pretrialCases = hearingNeighbors.get(PRETRIAL_CASES, List());
    const chargeHistory = getChargeHistory(personNeighbors);

    if (!pretrialCases.size) return null;

    const hideOrShow = showDetails ? this.hideDetails : this.showDetails;
    const hideOrShowText = showDetails ? 'Hide Details' : 'Show Details';
    return (
      <CaseInformationWrapper>
        <SectionHeader key="Header">
          <h1>Case Information</h1>
        </SectionHeader>
        {
          pretrialCases.map((pretrialCase) => {
            const {
              [ENTITY_KEY_ID]: caseEKID,
              [CASE_ID]: caseNumber,
              [FILE_DATE]: fileDate
            } = getEntityProperties(pretrialCase, [ENTITY_KEY_ID, CASE_ID, FILE_DATE]);
            const charges = chargeHistory.get(caseNumber, List());
            return (
              <IndividualCase key={`${caseEKID}-${caseNumber}`}>
                <CaseInfoHeader key={caseEKID}>
                  <CaseInfoHeaderText>{`Case Number: ${caseNumber}`}</CaseInfoHeaderText>
                  <CaseInfoHeaderText>{`FileDate: ${formatDate(fileDate)}`}</CaseInfoHeaderText>
                  <Button size="sm" mode="subtle" onClick={hideOrShow}>
                    { hideOrShowText }
                  </Button>
                </CaseInfoHeader>
                <ChargeRows
                    caseNumber={caseNumber}
                    charges={charges}
                    pretrialCase={pretrialCase}
                    showDetails={showDetails}
                    violentChargeList={violentChargeList} />
              </IndividualCase>
            );
          })
        }
      </CaseInformationWrapper>
    );
  }
}

export default CaseInformation;
