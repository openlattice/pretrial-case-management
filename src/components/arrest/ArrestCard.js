/*
 * @flow
 */
import React from 'react';
import Immutable from 'immutable';

import ContentBlock from '../ContentBlock';
import ContentSection from '../ContentSection';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import { formatDateTime } from '../../utils/FormattingUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const {
  ARRESTING_AGENCY,
  CASE_ID,
  ARREST_DATE_TIME
} = PROPERTY_TYPES;

type Props = {
  arrest :Immutable.Map<*, *>,
  component :String
};

const ArrestCard = ({ arrest, component } :Props) => {
  const caseNum = arrest.getIn([CASE_ID, 0], '');
  const arrestDateTime = arrest.getIn([ARREST_DATE_TIME, 0], '');
  const arrestDate = formatDateTime(arrestDateTime, 'MM/DD/YYYY');
  const arrestTime = formatDateTime(arrestDateTime, 'HH:MM');
  const arrestAgency = arrest.getIn([ARRESTING_AGENCY, 0], '');

  let generalContent;

  if (component === CONTENT_CONSTS.FORM_CONTAINER) {
    generalContent = [
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
  }
  else {
    generalContent = [
      {
        label: 'Arrest Date',
        content: [arrestDate]
      },
      {
        label: 'Arrest Time',
        content: [arrestTime]
      }
    ];
  }

  const content = generalContent.map((item, idx) => (
    <ContentBlock
        component={component}
        contentBlock={item}
        key={`${item.label}-${idx}`} />
  ));

  return (
    <ContentSection
        component={component}
        header="Arrest">
      {content}
    </ContentSection>
  );
};

export default ArrestCard;
