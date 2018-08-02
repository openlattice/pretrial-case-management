/*
 * @flow
 */

import React from 'react';
import FontAwesome from 'react-fontawesome';
import styled from 'styled-components';

import DMFCell from './DMFCell';
import DMFTable from './DMFTable';
import ContentBlock from '../ContentBlock';
import ContentSection from '../ContentSection';
import PSAStats from '../review/PSAStats';
import ScoreScale from '../ScoreScale';
import BooleanFlag from '../BooleanFlag';
import { CONTEXT, DMF, NOTES, PSA } from '../../utils/consts/Consts';
import {
  getDMFDecision,
  increaseDMFSeverity,
  shouldCheckForSecondaryRelease
} from '../../utils/consts/DMFResultConsts';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const DMFWrapper = styled.div`
  display: flex;
  flex-direction: column;

  hr {
    color: #eeeeee;
    width: 100%;
    height: 1px;
    margin: 0;
  }
`;

const StepHeader = styled.div`
  width: 100%;
  font-family: 'Open Sans', sans-serif;
  padding: 0 30px;
  font-size: 16px;
  font-weight: 600;
  color: #555e6f;
`;

const StepWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin: 30px 30px 30px;
`;

const StatsWrapper = styled.div`
  width: 60%;
`;

const Item = styled.span`
  margin: 5px 10px;
`;

const ItemValue = styled.span`
  font-weight: bold;
  font-size: 14px;
  margin: 0 5px;
`;

const ContentsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin-top: 7px;
`;

const FLAG_DIMS = { height: 32, width: 156 };
const SCALE_DIMS = { height: 28, width: 136 };

const Arrow = styled(FontAwesome).attrs({
  name: 'arrow-right',
  size: '2x'
})`
  margin: 0 10px;
`;

const StepOne = ({
  nca,
  fta,
  nvca,
  context
} :Props) => {
  const nvcaDisplay = nvca ? 'Yes' : 'No';
  const STATS = [
    {
      label: 'NVCA',
      content: [<ContentsWrapper><BooleanFlag dims={FLAG_DIMS} value={nvcaDisplay} /></ContentsWrapper>]
    },
    {
      label: 'NCA',
      content: [<ContentsWrapper>{nca}<ScoreScale dims={SCALE_DIMS} score={nca} /></ContentsWrapper>]
    },
    {
      label: 'FTA',
      content: [<ContentsWrapper>{fta}<ScoreScale dims={SCALE_DIMS} score={fta} /></ContentsWrapper>]
    },
    {
      label: 'Time of PSA',
      content: [<ContentsWrapper>{context}</ContentsWrapper>]
    }
  ];

  const content = STATS.map(item => (
    <ContentBlock
        component="DMF-STEP1"
        contentBlock={item}
        key={item.label} />
  ));

  return (
    <div>
      <ContentSection
          component="DMF-STEP1"
          header="Step One" >
        {content}
      </ContentSection>
    </div>
  );
};

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
        <StepHeader>Step Two</StepHeader>
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
      <StepHeader>Step Two</StepHeader>
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
      <StepHeader>Step Three</StepHeader>
      <StepWrapper>
        <DMFTable dmf={dmf} nca={nca} fta={fta} context={context} />
      </StepWrapper>
    </div>
  );
}

const StepFour = ({
  shouldRender,
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

  const stepThreeDmf = getDMFDecision(nca, fta, context);

  const violentRisk = nvca && !currentViolentOffense;
  if (!stepFourVal && !violentRisk) {
    textArr.push('no charges meet the requirements to increase severity');
    dmfTransformation = (
      <StepWrapper>
        <DMFCell dmf={stepThreeDmf} selected />
      </StepWrapper>
    );
  }
  else {
    dmfTransformation = (
      <StepWrapper>
        <DMFCell dmf={stepThreeDmf} selected />
        <Arrow />
        <DMFCell dmf={increaseDMFSeverity(stepThreeDmf, context)} selected />
      </StepWrapper>
    );
    if (stepFourVal) {
      textArr.push('charges meet the requirements to increase severity');
    }
    if (violentRisk) {
      textArr.push('PSA resulted in NVCA flag and current offense is not violent');
    }
  }

  return (
    <div>
      <StepHeader>Step Four</StepHeader>
      <StepWrapper>{formatTextArr(textArr)}</StepWrapper>
      {dmfTransformation}
    </div>
  );
}

const SecondaryRelease = ({
  shouldRender,
  dmf,
  nca,
  fta,
  context,
  secondaryReleaseVal,
  secondaryReleaseNotes
}) => {
  if (!shouldRender || !shouldCheckForSecondaryRelease(context, nca, fta)) return null;

  const text = secondaryReleaseVal
    ? 'Charges qualify for a secondary release option'
    : 'Charges do not qualify for a secondary release option.'

  const dmfTransformation = secondaryReleaseVal
    ? (
      <StepWrapper>
        <DMFCell dmf={getDMFDecision(nca, fta, context)} selected />
        <Arrow />
        <DMFCell dmf={dmf} selected />
      </StepWrapper>
    ) : (
      <StepWrapper>
        <DMFCell dmf={dmf} selected />
      </StepWrapper>
    );

  return (
    <div>
      <StepHeader>Step Five:</StepHeader>
      <StepWrapper>{text}</StepWrapper>
      {dmfTransformation}
    </div>
  );
}

const DMFExplanation = ({
  dmf,
  riskFactors,
  scores
}) => {
  let context = riskFactors.get(DMF.COURT_OR_BOOKING);
  if (context === 'Court') {
    context = CONTEXT.COURT_PENN;
  }
  const extradited = riskFactors.get(DMF.EXTRADITED) === `${true}`;
  const extraditedNotes = riskFactors.get(NOTES[DMF.EXTRADITED]);
  const currentViolentOffense = riskFactors.get(PSA.CURRENT_VIOLENT_OFFENSE) === `${true}`;
  const stepTwoCharges = riskFactors.get(DMF.STEP_2_CHARGES) === `${true}`;
  const stepTwoNotes = riskFactors.get(NOTES[DMF.STEP_2_CHARGES]);
  const stepFourCharges = riskFactors.get(DMF.STEP_4_CHARGES) === `${true}`;
  const stepFourNotes = riskFactors.get(NOTES[DMF.STEP_4_CHARGES]);
  const secondaryReleaseVal = riskFactors.get(DMF.SECONDARY_RELEASE_CHARGES) === `${true}`;
  const secondaryReleaseNotes = riskFactors.get(NOTES[DMF.SECONDARY_RELEASE_CHARGES]);

  const nca = scores.getIn([PROPERTY_TYPES.NCA_SCALE, 0]);
  const fta = scores.getIn([PROPERTY_TYPES.FTA_SCALE, 0]);
  const nvca = scores.getIn([PROPERTY_TYPES.NVCA_FLAG, 0]);

  const stepTwoIncrease = extradited || stepTwoCharges || (nvca && currentViolentOffense);
  const stepFourIncrease = stepFourCharges || (nvca && !currentViolentOffense);

  return (
    <DMFWrapper>
      <StepOne nca={nca} fta={fta} nvca={nvca} context={context} />
      <hr />
      <StepTwo
          extradited={extradited}
          extraditedNotes={extraditedNotes}
          stepTwoVal={stepTwoCharges}
          stepTwoNotes={stepTwoNotes}
          currentViolentOffense={currentViolentOffense}
          nvca={nvca}
          context={context} />
      <hr />
      <StepThree shouldRender={!stepTwoIncrease} dmf={dmf} nca={nca} fta={fta} context={context} />
      <hr />
      <StepFour
          shouldRender={!stepTwoIncrease}
          dmf={dmf}
          stepFourVal={stepFourCharges}
          stepFourNotes={stepFourNotes}
          nca={nca}
          fta={fta}
          nvca={nvca}
          currentViolentOffense={currentViolentOffense}
          context={context} />
      <hr />
      <SecondaryRelease
          shouldRender={!stepTwoIncrease && !stepFourIncrease}
          dmf={dmf}
          nca={nca}
          fta={fta}
          context={context}
          secondaryReleaseVal={secondaryReleaseVal}
          secondaryReleaseNotes={secondaryReleaseNotes} />
    </DMFWrapper>
  );
};

export default DMFExplanation;
