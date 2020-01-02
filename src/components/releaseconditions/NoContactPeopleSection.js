/*
 * @flow
 */

/*
 * Packages
 */
import React from 'react';
import styled from 'styled-components';
import { OrderedMap } from 'immutable';

/*
* Compoents
*/
import BasicButton from '../buttons/BasicButton';
import StyledInput from '../controls/StyledInput';
import SearchableSelect from '../controls/SearchableSelect';
import { NoContactRow } from './ReleaseConditionsStyledTags';

/*
* Consts
*/
import { NO_CONTACT_TYPES } from '../../utils/consts/ReleaseConditionConsts';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';


/*
* Styled Components
*/
const NoContactPeopleWrapper = styled.div`
  width: 100%;
  padding: 15px 0 30px;
  display: flex;
  flex-direction: column;
  hr {
    margin-top: 10px;
  }
`;

const NoContactPeopleCell = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;


const StyledNoContactRow = styled(NoContactRow)`
  margin-bottom: 20px;
`;


const StyledBasicButton = styled(BasicButton)`
  width: 100%;
  max-width: 210px;
  height: 40px;
  background-color: ${(props) => (props.update ? OL.PURPLE02 : OL.GREY08)};
  color: ${(props) => (props.update ? OL.WHITE : OL.GREY02)};
`;

type Props = {
  disabled :boolean,
  noContactPeople :Object,
  handleOnListChange :(field :string, value :string, index :number) => void,
  removePersonRow :(index :number) => void
}

const renderNoContactPeople = ({
  disabled,
  handleOnListChange,
  noContactPeople,
  removePersonRow
} :Props) => {
  let personTypeOptions = OrderedMap();
  Object.values(NO_CONTACT_TYPES).forEach((val) => {
    personTypeOptions = personTypeOptions.set(val, val);
  });
  return (
    <NoContactPeopleWrapper>
      <h2>No contact order</h2>
      <NoContactRow>
        <h3>Person Type</h3>
        <h3>Person Name</h3>
      </NoContactRow>
      {
        noContactPeople.map((person, index) => (
          <StyledNoContactRow key={person.name}>
            <NoContactPeopleCell>
              <SearchableSelect
                  value={person[PROPERTY_TYPES.PERSON_TYPE]}
                  searchPlaceholder="Select"
                  onSelect={(value) => handleOnListChange(PROPERTY_TYPES.PERSON_TYPE, value, index)}
                  options={personTypeOptions}
                  disabled={disabled}
                  selectOnly
                  transparent
                  short />
            </NoContactPeopleCell>
            <NoContactPeopleCell>
              <StyledInput
                  value={person[PROPERTY_TYPES.PERSON_NAME]}
                  onChange={(e) => handleOnListChange(PROPERTY_TYPES.PERSON_NAME, e.target.value, index)}
                  disabled={disabled} />
            </NoContactPeopleCell>
            <NoContactPeopleCell>
              <StyledBasicButton onClick={() => removePersonRow(index)}>
                Remove
              </StyledBasicButton>
            </NoContactPeopleCell>
          </StyledNoContactRow>
        ))
      }
      <hr />
    </NoContactPeopleWrapper>
  );
};

export default renderNoContactPeople;
