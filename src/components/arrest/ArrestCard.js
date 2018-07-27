/*
 * @flow
 */
import React from 'react';
import Immutable from 'immutable';

import ContentBlock from '../ContentBlock';
import ContentSection from '../ContentSection';
import { formatDateTime } from '../../utils/Utils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const {
  ARRESTING_AGENCY,
  CASE_ID,
  ARREST_DATE,
  ARREST_DATE_TIME
} = PROPERTY_TYPES;

type Props = {
  arrest :Immutable.Map<*, *>,
  handleSelect? :(arrest :Immutable.Map<*, *>, entityKeyId :string) => void
};

const ArrestCard = ({ arrest, component, handleSelect } :Props) => {
  let caseNum;
  let arrestDateTime;
  let arrestDate;
  let arrestTime;
  let arrestAgency;
  if (component === 'FormContainer') {
    caseNum = arrest.getIn([CASE_ID, 0]);
    arrestDateTime = arrest.getIn([ARREST_DATE_TIME, 0], arrest.getIn([ARREST_DATE, 0], ''));
    arrestDate = formatDateTime(arrestDateTime, 'MM/DD/YYYY');
    arrestTime = formatDateTime(arrestDateTime, 'HH:mm');
    arrestAgency = arrest.getIn([ARRESTING_AGENCY, 0]);
  }
  else if (component === 'summary') {
    caseNum = arrest.getIn([0, CASE_ID]);
    arrestDateTime = arrest.getIn([0, ARREST_DATE_TIME]);
    arrestDate = formatDateTime(arrestDateTime, 'MM/DD/YYYY');
    arrestTime = formatDateTime(arrestDateTime, 'HH:mm');
    arrestAgency = arrest.getIn([0, PROPERTY_TYPES.ARRESTING_AGENCY]);
  }

  const generalContent = [
    {
      label: 'Case Number',
      content: [caseNum]
    },
    {
      label: '',
      content: ['']
    },
    {
      label: 'Arrest Date',
      content: [arrestDate]
    },
    {
      label: 'Arrest Time',
      content: [arrestTime]
    },
    {
      label: 'Arresting Agency',
      content: [arrestAgency]
    }
  ];
  const content = generalContent.map((item, idx) => (
    <ContentBlock
        component={component}
        contentBlock={item}
        key={`${item.label}-${idx}`} />
  ));

  return (
    <ContentSection
        component={component}
        header="Arrest" >
      {content}
    </ContentSection>
  );
};

ArrestCard.defaultProps = {
  handleSelect: () => {}
};

export default ArrestCard;
