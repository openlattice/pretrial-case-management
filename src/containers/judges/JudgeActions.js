/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ASSOCIATE_JUDGE_TO_COUNTY :string = 'ASSOCIATE_JUDGE_TO_COUNTY';
const associateJudgeToCounty :RequestSequence = newRequestSequence(ASSOCIATE_JUDGE_TO_COUNTY);

const LOAD_JUDGES :string = 'LOAD_JUDGES';
const loadJudges :RequestSequence = newRequestSequence(LOAD_JUDGES);

const REMOVE_JUDGE_FROM_COUNTY :string = 'REMOVE_JUDGE_FROM_COUNTY';
const removeJudgeFromCounty :RequestSequence = newRequestSequence(REMOVE_JUDGE_FROM_COUNTY);

export {
  ASSOCIATE_JUDGE_TO_COUNTY,
  LOAD_JUDGES,
  REMOVE_JUDGE_FROM_COUNTY,
  associateJudgeToCounty,
  loadJudges,
  removeJudgeFromCounty
};
