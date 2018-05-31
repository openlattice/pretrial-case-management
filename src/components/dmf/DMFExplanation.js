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

const formatTextArr = (textArr) => {
  let text = textArr[0];
  if (textArr.length === 3) {
    text = `${textArr[0]}, ${textArr[1]}, and ${textArr[2]}`;
  }
  else if (textArr.length === 2) {
    text = textArr.join(' and ');
  }

  text = text[0].toUpperCase().concat(text.slice(1, text.length)).concat('.');
  return text;
}

const StepTwo = ({
  extradited,
  extraditedNotes,
  stepTwoVal,
  stepTwoNotes,
  currentViolentOffense,
  nvca,
  context
}) => {
  const violent = currentViolentOffense && nvca;
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

  const text = formatTextArr(textArr);

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
  nvca,
  currentViolentOffense,
  context
}) => {
  if (!shouldRender) return null;
  const textArr = [];
  let dmfTransformation;

  const violentRisk = nvca && !currentViolentOffense;
  if (!stepFourVal && !violentRisk) {
    textArr.push('no charges meet the requirements to increase severity');
    dmfTransformation = (
      <StepWrapper>
        <DMFCell dmf={dmf} selected />
      </StepWrapper>
    );
  }
  else {
    dmfTransformation = (
      <StepWrapper>
        <DMFCell dmf={getDMFDecision(nca, fta, context)} selected />
        <Arrow />
        <DMFCell dmf={dmf} selected />
      </StepWrapper>
    );
    if (stepFourVal) {
      textArr.push('charges meet the requirements to increase severity')
    }
    if (violentRisk) {
      textArr.push('PSA resulted in NVCA flag and current offense is not violent');
    }
  }

  return (
    <div>
      <StepHeader>Step Four:</StepHeader>
      <StepWrapper>{formatTextArr(textArr)}</StepWrapper>
      {dmfTransformation}
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
  const currentViolentOffense = riskFactors.get(PSA.CURRENT_VIOLENT_OFFENSE) === `${true}`;
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
          currentViolentOffense={currentViolentOffense}
          nvca={nvca}
          context={context} />
      <StepThree shouldRender={shouldRenderFull} dmf={dmf} nca={nca} fta={fta} context={context} />
      <StepFour
          shouldRender={shouldRenderFull}
          dmf={dmf}
          stepFourVal={stepFourVal}
          stepFourNotes={stepFourNotes}
          nca={nca}
          fta={fta}
          nvca={nvca}
          currentViolentOffense={currentViolentOffense}
          context={context} />
    </div>
  );
};

export default DMFExplanation;
