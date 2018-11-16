/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';
import moment from 'moment';

import ContentBlock from '../ContentBlock';
import InfoButton from '../buttons/InfoButton';
import ContentSection from '../ContentSection';
import defaultUserIcon from '../../assets/svg/profile-placeholder-rectangle-big.svg';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { formatDateList, formatValue } from '../../utils/FormattingUtils';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';

const {
  DOB,
  FIRST_NAME,
  MIDDLE_NAME,
  LAST_NAME
} = PROPERTY_TYPES;

const EditContactButton = styled(InfoButton)`
  padding: 0;
  font-size: 14px;
  width: 160px;
  height: 40px;
`;
const HeaderWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

type Props = {
  selectedPersonData :Immutable.Map<*, *>,
  contactInfo :Immutable.Map<*, *>,
  openUpdateContactModal :() => void
}

class AboutPersonGeneral extends React.Component<Props, *> {

  renderContactModal = () => {
    const { openUpdateContactModal } = this.props;
    return (
      <EditContactButton onClick={openUpdateContactModal}>
        Edit Contact Info
      </EditContactButton>
    );
  };

  formatName = name => (
    name.split(' ').map(n => (n.charAt(0).toUpperCase() + n.slice(1).toLowerCase())).join(' ')
  )

  render() {
    const { selectedPersonData, contactInfo } = this.props;

    let generalContent = [];

    let age = '';
    const firstName = formatValue(selectedPersonData.get(FIRST_NAME, Immutable.List()));
    const formattedFirstName = this.formatName(firstName);
    const middleName = formatValue(selectedPersonData.get(MIDDLE_NAME, Immutable.List()));
    const formattedMiddleName = this.formatName(middleName);
    const lastName = formatValue(selectedPersonData.get(LAST_NAME, Immutable.List()));
    const formattedLastName = this.formatName(lastName);
    const dobList = selectedPersonData.get(DOB, Immutable.List());
    const dob = formatDateList(dobList);
    const phone = contactInfo.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PHONE, 0], '');
    const isMobile = contactInfo.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.IS_MOBILE, 0], '');

    if (dobList.size) {
      age = moment().diff(moment(dobList.get(0, '')), 'years');
    }

    try {
      if (selectedPersonData) {
        generalContent = [
          {
            label: 'Last Name',
            content: [(lastName ? formattedLastName : lastName)]
          },
          {
            label: 'Middle Name',
            content: [
              (middleName ? formattedMiddleName : middleName)
            ]
          },
          {
            label: 'First Name',
            content: [(firstName ? formattedFirstName : firstName)]
          },
          {
            label: (isMobile ? 'Phone (mobile)' : 'Phone'),
            content: [(phone || 'NA')]
          },
          {
            label: 'Date of Birth',
            content: [dob]
          },
          {
            label: 'Age',
            content: [age]
          },
          {
            label: 'Gender',
            content: [formatValue(selectedPersonData.get(PROPERTY_TYPES.SEX))]
          },
          {
            label: 'Race',
            content: [formatValue(selectedPersonData.get(PROPERTY_TYPES.RACE))]
          }
        ];
      }
    }
    catch (e) {
      console.error(e);
    }

    const content = generalContent.map(person => (
      <ContentBlock
          contentBlock={person}
          component={CONTENT_CONSTS.PROFILE}
          key={person.label} />
    ));

    const header = (
      <HeaderWrapper>
        {`${firstName} ${middleName} ${lastName}`}
        { this.renderContactModal() }
      </HeaderWrapper>
    );

    return (
      <ContentSection
          photo={defaultUserIcon}
          component={CONTENT_CONSTS.PROFILE}
          header={header}>
        {content}
      </ContentSection>
    );
  }
}

export default AboutPersonGeneral;
