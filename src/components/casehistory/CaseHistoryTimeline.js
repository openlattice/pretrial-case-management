/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import { DateTime } from 'luxon';

import { OL } from '../../utils/consts/Colors';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import {
  chargeIsViolent,
  chargeIsFelony,
  chargeIsMisdemeanor,
  chargeIsGuilty
} from '../../utils/HistoricalChargeUtils';

type Props = {
  caseHistory :Immutable.List<*>,
  chargeHistory :Immutable.Map<*, *>
};

const TimelineWrapper = styled.div`
  margin: 85px 0 30px 0;
  width: 100%;
  min-width: 900px;
  display: flex;
  flex-direction: column;
`;

const TimelineBar = styled.div`
  width: 100%;
  height: 10px;
  background-color: ${OL.GREY08};
  border-radius: 1px;
`;

const TagRow = styled.div`
  position: relative;
  width: 100%;
`;

const TagGroupWrapper = styled.div`
  position: absolute;
  left: ${props => props.left}%;
`;

const TagMonthLabel = styled.div`
  position: absolute;
  bottom: 15px;
  font-family: 'Open Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  background-color: ${OL.WHITE};
  z-index: 1;
  color: ${OL.GREY01};
  text-transform: uppercase;
`;

const TagLine = styled.div`
  position: absolute;
  bottom: 0;
  height: 40px;
  width: 1px;
  border-left: 1px solid ${props => (props.violent ? OL.RED01 : OL.GREY01)};
`;

const Tag = styled.div`
  position: absolute;
  width: max-content;
  padding: 2px 10px;
  border-radius: 5px;
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => (props.violent ? OL.RED01 : OL.GREY05)};
  color: ${props => (props.violent ? OL.WHITE : OL.GREY15)};
`;

const TagGroup = styled.div`
  position: relative;
  height: ${props => (props.tall ? '85px' : '60px')};
  bottom: ${props => (props.tall ? '75px' : '50px')};
  display: flex;
  flex-direction: column;
  align-items: center;

  ${TagLine} {
    height: ${props => (props.tall ? '65px' : '40px')}
  }
`;

const ReferenceDates = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 10px;

  span {
    font-family: 'Open Sans', sans-serif;
    font-size: 12px;
    color: ${OL.GREY02};
    font-weight: 300;
  }
`;

const MONTH_FORMAT = 'MM/yyyy';
const YEAR_FORMAT = 'yyyy';

export default class CaseHistoryTimeline extends React.Component<Props> {

  getCaseDate = (pretrialCase :Immutable.Map<*, *>) => (
    DateTime.fromISO(pretrialCase.getIn([PROPERTY_TYPES.FILE_DATE, 0], ''))
  )

  getInitializedCountsMap = () => Immutable.Map().set('m', 0).set('f', 0).set('v', 0);

  getUpdatedCountsMap = (charge :Immutable.Map<*, *>, initMonthCounts :Immutable.Map<*, *>) => {
    let monthCounts = initMonthCounts;

    const m = chargeIsMisdemeanor(charge);
    const f = chargeIsFelony(charge);
    const v = chargeIsViolent(charge);

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
      .filter(pretrialCase => this.getCaseDate(pretrialCase) >= DateTime.local().startOf('day').minus({ years: 2 }))
      .forEach((pretrialCase) => {
        const caseNum = pretrialCase.getIn([PROPERTY_TYPES.CASE_ID, 0], '');
        const fileDate = pretrialCase.getIn([PROPERTY_TYPES.FILE_DATE, 0], '');
        const month = DateTime.fromISO(fileDate).toFormat(MONTH_FORMAT);

        chargeHistory.get(caseNum, Immutable.List()).forEach((charge) => {

          if (chargeIsGuilty(charge)) {
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
    const now = DateTime.local();
    const oneYearAgo = DateTime.local().minus({ years: 1 });
    const twoYearsAgo = DateTime.local().minus({ years: 2 });
    return (
      <ReferenceDates>
        <span>{twoYearsAgo.toFormat(MONTH_FORMAT)}</span>
        <span>{oneYearAgo.toFormat(YEAR_FORMAT)}</span>
        <span>{oneYearAgo.toFormat(MONTH_FORMAT)}</span>
        <span>{now.toFormat(YEAR_FORMAT)}</span>
        <span>{now.toFormat(MONTH_FORMAT)}</span>
      </ReferenceDates>
    );
  }

  formatTagLabel = (counts) => {
    const labelItems = [];

    const updateLabelItems = (key) => {
      const num = counts.get(key);
      if (num > 0) {
        const prefix = num > 1 ? `${num}` : '';
        labelItems.push(`${prefix}${key.toUpperCase()}`);
      }
    };

    updateLabelItems('v');
    updateLabelItems('f');
    updateLabelItems('m');

    return labelItems.join(', ');
  }

  renderTag = (leftOffset, violent, tagLabel, monthLabel, tall) => {
    return (
      <TagGroupWrapper key={`${violent}-${tagLabel}-${monthLabel}`} left={leftOffset}>
        <TagGroup tall={tall}>
          <Tag violent={violent}>{tagLabel}</Tag>
          <TagLine violent={violent} />
          <TagMonthLabel>{monthLabel}</TagMonthLabel>
        </TagGroup>
      </TagGroupWrapper>
    );
  }

  renderTags = () => {
    const totalMonths = 24;
    let lastLongLabelMonthDT;
    let lastLabelWasTall;
    const chargeTypesByMonth = this.getChargeTypesByMonth().entrySeq()
      .filter(([_, counts]) => (counts.get('m') > 0 || counts.get('f') > 0 || counts.get('v') > 0))
      .sort(([dt1], [dt2]) => (
        DateTime.fromFormat(dt1, MONTH_FORMAT) < DateTime.fromFormat(dt2, MONTH_FORMAT) ? -1 : 1));

    return (
      <TagRow>
        {
          chargeTypesByMonth
            .map(([month, counts]) => {
              let tall = false;
              const monthDT = DateTime.fromFormat(month, MONTH_FORMAT);
              const diff = DateTime.local().diff(monthDT, 'months').months;
              const monthLabel = monthDT.toFormat('MMM');
              const leftOffset = ((totalMonths - diff) / 24) * 100;
              const violent = counts.get('v') > 0;
              const tagLabel = this.formatTagLabel(counts);
              if (tagLabel.length > 1) {
                if (lastLongLabelMonthDT
                  && !lastLabelWasTall
                  && monthDT.diff(lastLongLabelMonthDT, 'months').months === 1) {
                  tall = true;
                }
                lastLongLabelMonthDT = monthDT;
              }
              lastLabelWasTall = tall;
              return this.renderTag(leftOffset, violent, tagLabel, monthLabel, tall);
            })
        }
      </TagRow>
    );
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
