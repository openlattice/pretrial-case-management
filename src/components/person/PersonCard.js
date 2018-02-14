import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import styled from 'styled-components';

import defaultUserIcon from '../../assets/images/user-profile-icon.png';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const {
  DOB,
  FIRST_NAME,
  LAST_NAME,
  SUFFIX,
  MUGSHOT,
  PERSON_ID,
  PICTURE
} = PROPERTY_TYPES;

const PersonResultWrapper = styled.div`
  display: flex;
  text-align: left;
  flex-direction: row;
  flex: 1 0 auto;
  margin: 10px 0;
`;

const PersonPictureWrapper = styled.div`

`;

const PersonPicture = styled.img`
  max-height: 100px;
`;

const PersonInfoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-left: 10px;
`;

const PersonInfoHeaders = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  strong {
    font-weight: 600;
  }
`;

const PersonInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  margin: 0;
  margin-left: 10px;
  span {
    margin: 0;
  }
`;

export default class PersonCard extends React.Component {
  static propTypes = {
    person: PropTypes.object.isRequired,
    handleSelect: PropTypes.func
  };

  render() {
    const { person, handleSelect } = this.props;

    const Wrapper = styled(PersonResultWrapper)`
      &:hover {
        cursor: ${handleSelect ? 'pointer' : 'default'};
      }
    `;


    let pictureAsBase64 :string = person.getIn([MUGSHOT, 0]);
    if (!pictureAsBase64) pictureAsBase64 = person.getIn([PICTURE, 0]);
    const pictureImgSrc = pictureAsBase64 ? `data:image/png;base64,${pictureAsBase64}` : defaultUserIcon;

    const firstName = person.getIn([FIRST_NAME, 0]);
    const lastName = person.getIn([LAST_NAME, 0]);
    const dob = person.getIn([DOB, 0]);
    const suffix = person.getIn([SUFFIX, 0]);
    let dobFormatted = dob;
    if (dob) {
      dobFormatted = moment.utc(dob).format('MMMM D, YYYY');
    }
    const id :string = person.getIn([PERSON_ID, 0], '');
    const entityKeyId :string = person.getIn(['id', 0], '');

    return (
      <Wrapper
          key={id}
          onClick={() => {
            if (handleSelect) {
              handleSelect(person, entityKeyId);
            }
          }}>
        <PersonPictureWrapper>
          <PersonPicture src={pictureImgSrc} role="presentation" />
        </PersonPictureWrapper>
        <PersonInfoWrapper>
          <PersonInfoHeaders>
            <strong>First Name:</strong>
            <strong>Last Name:</strong>
            { suffix ? <strong>Suffix:</strong> : null }
            <strong>Date of Birth:</strong>
            <strong>Identifier:</strong>
          </PersonInfoHeaders>
          <PersonInfo>
            <span>{ firstName }</span>
            <span>{ lastName }</span>
            { suffix ? suffix : null }
            <span>{ dobFormatted }</span>
            <span>{ id }</span>
          </PersonInfo>
        </PersonInfoWrapper>
      </Wrapper>
    );
  }

}
