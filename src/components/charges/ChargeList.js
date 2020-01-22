/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { fromJS, Map, List } from 'immutable';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { CHARGES, STATE } from '../../utils/consts/FrontEndStateConsts';
import { OL } from '../../utils/consts/Colors';
import { getEntityProperties } from '../../utils/DataUtils';
import { getViolentChargeLabels } from '../../utils/ArrestChargeUtils';
import { formatValue, formatDateList } from '../../utils/FormattingUtils';
import {
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
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

const {
  CHARGE_STATUTE,
  CHARGE_DESCRIPTION,
  CHARGE_DEGREE,
  ENTITY_KEY_ID
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
  padding: ${(props) => (props.isCompact ? '0 30px' : '30px')};

`;

const ChargeHeaderItem = styled(PaddedChargeItem)`
  width: 152px;
  font-size: 14px;
  font-weight: 600;
  color: ${OL.GREY15};
  padding: ${(props) => (props.isCompact ? '18px 30px' : '25px 30px')};
`;

const ChargeDescriptionTitle = styled.div`
  ${(props) => ((props.isCompact)
    ? (
      `display: flex;
       flex-direction: row;`
    )
    : '')}
  span {
    font-size: ${(props) => (props.isCompact ? 12 : 14)}px;
    font-weight: 600;
    color: ${OL.GREY15};
    padding-right: 5px;
  }
`;

const ChargeDetail = styled.div`
  padding: 5px 0;
  font-size: ${(props) => (props.isCompact ? 12 : 14)}px;
  color: ${OL.GREY15};
`;

const CompactChargeDetails = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 12px;
`;

type Props = {
  charges :List<*>,
  pretrialCaseDetails :Map<*, *>,
  detailed? :boolean,
  historical? :boolean,
  modal? :modal,
  selectedOrganizationId :string,
  violentArrestCharges :Map<*, *>,
  violentCourtCharges :Map<*, *>,
  isCompact :boolean
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
      isCompact
    } = this.props;
    let {
      violentArrestCharges,
      violentCourtCharges
    } = this.props;

    violentArrestCharges = violentArrestCharges.get(selectedOrganizationId, Map());
    violentCourtCharges = violentCourtCharges.get(selectedOrganizationId, Map());
    const convicted = chargeIsGuilty(charge);
    const mostSerious = chargeIsMostSerious(charge, pretrialCaseDetails);
    const currCharges = fromJS([charge]);
    const violent = historical
      ? historicalChargeIsViolent({
        charge,
        violentChargeList: violentCourtCharges
      })
      : getViolentChargeLabels({
        currCharges,
        violentChargeList: violentArrestCharges
      }).size > 0;

    const chargeTags = (
      <>
        { (mostSerious) ? <MostSeriousTag>MOST SERIOUS</MostSeriousTag> : null }
        { (violent) ? <ViolentTag>VIOLENT</ViolentTag> : null }
        { (convicted) ? <ConvictedTag>CONVICTED</ConvictedTag> : null }
      </>
    );

    return isCompact
      ? <div>{chargeTags}</div>
      : <ChargeTagWrapper>{chargeTags}</ChargeTagWrapper>;
  }

  renderChargeDetails = (charge :Map<*, *>) => {
    const { detailed, isCompact } = this.props;
    if (!detailed) return null;

    const pleaDate = formatDateList(charge.get(PROPERTY_TYPES.PLEA_DATE, List()));
    const plea = formatValue(charge.get(PROPERTY_TYPES.PLEA, List()));
    const pleaString = `Plea: ${pleaDate} — ${plea}`;

    const dispositionDate = formatDateList(charge.get(PROPERTY_TYPES.DISPOSITION_DATE, List()));
    const disposition = formatValue(charge.get(PROPERTY_TYPES.DISPOSITION, List()));
    const dispositionString = `Disposition: ${dispositionDate} — ${disposition}`;

    const chargeDetails = (
      <>
        <ChargeDetail isCompact={isCompact}>{pleaString}</ChargeDetail>
        <ChargeDetail isCompact={isCompact}>{dispositionString}</ChargeDetail>
      </>
    );

    return isCompact
      ? <CompactChargeDetails>{chargeDetails}</CompactChargeDetails>
      : <div>{chargeDetails}</div>;
  }

  renderQualifier = (charge :Map<*, *>) => {
    const { historical, isCompact } = this.props;
    return historical ? null : (
      <PaddedChargeItem isCompact={isCompact}>
        {formatValue(charge.get(PROPERTY_TYPES.QUALIFIER, List()))}
      </PaddedChargeItem>
    );
  }

  getChargeList = () => {
    const {
      charges,
      detailed,
      modal,
      isCompact
    } = this.props;
    const rows = charges.map((charge) => {

      const {
        [CHARGE_DEGREE]: chargeDegree,
        [CHARGE_DESCRIPTION]: chargeDescription,
        [ENTITY_KEY_ID]: chargeEKID,
        [CHARGE_STATUTE]: chargeNum
      } = getEntityProperties(charge, [CHARGE_DEGREE, CHARGE_DESCRIPTION, ENTITY_KEY_ID, CHARGE_STATUTE]);
      if (!charge.get(CHARGE_STATUTE, List()).size) {
        return (
          <ChargeRow key={chargeEKID}><ChargeItem /></ChargeRow>
        );
      }

      const description = (
        <ChargeDescriptionTitle isCompact={isCompact}>
          { chargeDescription ? <span>{formatValue(chargeDescription)}</span> : null }
          { chargeDegree ? <span>{formatValue(chargeDegree)}</span> : null }
          { isCompact ? this.renderTags(charge) : null }
        </ChargeDescriptionTitle>
      );

      const styledDescription = detailed
        ? <InlineBold>{description}</InlineBold> : <span>{description}</span>;
      return (
        <ChargeRow key={chargeEKID}>
          <ChargeHeaderItem isCompact={isCompact}>{formatValue(chargeNum)}</ChargeHeaderItem>
          <ChargeItem isCompact={isCompact}>
            { isCompact ? null : this.renderTags(charge)}
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
    const { charges, modal, isCompact } = this.props;
    if (!charges || !charges.size) return null;
    return (
      <div>
        <ChargesWrapper isCompact={isCompact} modal={modal}>
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
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_TITLE]: app.get(APP_DATA.SELECTED_ORG_TITLE),

    // Charges
    [CHARGES.ARREST]: charges.get(CHARGES.ARREST),
    [CHARGES.COURT]: charges.get(CHARGES.COURT),
    [CHARGES.ARREST_VIOLENT]: charges.get(CHARGES.ARREST_VIOLENT),
    [CHARGES.COURT_VIOLENT]: charges.get(CHARGES.COURT_VIOLENT),
    [CHARGES.RCM_STEP_2]: charges.get(CHARGES.RCM_STEP_2),
    [CHARGES.RCM_STEP_4]: charges.get(CHARGES.RCM_STEP_4),
    [CHARGES.BRE]: charges.get(CHARGES.BRE),
    [CHARGES.BHE]: charges.get(CHARGES.BHE),
    [CHARGES.LOADING]: charges.get(CHARGES.LOADING),
  };
}

export default withRouter(connect(mapStateToProps, null)(ChargeList));
