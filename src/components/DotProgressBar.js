import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { OL } from '../utils/consts/Colors';

const GRAY = OL.GREY33;
const GREEN = OL.GREEN06;
const YELLOW_GREEN = OL.GREEN07;
const BLUE = OL.BLUE07;
const LIGHT_BLUE = OL.BLUE08;
const { WHITE } = OL;

const ProgressBar = styled.ol`
  margin: 0 auto;
  padding: 2em 0 3em;
  list-style: none;
  position: relative;
  display: flex;
  justify-content: space-between;
`;

const getProgressBarStep = (current, complete) => styled.li`
  text-align: center;
  position: relative;
  width: 100%;
  padding: 0 10px;

  &:before,
  &:after {
    content: "";
    height: 0.5em;
    background-color: ${GRAY};
    position: absolute;
    z-index: 1;
    width: 100%;
    left: -50%;
    top: 50%;
    transform: translateY(-50%);
    transition: all .25s ease-out;
  }

  &:first-child:before,
  &:first-child:after {
    display: none;
  }

  &:before {
    background-color: ${current || complete ? GREEN : GRAY}
  }

  &:after {
    background-color: ${complete ? GREEN : GRAY};
    width: 0%;
  }
`;

const ProgressBarIcon = styled.div`
  width: 1.5em;
  height: 1.5em;
  background-color: ${GRAY};
  color: ${GRAY};
  border-radius: 50%;
  max-width: 100%;
  z-index: 10;
  position: relative;
  transition: all .25s ease-out;
`;

const CurrentProgressBarIcon = styled(ProgressBarIcon)`
  color: ${YELLOW_GREEN};
  background-color: ${YELLOW_GREEN};
`;

const CompleteProgressBarIcon = styled(ProgressBarIcon)`
  color: ${WHITE};
  background-color: ${GREEN};
`;

const Check = styled(FontAwesomeIcon).attrs({
  name: 'check'
})`
  margin-top: 4px;
`;

const ProgressBarStepLabel = styled.span`
  display: block;
  text-transform: uppercase;
  color: ${GRAY};
  position: absolute;
  padding-top: 0.5em;
  padding-right: 20px;
  width: 100%;
  transition: all .25s ease-out;

  .is-current > &,
  .is-complete > & {
    color: ${GREEN};
  }
`;

const Wrapper = styled.div`
  font-size: 16px;
`;

export default class DotProgressBar extends React.Component {

  static propTypes = {
    numSteps: PropTypes.number.isRequired,
    current: PropTypes.number.isRequired
  };

  renderDots = () => {
    const { numSteps, current } = this.props;
    const dots = [];
    for (let i = 0; i < numSteps; i++) {
      const isCurrent = i === current;
      const isCompleted = i < current;
      const ProgressBarStep = getProgressBarStep(isCurrent, isCompleted);

      let StyledProgressBarIcon = ProgressBarIcon;
      if (isCurrent) StyledProgressBarIcon = CurrentProgressBarIcon;
      if (isCompleted) StyledProgressBarIcon = CompleteProgressBarIcon;

      dots.push(
        <ProgressBarStep key={i}>
          <StyledProgressBarIcon><Check /></StyledProgressBarIcon>
          <ProgressBarStepLabel>{i + 1}</ProgressBarStepLabel>
        </ProgressBarStep>
      );
    }
    return dots;
  }

  render() {
    return (
      <Wrapper>
        <ProgressBar>
          {this.renderDots()}
        </ProgressBar>
      </Wrapper>
    );

  }
}
