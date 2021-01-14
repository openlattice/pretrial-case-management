import React from 'react';
import styled from 'styled-components';
import { fromJS } from 'immutable';
import { CardSegment } from 'lattice-ui-kit';

import RiskFactorsTable from '../riskfactors/RiskFactorsTable';

import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { ResultHeader } from '../../utils/Layout';

const formatRiskFactor = (riskFactorList) => {
  // if riskFactor is a string return the riskFactor
  if (!riskFactorList || !riskFactorList.length || riskFactorList.includes(undefined)) return '';
  const riskFactor = riskFactorList[0];
  // if riskFactor is a string return the riskFactor
  if (typeof riskFactor === 'string') return riskFactor;
  // if riskFactor is a boolean return 'Yes' for true, and 'No' for false.
  if (typeof riskFactor === 'boolean') return riskFactor ? 'Yes' : 'No';
  return '';
};

const ResultHeaderForCard = styled(ResultHeader)`
  margin-top: 0;
  padding-left: 30px;
`;

type Props = {
  riskFactors :Object;
};

const PSARiskFactorsTable = ({ riskFactors } :Props) => {

  const rows = fromJS([
    {
      number: 1,
      riskFactor: 'Age at Current Arrest',
      response: formatRiskFactor(riskFactors[PROPERTY_TYPES.AGE_AT_CURRENT_ARREST])
    },
    {
      number: 2,
      riskFactor: 'Current Violent Offense',
      response: formatRiskFactor(riskFactors[PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE])
    },
    {
      number: '2a',
      riskFactor: 'Current Violent Offense & 20 Years Old or Younger',
      italicText: '(calculated from 1 and 2)',
      response: formatRiskFactor(riskFactors[PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE_AND_YOUNG])
    },
    {
      number: 3,
      riskFactor: 'Pending Charge at the Time of the Arrest',
      response: formatRiskFactor(riskFactors[PROPERTY_TYPES.PENDING_CHARGE])
    },
    {
      number: 4,
      riskFactor: 'Prior Misdemeanor Conviction',
      response: formatRiskFactor(riskFactors[PROPERTY_TYPES.PRIOR_MISDEMEANOR])
    },
    {
      number: 5,
      riskFactor: 'Prior Felony Conviction',
      response: formatRiskFactor(riskFactors[PROPERTY_TYPES.PRIOR_FELONY])
    },
    {
      number: '5a',
      riskFactor: 'Prior Conviction',
      italicText: '(calculated from 4 and 5)',
      response: formatRiskFactor(riskFactors[PROPERTY_TYPES.PRIOR_CONVICTION])
    },
    {
      number: 6,
      riskFactor: 'Prior Violent Conviction',
      response: formatRiskFactor(riskFactors[PROPERTY_TYPES.PRIOR_VIOLENT_CONVICTION])
    },
    {
      number: 7,
      riskFactor: 'Prior Pretrial Failure to Appear in Past 2 Years',
      response: formatRiskFactor(riskFactors[PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_RECENT])
    },
    {
      number: 8,
      riskFactor: 'Prior Pretrial Failure to Appear Older than 2 Years',
      response: formatRiskFactor(riskFactors[PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_OLD])
    },
    {
      number: 9,
      riskFactor: 'Prior Sentences to Incarceration',
      response: formatRiskFactor(riskFactors[PROPERTY_TYPES.PRIOR_SENTENCE_TO_INCARCERATION])
    }
  ]);

  return (
    <CardSegment noBleed={false} padding="30px 0" vertical>
      <ResultHeaderForCard>Risk Factors</ResultHeaderForCard>
      <RiskFactorsTable disabled rows={rows} />
    </CardSegment>
  );
};

export default PSARiskFactorsTable;
