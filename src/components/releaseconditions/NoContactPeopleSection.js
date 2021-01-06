/*
 * @flow
 */

/* Packages */
import React from 'react';
import styled from 'styled-components';
import { List } from 'immutable';
import { Button, Input, Select } from 'lattice-ui-kit';

/* Compoents */
import { NoContactRow } from './ReleaseConditionsStyledTags';

/* Consts */
import { NO_CONTACT_TYPES } from '../../utils/consts/ReleaseConditionConsts';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

/* Styled Components */
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

const StyledBasicButton = styled(Button)`
  width: 100%;
  max-width: 210px;
  height: 40px;
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
  const personTypeOptions = List().withMutations((mutableList) => {
    Object.values(NO_CONTACT_TYPES).forEach((val) => {
      mutableList.push({ label: val, value: val });
    });
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
              <Select
                  value={{ label: person[PROPERTY_TYPES.PERSON_TYPE], value: person[PROPERTY_TYPES.PERSON_TYPE] }}
                  placeholder="Select"
                  onChange={(value) => handleOnListChange(PROPERTY_TYPES.PERSON_TYPE, value, index)}
                  options={personTypeOptions}
                  isDisabled={disabled} />
            </NoContactPeopleCell>
            <NoContactPeopleCell>
              <Input
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
