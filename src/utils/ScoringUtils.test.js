import Immutable, { fromJS } from 'immutable';
import psaScenarios from './consts/test/ScoringTestConsts';
import rcmScenarios from './consts/test/RCMTestConsts';
import { getScoresAndRiskFactors, calculateRCM } from './ScoringUtils';
import { PROPERTY_TYPES } from './consts/DataModelConsts';
import { RESULTS, RCM_FIELDS } from './consts/RCMResultsConsts';

describe('ScoringUtils', () => {

  describe('Score values', () => {

    describe('Score RCMs', () => {
      rcmScenarios.forEach((scenario, index) => {
        test(`should correctly score RCM scenario ${index}`, () => {
          const inputData = Immutable.fromJS(scenario.inputData).set(RCM_FIELDS.COURT_OR_BOOKING);
          const settings = fromJS(scenario.settings);
          const {
            [RESULTS.RCM]: rcm,
            [RESULTS.COURT_CONDITIONS]: courtConditions,
            [RESULTS.BOOKING_CONDITIONS]: bookingConditions
          } = calculateRCM(inputData, Immutable.fromJS(scenario.scores), settings);

          expect(rcm[PROPERTY_TYPES.COLOR])
            .toEqual(scenario.expected[RESULTS.RCM][PROPERTY_TYPES.COLOR]);
          expect(rcm[PROPERTY_TYPES.RELEASE_TYPE])
            .toEqual(scenario.expected[RESULTS.RCM][PROPERTY_TYPES.RELEASE_TYPE]);
          expect(rcm[PROPERTY_TYPES.CONDITIONS_LEVEL])
            .toEqual(scenario.expected[RESULTS.RCM][PROPERTY_TYPES.CONDITIONS_LEVEL]);

          for (let conditionNum = 0; conditionNum < courtConditions.length; conditionNum += 1) {
            expect(courtConditions[conditionNum][PROPERTY_TYPES.TYPE])
              .toEqual(scenario.expected[RESULTS.COURT_CONDITIONS][conditionNum][PROPERTY_TYPES.TYPE]);
          }
          for (let conditionNum = 0; conditionNum < bookingConditions.length; conditionNum += 1) {
            expect(bookingConditions[conditionNum][PROPERTY_TYPES.TYPE])
              .toEqual(scenario.expected[RESULTS.BOOKING_CONDITIONS][conditionNum][PROPERTY_TYPES.TYPE]);
          }
        });
      });
    });

    describe('Provided PSA scenarios', () => {
      psaScenarios.forEach((scenario) => {
        const getBoolString = val => ((val === 'Yes') ? 'true' : 'false');
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
