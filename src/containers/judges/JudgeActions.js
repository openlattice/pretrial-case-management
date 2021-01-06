/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ASSOCIATE_JUDGE_WITH_COUNTY :string = 'ASSOCIATE_JUDGE_WITH_COUNTY';
const associateJudgeWithCounty :RequestSequence = newRequestSequence(ASSOCIATE_JUDGE_WITH_COUNTY);

const LOAD_JUDGES :string = 'LOAD_JUDGES';
const loadJudges :RequestSequence = newRequestSequence(LOAD_JUDGES);

const REMOVE_JUDGE_FROM_COUNTY :string = 'REMOVE_JUDGE_FROM_COUNTY';
const removeJudgeFromCounty :RequestSequence = newRequestSequence(REMOVE_JUDGE_FROM_COUNTY);

export {
  ASSOCIATE_JUDGE_WITH_COUNTY,
  LOAD_JUDGES,
  REMOVE_JUDGE_FROM_COUNTY,
  associateJudgeWithCounty,
  loadJudges,
  removeJudgeFromCounty
};
