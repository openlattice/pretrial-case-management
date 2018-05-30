import React from 'react';
import FontAwesome from 'react-fontawesome';
import styled from 'styled-components';

import DMFCell from './DMFCell';
import DMFTable from './DMFTable';
import { DMF, NOTES, PSA } from '../../utils/consts/Consts';
import { getDMFDecision } from '../../utils/consts/DMFResultConsts';

const StepHeader = styled.div`
  font-weight: bold;
  font-size: 14px;
  width: 100%;
  text-align: center;
  margin-top: 10px;
`;

const StepWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: 10px 0 20px 0;
`;

const Item = styled.span`
  margin: 5px 10px;
`;

const ItemValue = styled.span`
  font-weight: bold;
  font-size: 14px;
  margin: 0 5px;
`;

const Arrow = styled(FontAwesome).attrs({
  name: 'arrow-right',
  size: '2x'
})`
  margin: 0 10px;
`;

const StepOne = ({ nca, fta, context }) => {
  return (
    <div>
      <StepHeader>Step One:</StepHeader>
      <StepWrapper>
        <Item>
          <span>NCA score:</span>
          <ItemValue>{nca}</ItemValue>
        </Item>
        <Item>
          <span>FTA score:</span>
          <ItemValue>{fta}</ItemValue>
        </Item>
        <Item>
          <span>Time of PSA:</span>
          <ItemValue>{context}</ItemValue>
        </Item>
      </StepWrapper>
    </div>
  );
}

const StepTwo = ({
  extradited,
  extraditedNotes,
  stepTwoVal,
  stepTwoNotes,
  violent,
  context
}) => {
  if (!extradited && !stepTwoVal && !violent) {
    return (
      <div>
        <StepHeader>Step Two:</StepHeader>
        <StepWrapper>
          <div>
            Defendant was not extradited, no NVCA flag and current violent offense, and
            no charges meet the requirements to skip to maximum requirements.
          </div>
        </StepWrapper>
      </div>
    );
  }
  const textArr = [];
  if (extradited) {
    textArr.push('defendant was extradited');
  }
  if (violent) {
    textArr.push('PSA resulted in NVCA flag with current violent offense');
  }
  if (stepTwoVal) {
    textArr.push('current charge severity meets the requirements to skip to maximum requirements');
  }

  let text = textArr[0];
  if (textArr.length === 3) {
    text = `${textArr[0]}, ${textArr[1]}, and ${textArr[2]}`;
  }
  else if (textArr.length === 2) {
    text = textArr.join(' and ');
  }

  text = text[0].toUpperCase().concat(text.slice(1, text.length)).concat('.');

  return (
    <div>
      <StepHeader>Step Two:</StepHeader>
      <StepWrapper>
        <span>{text}</span>
      </StepWrapper>
      <StepWrapper>
        <DMFCell dmf={getDMFDecision(6, 6, context)} selected />
      </StepWrapper>
    </div>
  );
}

const StepThree = ({
  shouldRender,
  dmf,
  nca,
  fta,
  context
}) => {
  if (!shouldRender) return null;
  return (
    <div>
      <StepHeader>Step Three:</StepHeader>
      <StepWrapper>
        <DMFTable dmf={dmf} nca={nca} fta={fta} context={context} />
      </StepWrapper>
    </div>
  );
}

const StepFour = ({
  shouldRender,
  dmf,
  stepFourVal,
  stepFourNotes,
  nca,
  fta,
  context
}) => {
  if (!shouldRender) return null;
  if (!stepFourVal) {
    return (
      <div>
        <StepHeader>Step Four:</StepHeader>
        <StepWrapper>No charges meet the requirements to increase severity.</StepWrapper>
        <StepWrapper>
          <DMFCell dmf={dmf} selected />
        </StepWrapper>
      </div>
    );
  }
  return (
    <div>
      <StepHeader>Step Four:</StepHeader>
      <StepWrapper>Charges meet the requirements to increase severity.</StepWrapper>
      <StepWrapper>
        <DMFCell dmf={getDMFDecision(nca, fta, context)} selected />
        <Arrow />
        <DMFCell dmf={dmf} selected />
      </StepWrapper>
    </div>
  )
}

const DMFExplanation = ({
  dmf,
  riskFactors,
  nca,
  fta,
  nvca
}) => {
  const context = riskFactors.get(DMF.COURT_OR_BOOKING);
  const extradited = riskFactors.get(DMF.EXTRADITED) === `${true}`;
  const extraditedNotes = riskFactors.get(NOTES[DMF.EXTRADITED]);
  const violent = riskFactors.get(PSA.CURRENT_VIOLENT_OFFENSE) === `${true}` && nvca;
  const stepTwoVal = riskFactors.get(DMF.STEP_2_CHARGES) === `${true}`;
  const stepTwoNotes = riskFactors.get(NOTES[DMF.STEP_2_CHARGES]);
  const stepFourVal = riskFactors.get(DMF.STEP_4_CHARGES) === `${true}`;
  const stepFourNotes = riskFactors.get(NOTES[DMF.STEP_4_CHARGES]);
  const shouldRenderFull = !extradited && !stepTwoVal;

  return (
    <div>
      <StepOne nca={nca} fta={fta} context={context} />
      <StepTwo
          extradited={extradited}
          extraditedNotes={extraditedNotes}
          stepTwoVal={stepTwoVal}
          stepTwoNotes={stepTwoNotes}
          violent={violent}
          context={context} />
      <StepThree shouldRender={shouldRenderFull} dmf={dmf} nca={nca} fta={fta} context={context} />
      <StepFour
          shouldRender={shouldRenderFull}
          dmf={dmf}
          stepFourVal={stepFourVal}
          stepFourNotes={stepFourNotes}
          nca={nca}
          fta={fta}
          context={context} />
    </div>
  );
};

export default DMFExplanation;
