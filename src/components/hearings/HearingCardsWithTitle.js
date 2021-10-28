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

const HearingCardsWithTitle = ({
  hearings,
  hearingsWithOutcomes,
  handleSelect,
  readOnly,
  noHearingsMessage,
  selectedHearing,
  title,
  subtitle
} :{
  handleSelect :(row :Immutable.Map<*, *>, hearingId :string, entityKeyId :string) => void,
  hearings :Immutable.List<*>,
  hearingsWithOutcomes :Immutable.List<*>,
  readOnly ?:boolean,
  noHearingsMessage ?:string,
  selectedHearing ?:Object,
  title :string,
  subtitle ?:string
}) => (
  <Wrapper>
    <Title withSubtitle>
      <span>{title}</span>
      {subtitle || null}
    </Title>
    <HearingCardsHolder
        hearings={hearings}
        hearingsWithOutcomes={hearingsWithOutcomes}
        readOnly={readOnly}
        noHearingsMessage={noHearingsMessage}
        selectedHearing={selectedHearing}
        handleSelect={handleSelect} />
  </Wrapper>
);

HearingCardsWithTitle.defaultProps = {
  readOnly: false,
  noHearingsMessage: '',
  selectedHearing: undefined,
  subtitle: ''
};

export default HearingCardsWithTitle;
