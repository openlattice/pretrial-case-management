import Immutable from 'immutable';
import psaScenarios from './consts/test/ScoringTestConsts';
import dmfScenarios from './consts/test/DMFTestConsts';
import { getScoresAndRiskFactors, calculateDMF } from './ScoringUtils';
import { DMF } from './consts/Consts';
import { PROPERTY_TYPES } from './consts/DataModelConsts';
import { RESULT_CATEGORIES } from './consts/DMFResultConsts';

describe('ScoringUtils', () => {

  describe('Score values', () => {

    describe('Score DMFs', () => {
      dmfScenarios.forEach((scenario, index) => {
        Object.keys(scenario.expected).forEach((context) => {
          test(`should correctly score DMF scenario ${index} with context ${context}`, () => {
            const inputData = Immutable.fromJS(scenario.inputData).set(DMF.COURT_OR_BOOKING, context);
            const dmf = calculateDMF(inputData, Immutable.fromJS(scenario.scores));

            expect(dmf[RESULT_CATEGORIES.COLOR])
              .toEqual(scenario.expected[context][RESULT_CATEGORIES.COLOR]);
            expect(dmf[RESULT_CATEGORIES.RELEASE_TYPE])
              .toEqual(scenario.expected[context][RESULT_CATEGORIES.RELEASE_TYPE]);
            expect(dmf[RESULT_CATEGORIES.CONDITIONS_LEVEL])
              .toEqual(scenario.expected[context][RESULT_CATEGORIES.CONDITIONS_LEVEL]);
            expect(dmf[RESULT_CATEGORIES.CONDITION_1])
              .toEqual(scenario.expected[context][RESULT_CATEGORIES.CONDITION_1]);
            expect(dmf[RESULT_CATEGORIES.CONDITION_2])
              .toEqual(scenario.expected[context][RESULT_CATEGORIES.CONDITION_2]);
            expect(dmf[RESULT_CATEGORIES.CONDITION_3])
              .toEqual(scenario.expected[context][RESULT_CATEGORIES.CONDITION_3]);
          });
        });
      });
    });

    describe('Provided PSA scenarios', () => {
      psaScenarios.forEach((scenario) => {
        const getBoolString = (val) => ((val === 'Yes') ? 'true' : 'false');
        const scenarioName = scenario.scenario;

        test(`should correctly score ${scenarioName}`, () => {
          const scenarioValues = {};
          const providedValues = {};
          providedValues.ageAtCurrentArrest = scenario.ageAtCurrentArrest;
          providedValues.currentViolentOffense = scenario.currentViolentOffense;
          providedValues.currentViolentOffenseAndYoung = scenario.currentViolentOffenseAndYoung;
          providedValues.pendingCharge = scenario.pendingCharge;
          providedValues.priorMisdemeanor = scenario.priorMisdemeanor;
          providedValues.priorFelony = scenario.priorFelony;
          providedValues.priorViolentConviction = scenario.priorViolentConviction;
          providedValues.priorFailureToAppearRecent = scenario.priorFailureToAppearRecent;
          providedValues.priorFailureToAppearOld = scenario.priorFailureToAppearOld;
          providedValues.priorSentenceToIncarceration = scenario.priorSentenceToIncarceration;

          let ageAtCurrentArrest = '0';
          if (scenario.ageAtCurrentArrest === 22) ageAtCurrentArrest = '1';
          else if (scenario.ageAtCurrentArrest === 23) ageAtCurrentArrest = '2';
          const currentViolentOffense = getBoolString(scenario.currentViolentOffense);
          const currentViolentOffenseAndYoung = getBoolString(scenario.currentViolentOffenseAndYoung);
          const pendingCharge = getBoolString(scenario.pendingCharge);
          const priorMisdemeanor = getBoolString(scenario.priorMisdemeanor);
          const priorConviction = getBoolString(scenario.priorConviction);
          const priorFelony = getBoolString(scenario.priorFelony);
          const priorViolentConviction = scenario.priorViolentConviction.toString();
          const priorFailureToAppearRecent = scenario.priorFailureToAppearRecent.toString();
          const priorFailureToAppearOld = getBoolString(scenario.priorFailureToAppearOld);
          const priorSentenceToIncarceration = getBoolString(scenario.priorSentenceToIncarceration);

          const nvcaFlag = scenario.nvcaFlag === 'Yes';

          const formValues = Immutable.fromJS({
            ageAtCurrentArrest,
            currentViolentOffense,
            pendingCharge,
            priorMisdemeanor,
            priorFelony,
            priorViolentConviction,
            priorFailureToAppearRecent,
            priorFailureToAppearOld,
            priorSentenceToIncarceration,
            priorConviction,
            currentViolentOffenseAndYoung
          });

          const expectedResults = {};
          expectedResults.ncaScale = scenario.ncaScale;
          expectedResults.ftaScale = scenario.ftaScale;
          expectedResults.nvcaFlag = nvcaFlag;
          expectedResults.ncaScore = scenario.ncaScore;
          expectedResults.ftaScore = scenario.ftaScore;
          expectedResults.nvcaScore = scenario.nvcaScore;

          const calculatedResults = {};
          Object.assign(scenarioValues, { providedValues, expectedResults, calculatedResults });

          if (scenario.logic === 'ILLOGICAL') {
            expect(() => {
              getScoresAndRiskFactors(formValues);
            }).toThrow();
          }
          else {
            const { scores, scoreTotals } = getScoresAndRiskFactors(formValues);
            scenarioValues.calculatedResults = scores.toJS();

            const nca = scores.getIn([PROPERTY_TYPES.NCA_SCALE, 0]);
            const fta = scores.getIn([PROPERTY_TYPES.FTA_SCALE, 0]);
            const nvca = scores.getIn([PROPERTY_TYPES.NVCA_FLAG, 0]);

            expect(nca).toEqual(scenario.ncaScale);
            expect(fta).toEqual(scenario.ftaScale);
            expect(nvca).toEqual(nvcaFlag);
            expect(scoreTotals.ncaTotal).toEqual(scenario.ncaScore);
            expect(scoreTotals.ftaTotal).toEqual(scenario.ftaScore);
            expect(scoreTotals.nvcaTotal).toEqual(scenario.nvcaScore);
            if (nca === scenario.ncaScale
              && fta === scenario.ftaScale
              && nvca === nvcaFlag
              && scoreTotals.ncaTotal === scenario.ncaScore
              && scoreTotals.ftaTotal === scenario.ftaScore
              && scoreTotals.nvcaTotal === scenario.nvcaScore) {
              scenarioValues.passed = true;
            }
            else scenarioValues.passed = false;
          }
          // console.log(scenarioValues);
        });
      });
    });
  });
});
