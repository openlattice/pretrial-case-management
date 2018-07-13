/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import moment from 'moment';

import { PROPERTY_TYPES, ENTITY_SETS } from '../../utils/consts/DataModelConsts';
import {
  chargeFieldIsViolent,
  degreeFieldIsFelony,
  degreeFieldIsMisdemeanor,
  dispositionFieldIsGuilty
} from '../../utils/consts/ChargeConsts';

type Props = {
  caseHistory :Immutable.List<*>,
  chargeHistory :Immutable.Map<*, *>
};

const TimelineWrapper = styled.div`
  margin: 50px 0;
  width: 100%;
  min-width: 900px;
  display: flex;
  flex-direction: column;
`;

const TimelineBar = styled.div`
  width: 100%;
  height: 10px;
  background-color: #f0f0f7;
  border-radius: 1px;
`;

const TagRow = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 50px;
`;

const TagGroupWrapper = styled.div`
  position: absolute;
  left: ${props => props.left}%;
`;

const TagGroup = styled.div`
  position: relative;
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TagMonthLabel = styled.div`
  position: absolute;
  bottom: 15px;
  font-family: 'Open Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  background-color: #ffffff;
  z-index: 1;
  color: #555e6f;
  text-transform: uppercase;
`;

const TagLine = styled.div`
  position: absolute;
  bottom: 0;
  height: 40px;
  width: 1px;
  border-left: 1px solid ${props => (props.violent ? '#ff3c5d' : '#555e6f')};
`;

const Tag = styled.div`
  position: absolute;
  width: max-content;
  padding: 2px 10px;
  border-radius: 5px;
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => (props.violent ? '#ff3c5d;' : '#dcdce7')};
  color: ${props => (props.violent ? '#ffffff;' : '#2e2e34')};
`;

const ReferenceDates = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 10px;

  span {
    font-family: 'Open Sans', sans-serif;
    font-size: 12px;
    color: #8e929b;
    font-weight: 300;
  }
`;

export default class CaseHistoryTimeline extends React.Component<Props> {

  getCaseDate = (pretrialCase :Immutable.Map<*, *>) =>
    moment.utc(pretrialCase.getIn([PROPERTY_TYPES.FILE_DATE, 0], ''));

  getInitializedCountsMap = () => Immutable.Map().set('m', 0).set('f', 0).set('v', 0);

  getUpdatedCountsMap = (charge :Immutable.Map<*, *>, initMonthCounts :Immutable.Map<*, *>) => {
    let monthCounts = initMonthCounts;

    const degreeField = charge.get(PROPERTY_TYPES.CHARGE_LEVEL, Immutable.List());
    const statuteField = charge.get(PROPERTY_TYPES.CHARGE_STATUTE, Immutable.List());

    const m = degreeFieldIsMisdemeanor(degreeField);
    const f = degreeFieldIsFelony(degreeField);
    const v = chargeFieldIsViolent(statuteField);

    if (m) {
      monthCounts = monthCounts.set('m', monthCounts.get('m') + 1);
    }

    if (f) {
      monthCounts = monthCounts.set('f', monthCounts.get('f') + 1);
    }

    if (v) {
      monthCounts = monthCounts.set('v', monthCounts.get('v') + 1);
    }

    return monthCounts;
  }

  getChargeTypesByMonth = () => {
    const { caseHistory, chargeHistory } = this.props;

    let chargeTypesByMonth = Immutable.Map();
    caseHistory
      .filter((pretrialCase) => {
        return this.getCaseDate(pretrialCase).isSameOrAfter(moment().startOf('day').subtract(2, 'years'));
      })
      .forEach((pretrialCase) => {
        const caseNum = pretrialCase.getIn([PROPERTY_TYPES.CASE_ID, 0], '');
        const month = this.getCaseDate(pretrialCase).format('MM/YYYY');

        chargeHistory.get(caseNum).forEach((charge) => {
          const dispositionField = charge.get(PROPERTY_TYPES.DISPOSITION, Immutable.List());

          if (dispositionFieldIsGuilty(dispositionField)) {
            chargeTypesByMonth = chargeTypesByMonth.set(
              month,
              this.getUpdatedCountsMap(charge, chargeTypesByMonth.get(month, this.getInitializedCountsMap()))
            );
          }
        });
      });
    return chargeTypesByMonth;
  }

  renderReferenceDates = () => {
    const now = moment()
    const oneYearAgo = moment().subtract(1, 'years');
    const twoYearsAgo = moment().subtract(2, 'years');
    return (
      <ReferenceDates>
        <span>{twoYearsAgo.format('MM/YYYY')}</span>
        <span>{oneYearAgo.format('YYYY')}</span>
        <span>{oneYearAgo.format('MM/YYYY')}</span>
        <span>{now.format('YYYY')}</span>
        <span>{now.format('MM/YYYY')}</span>
      </ReferenceDates>
    )
  }

  formatTagLabel = (counts) => {
    const labelItems = [];

    const updateLabelItems = (key) => {
      const num = counts.get(key);
      if (num > 0) {
        const prefix = num > 1 ? `${num}` : '';
        labelItems.push(`${prefix}${key.toUpperCase()}`);
      }
    }

    updateLabelItems('v');
    updateLabelItems('f');
    updateLabelItems('m');

    return labelItems.join(', ');
  }

  renderTag = (leftOffset, violent, tagLabel, monthLabel) => {
    return (
      <TagGroupWrapper left={leftOffset}>
        <TagGroup>
          <Tag violent={violent}>{tagLabel}</Tag>
          <TagLine violent={violent} />
          <TagMonthLabel>{monthLabel}</TagMonthLabel>
        </TagGroup>
      </TagGroupWrapper>
    )
  }

  renderTags = () => {
    const totalMonths = 24;

    const chargeTypesByMonth = this.getChargeTypesByMonth();
    chargeTypesByMonth.entrySeq().forEach(([month, counts]) => {
    })

    return (
      <TagRow>
        {
          chargeTypesByMonth.entrySeq()
            .filter(([month, counts]) => counts.get('m') > 0 || counts.get('f') > 0 || counts.get('v') > 0)
            .map(([month, counts]) => {
              const monthMoment = moment(month, 'MM/YYYY');
              const diff = moment().diff(monthMoment, 'months');
              const monthLabel = monthMoment.format('MMM');
              const leftOffset = ((totalMonths - diff) / 24) * 100;
              const violent = counts.get('v') > 0;

              return this.renderTag(leftOffset, violent, this.formatTagLabel(counts), monthLabel);
            })
        }
      </TagRow>
    )
  }

  render() {
    return (
      <TimelineWrapper>
        {this.renderTags()}
        <TimelineBar />
        {this.renderReferenceDates()}
      </TimelineWrapper>
    );
  }
}
