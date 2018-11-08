/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';

import HearingCardsHolder from './HearingCardsHolder';
import { Title } from '../../utils/Layout';

const Wrapper = styled.div`
  width: 100%;
  padding-bottom: 30px;
`;

type Props = {
  hearings :Immutable.List<*>,
  hearingsWithOutcomes :Immutable.List<*>,
  selectedHearing :Object,
  handleSelect :(row :Immutable.Map<*, *>, hearingId :string, entityKeyId :string) => void,
  title :string,
  subtitle :string
}

const HearingCardsWithTitle = ({
  hearings,
  hearingsWithOutcomes,
  handleSelect,
  selectedHearing,
  title,
  subtitle
} :Props) => (
  <Wrapper>
    <Title withSubtitle>
      <span>{title}</span>
      {subtitle || null}
    </Title>
    <HearingCardsHolder
        hearings={hearings}
        hearingsWithOutcomes={hearingsWithOutcomes}
        selectedHearing={selectedHearing}
        handleSelect={handleSelect} />
  </Wrapper>
);

export default HearingCardsWithTitle;
