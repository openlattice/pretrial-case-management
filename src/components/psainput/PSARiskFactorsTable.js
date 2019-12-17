/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { fromJS } from 'immutable';
import { Card, CardSegment } from 'lattice-ui-kit';

import RiskFactorsTable from '../riskfactors/RiskFactorsTable';

import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { ResultHeader } from '../../utils/Layout';

const format = (valList) => {
  if (!valList || !valList.length) return '';
  const val = valList[0];
  if (val.length) return val;
  return val ? 'Yes' : 'No';
};

const ResultHeaderForCard = styled(ResultHeader)`
  margin: 0;
  padding: 0 0 20px 20px;
`;

type Props = {
  riskFactors :Object;
};

const PSARiskFactorsTable = ({ riskFactors } :Props) => {

  const rows = fromJS([
    {
      number: 1,
      riskFactor: 'Age at Current Arrest',
      response: format(riskFactors[PROPERTY_TYPES.AGE_AT_CURRENT_ARREST])
    },
    {
      number: 2,
      riskFactor: 'Current Violent Offense',
      response: format(riskFactors[PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE])
    },
    {
      number: '2a',
      riskFactor: 'Current Violent Offense & 20 Years Old or Younger',
      italicText: '(calculated from 1 and 2)',
      response: format(riskFactors[PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE_AND_YOUNG])
    },
    {
      number: 3,
      riskFactor: 'Pending Charge at the Time of the Offense',
      response: format(riskFactors[PROPERTY_TYPES.PENDING_CHARGE])
    },
    {
      number: 4,
      riskFactor: 'Prior Misdemeanor Conviction',
      response: format(riskFactors[PROPERTY_TYPES.PRIOR_MISDEMEANOR])
    },
    {
      number: 5,
      riskFactor: 'Prior Felony Conviction',
      response: format(riskFactors[PROPERTY_TYPES.PRIOR_FELONY])
    },
    {
      number: '5a',
      riskFactor: 'Prior Conviction',
      italicText: '(calculated from 4 and 5)',
      response: format(riskFactors[PROPERTY_TYPES.PRIOR_CONVICTION])
    },
    {
      number: 6,
      riskFactor: 'Prior Violent Conviction',
      response: format(riskFactors[PROPERTY_TYPES.PRIOR_VIOLENT_CONVICTION])
    },
    {
      number: 7,
      riskFactor: 'Prior Pretrial Failure to Appear in Past 2 Years',
      response: format(riskFactors[PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_RECENT])
    },
    {
      number: 8,
      riskFactor: 'Prior Pretrial Failure to Appear Older than 2 Years',
      response: format(riskFactors[PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_OLD])
    },
    {
      number: 9,
      riskFactor: 'Prior Sentence to Incarceration',
      response: format(riskFactors[PROPERTY_TYPES.PRIOR_SENTENCE_TO_INCARCERATION])
    }
  ]);

  return (
    <Card>
      <CardSegment noBleed={false} padding="10px 0" vertical>
        <ResultHeaderForCard>Risk Factors</ResultHeaderForCard>
        <RiskFactorsTable disabled rows={rows} />
      </CardSegment>
    </Card>
  );
};

export default PSARiskFactorsTable;
