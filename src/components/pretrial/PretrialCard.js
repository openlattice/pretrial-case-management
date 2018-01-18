import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import styled from 'styled-components';

import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const {
  CASE_ID_FQN,
  ARREST_DATE_FQN,
  MOST_SERIOUS_CHARGE_NO,
  MOST_SERIOUS_CHARGE_DESC,
  MOST_SERIOUS_CHARGE_DEG,
  NUMBER_OF_CHARGES_FQN
} = PROPERTY_TYPES;

const CaseResultWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1 0 auto;
  margin: 10px 0;
`;

const CaseInfoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-left: 10px;
`;

const CaseInfoHeaders = styled.div`
  display: flex;
  text-align: left;
  flex-direction: column;
  justify-content: space-around;
  strong {
    font-weight: 600;
  }
`;

const CaseInfo = styled.div`
  display: flex;
  text-align: left;
  flex-direction: column;
  justify-content: space-around;
  margin: 0;
  margin-left: 10px;
  span {
    margin: 0;
  }
`;

const FlexContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export default class PretrialCard extends React.Component {
  static propTypes = {
    pretrialCase: PropTypes.object.isRequired,
    handleSelect: PropTypes.func
  };

  render() {
    const { pretrialCase, handleSelect } = this.props;
    const Wrapper = styled(CaseResultWrapper)`
      &:hover {
        cursor: ${handleSelect ? 'pointer' : 'default'};
      }
    `;

    const caseNum = pretrialCase.getIn([CASE_ID_FQN, 0]);
    const arrestDate = pretrialCase.getIn([ARREST_DATE_FQN, 0]);
    let arrestDateFormatted = arrestDate;
    if (arrestDate) {
      arrestDateFormatted = moment(arrestDate).format('MMMM Do YYYY');
    }
    const mostSeriousChargeNum = pretrialCase.getIn([MOST_SERIOUS_CHARGE_NO, 0]);
    const mostSeriousChargeDesc = pretrialCase.getIn([MOST_SERIOUS_CHARGE_DESC, 0]);
    const mostSeriousChargeDeg = pretrialCase.getIn([MOST_SERIOUS_CHARGE_DEG, 0]);
    const numCharges = pretrialCase.getIn([NUMBER_OF_CHARGES_FQN, 0]);

    const entityKeyId :string = pretrialCase.get('id', '');

    return (
      <Wrapper
          key={entityKeyId}
          onClick={() => {
            if (handleSelect) {
              handleSelect(pretrialCase, entityKeyId);
            }
          }}>
        <CaseInfoWrapper>
          <CaseInfoHeaders>
            <strong>Case Number:</strong>
            <strong>Arrest Date:</strong>
            {
              handleSelect ? (
                <FlexContainer>
                  <strong>Most Serious Charge:</strong>
                  <strong>Most Serious Charge Description:</strong>
                  <strong>Most Serious Charge Degree:</strong>
                </FlexContainer>
              ) : null
            }
            <strong>Number of Charges:</strong>
          </CaseInfoHeaders>
          <CaseInfo>
            <span>{ caseNum }</span>
            <span>{ arrestDateFormatted }</span>
            {
              handleSelect ? (
                <FlexContainer>
                  <span>{ mostSeriousChargeNum }</span>
                  <span>{ mostSeriousChargeDesc }</span>
                  <span>{ mostSeriousChargeDeg }</span>
                </FlexContainer>
              ) : null
            }
            <span>{ numCharges }</span>
          </CaseInfo>
        </CaseInfoWrapper>
      </Wrapper>
    );
  }

}
