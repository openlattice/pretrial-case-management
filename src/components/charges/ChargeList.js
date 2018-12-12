/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { fromJS, Map, List } from 'immutable';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { APP, CHARGES, STATE } from '../../utils/consts/FrontEndStateConsts';
import { OL } from '../../utils/consts/Colors';
import { getAllViolentCharges, getViolentChargeLabels } from '../../utils/ArrestChargeUtils';
import { formatValue, formatDateList } from '../../utils/FormattingUtils';
import {
  chargeIsViolent,
  chargeIsMostSerious,
  chargeIsGuilty,
  historicalChargeIsViolent
} from '../../utils/HistoricalChargeUtils';
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
  charges :List<*>,
  pretrialCaseDetails :Map<*, *>,
  detailed? :boolean,
  historical? :boolean,
  modal? :modal,
  selectedOrganizationId :string,
  violentCourtCharges :Map<*, *>
};

class ChargeList extends React.Component<Props, *> {

  static defaultProps = {
    detailed: false,
    historical: false,
    modal: false
  };

  renderTags = (charge :Map<*, *>) => {
    const {
      historical,
      pretrialCaseDetails,
      selectedOrganizationId,
      violentCourtCharges
    } = this.props;

    const violentChargeList = violentCourtCharges.get(selectedOrganizationId, Map());
    const convicted = chargeIsGuilty(charge);
    const mostSerious = chargeIsMostSerious(charge, pretrialCaseDetails);
    const violent = historical
      ? historicalChargeIsViolent({ charge, violentChargeList })
      : getViolentChargeLabels(fromJS([charge])).size > 0;


    return (
      <ChargeTagWrapper>
        { (mostSerious) ? <MostSeriousTag>MOST SERIOUS</MostSeriousTag> : null }
        { (violent) ? <ViolentTag>VIOLENT</ViolentTag> : null }
        { (convicted) ? <ConvictedTag>CONVICTED</ConvictedTag> : null }
      </ChargeTagWrapper>
    );
  }

  renderChargeDetails = (charge :Map<*, *>) => {
    const { detailed } = this.props;
    if (!detailed) return null;

    const plea = formatValue(charge.get(PROPERTY_TYPES.PLEA, List()));
    const pleaDate = formatDateList(charge.get(PROPERTY_TYPES.PLEA_DATE, List()));
    const disposition = formatValue(charge.get(PROPERTY_TYPES.DISPOSITION, List()));
    const dispositionDate = formatDateList(charge.get(PROPERTY_TYPES.DISPOSITION_DATE, List()));
    return (
      <div>
        <ChargeDetail>{`Plea: ${pleaDate} — ${plea}`}</ChargeDetail>
        <ChargeDetail>{`Disposition: ${dispositionDate} — ${disposition}`}</ChargeDetail>
      </div>
    );
  }

  renderQualifier = (charge :Map<*, *>) => (
    this.props.historical ? null : (
      <PaddedChargeItem>{formatValue(charge.get(PROPERTY_TYPES.QUALIFIER, List()))}</PaddedChargeItem>
    ))

  getChargeList = () => {
    const { charges, detailed, modal } = this.props;
    const rows = charges.map((charge, index) => {
      if (!charge.get(CHARGE_STATUTE, List()).size) {
        return (
          <ChargeRow key={index}><ChargeItem /></ChargeRow>
        );
      }
      const chargeDescription = charge.get(CHARGE_DESCRIPTION, List());
      const chargeDegree = charge.get(CHARGE_DEGREE, List());
      const chargeNum = charge.get(CHARGE_STATUTE, List());

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
      <ChargesTable modal={modal}>
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

function mapStateToProps(state :Map<*, *>) :Object {
  const app = state.get(STATE.APP);
  const charges = state.get(STATE.CHARGES);
  return {
    // App
    [APP.SELECTED_ORG_ID]: app.get(APP.SELECTED_ORG_ID),
    [APP.SELECTED_ORG_TITLE]: app.get(APP.SELECTED_ORG_TITLE),

    // Charges
    [CHARGES.ARREST]: charges.get(CHARGES.ARREST),
    [CHARGES.COURT]: charges.get(CHARGES.COURT),
    [CHARGES.ARREST_VIOLENT]: charges.get(CHARGES.ARREST_VIOLENT),
    [CHARGES.COURT_VIOLENT]: charges.get(CHARGES.COURT_VIOLENT),
    [CHARGES.DMF_STEP_2]: charges.get(CHARGES.DMF_STEP_2),
    [CHARGES.DMF_STEP_4]: charges.get(CHARGES.DMF_STEP_4),
    [CHARGES.BRE]: charges.get(CHARGES.BRE),
    [CHARGES.BHE]: charges.get(CHARGES.BHE),
    [CHARGES.LOADING]: charges.get(CHARGES.LOADING),
  };
}

export default withRouter(connect(mapStateToProps, null)(ChargeList));
