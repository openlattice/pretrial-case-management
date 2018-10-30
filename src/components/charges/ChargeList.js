/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Immutable from 'immutable';

import { OL } from '../../utils/consts/Colors';
import { getAllViolentCharges } from '../../utils/ArrestChargeUtils';
import { chargeIsViolent, chargeIsMostSerious, chargeIsGuilty } from '../../utils/HistoricalChargeUtils';
import { formatValue, formatDateList } from '../../utils/FormattingUtils';
import {
  ChargeItem,
  ChargeRow,
  ChargesTable,
  ChargesWrapper,
  ChargeTag,
  ChargeTagWrapper,
  InlineBold
} from '../../utils/Layout';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const {
  CHARGE_STATUTE,
  CHARGE_DESCRIPTION,
  CHARGE_DEGREE
} = PROPERTY_TYPES;

const MostSeriousTag = styled(ChargeTag)`
  background-color: ${OL.GREY18};
`;

const ViolentTag = styled(ChargeTag)`
  background-color: ${OL.RED01};
`;
const ConvictedTag = styled(ChargeTag)`
  color: ${OL.GREY15};
  font-weight: bold;
  background-color: ${OL.GREY03};
`;

const PaddedChargeItem = styled(ChargeItem)`
  vertical-align: top;
  padding: 30px;

`;

const ChargeHeaderItem = styled(PaddedChargeItem)`
  width: 152px;
  font-size: 14px;
  font-weight: 600;
  color: ${OL.GREY15};
  padding-left: 25px 30px;
`;

const ChargeDescriptionTitle = styled.div`
  span {
    font-size: 14px;
    font-weight: 600;
    color: ${OL.GREY15};
  }
`;

const ChargeDetail = styled.div`
  padding: 5px 0;
  font-size: 14px;
  color: ${OL.GREY15};
`;

type Props = {
  charges :Immutable.List<*>,
  pretrialCaseDetails :Immutable.Map<*, *>,
  detailed? :boolean,
  historical? :boolean,
  modal? :modal
};

export default class ChargeList extends React.Component<Props, *> {

  static defaultProps = {
    detailed: false,
    historical: false,
    modal: false
  };

  renderTags = (charge :Immutable.Map<*, *>) => {
    const { historical, pretrialCaseDetails } = this.props;
    const convicted = chargeIsGuilty(charge);
    const mostSerious = chargeIsMostSerious(charge, pretrialCaseDetails);
    const violent = historical
      ? chargeIsViolent(charge)
      : getAllViolentCharges(Immutable.fromJS([charge])).size > 0;


    return (
      <ChargeTagWrapper>
        { (mostSerious) ? <MostSeriousTag>MOST SERIOUS</MostSeriousTag> : null }
        { (violent) ? <ViolentTag>VIOLENT</ViolentTag> : null }
        { (convicted) ? <ConvictedTag>CONVICTED</ConvictedTag> : null }
      </ChargeTagWrapper>
    );
  }

  renderChargeDetails = (charge :Immutable.Map<*, *>) => {
    const { detailed } = this.props;
    if (!detailed) return null;

    const plea = formatValue(charge.get(PROPERTY_TYPES.PLEA, Immutable.List()));
    const pleaDate = formatDateList(charge.get(PROPERTY_TYPES.PLEA_DATE, Immutable.List()));
    const disposition = formatValue(charge.get(PROPERTY_TYPES.DISPOSITION, Immutable.List()));
    const dispositionDate = formatDateList(charge.get(PROPERTY_TYPES.DISPOSITION_DATE, Immutable.List()));
    return (
      <div>
        <ChargeDetail>{`Plea: ${pleaDate} — ${plea}`}</ChargeDetail>
        <ChargeDetail>{`Disposition: ${dispositionDate} — ${disposition}`}</ChargeDetail>
      </div>
    );
  }

  renderQualifier = (charge :Immutable.Map<*, *>) => (
    this.props.historical ? null : (
      <PaddedChargeItem>{formatValue(charge.get(PROPERTY_TYPES.QUALIFIER, Immutable.List()))}</PaddedChargeItem>
    ))

  getChargeList = () => {
    const { charges, detailed } = this.props;
    const rows = charges.map((charge, index) => {
      if (!charge.get(CHARGE_STATUTE, Immutable.List()).size) {
        return (
          <ChargeRow key={index}><ChargeItem /></ChargeRow>
        );
      }
      const chargeDescription = charge.get(CHARGE_DESCRIPTION, Immutable.List());
      const chargeDegree = charge.get(CHARGE_DEGREE, Immutable.List());
      const chargeNum = charge.get(CHARGE_STATUTE, Immutable.List());

      const description = (
        <ChargeDescriptionTitle>
          { chargeDescription.size ? <span> {formatValue(chargeDescription)}</span> : null }
          { chargeDegree.size ? <span> ({formatValue(chargeDegree)})</span> : null }
        </ChargeDescriptionTitle>
      );

      const styledDescription = detailed
        ? <InlineBold>{description}</InlineBold> : <span>{description}</span>;

      return (
        <ChargeRow key={index}>
          <ChargeHeaderItem>{formatValue(chargeNum.toJS())}</ChargeHeaderItem>
          <ChargeItem>
            {this.renderTags(charge)}
            {styledDescription}
            {this.renderChargeDetails(charge)}
          </ChargeItem>
          {this.renderQualifier(charge)}
        </ChargeRow>
      );
    });
    return (
      <ChargesTable>
        <tbody>
          {rows}
        </tbody>
      </ChargesTable>
    );
  }

  render = () => {
    const { charges, modal } = this.props;
    if (!charges || !charges.size) return null;
    return (
      <div>
        <ChargesWrapper modal={modal}>
          {this.getChargeList()}
        </ChargesWrapper>
      </div>
    );
  }
}
