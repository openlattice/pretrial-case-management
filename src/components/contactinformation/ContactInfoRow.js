/*
 * @flow
 */
import React, { Component } from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { Button, StyleUtils } from 'lattice-ui-kit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/pro-solid-svg-icons';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import { updateContact } from '../../containers/contactinformation/ContactInfoActions';
import { getReqState, requestIsPending, requestIsSuccess } from '../../utils/consts/redux/ReduxUtils';
import { getEntityKeyId } from '../../utils/DataUtils';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { CONTACT_INFO_ACTIONS, CONTACT_INFO_DATA } from '../../utils/consts/redux/ContactInformationConsts';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import {
  checkedBase,
  checkedHover,
  uncheckedBase,
  uncheckedHover
} from './TagStyles';

const { getStickyPosition, getStyleVariation } = StyleUtils;
const { IS_MOBILE, IS_PREFERRED } = PROPERTY_TYPES;

export const TableCell = styled.td`
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  padding: 10px 30px;
  text-align: left;
  vertical-align: middle;
  word-wrap: break-word;
  color: ${OL.GREY15};
  ${(props :Object) => props.cellStyle};

  :nth-of-type(3) {
    padding-top: 24px;
  }
`;

const StyledTableRow = styled.tr`
  background-color: ${OL.WHITE};
  border-bottom: none;
  color: ${OL.GREY15};
  font-size: 14px;

  :last-of-type {
    border-bottom: none;
  }

  td,
  th {
    ${getStickyPosition}
  }

  /* stylelint-disable selector-type-no-unknown */
  ${TableCell}:last-child {
    padding-right: 30px;
  }
`;

const TextAndIconWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-start;
`;

const ButtonsWrapper = styled.div`
  display: grid;
  grid-gap: 0 8px;
  grid-template-columns: repeat(2, 1fr);
  width: 100%;
`;

const TextWrapper = styled.div`
  margin-left: ${(props :Object) => (props.isMobile ? '20px' : '35px')};
`;

const baseButtonVariation = getStyleVariation('type', {
  default: uncheckedBase,
  checked: checkedBase,
  unchecked: uncheckedBase,
});

const hoverButtonVariation = getStyleVariation('type', {
  default: uncheckedHover,
  checked: checkedHover,
  unchecked: uncheckedHover,
});

const TagButton = styled(Button)`
  :active {
    ${baseButtonVariation}
  }

  :focus-visible {
    ${baseButtonVariation}
  }

  :hover {
    ${hoverButtonVariation}
  }
`;

type Props = {
  actions:{
    updateContact :RequestSequence;
  };
  className ?:string;
  data :Object;
  headers :Object[];
  submittedContact :Map;
  updateContactReqState :RequestState;
};

type State = {
  mobile :boolean;
  preferred :boolean;
  isSubmittingMobile :boolean;
  isSubmittingPreferred :boolean;
};

class ContactInfoRow extends Component<Props, State> {

  static defaultProps = {
    className: undefined
  };

  constructor(props :Props) {
    super(props);
    const { data } = props;
    const { isMobile, isPreferred } = data;
    this.state = {
      mobile: isMobile,
      preferred: isPreferred,
      isSubmittingMobile: false,
      isSubmittingPreferred: false,
    };
  }

  componentDidUpdate(prevProps :Props) {
    const { data, submittedContact, updateContactReqState } = this.props;
    const { mobile, preferred } = this.state;
    const prevUpdateContactReqState = prevProps.updateContactReqState;
    const { id } = data;
    const idMatchesSubmittedContact :boolean = id === getEntityKeyId(submittedContact);
    const mobileDataHasChanged :boolean = mobile !== submittedContact.getIn([IS_MOBILE, 0]);
    const preferredDataHasChanged :boolean = preferred !== submittedContact.getIn([IS_PREFERRED, 0]);

    if ((requestIsPending(prevUpdateContactReqState) && requestIsSuccess(updateContactReqState))
      && idMatchesSubmittedContact
      && mobileDataHasChanged) {
      this.updateMobileTag();
    }
    if ((requestIsPending(prevUpdateContactReqState) && requestIsSuccess(updateContactReqState))
      && idMatchesSubmittedContact
      && preferredDataHasChanged) {
      this.updatePreferredTag();
    }
  }

  setAsMobile = () => {
    const { actions, data } = this.props;
    const { mobile } = this.state;

    const newValue :boolean = !mobile;
    const { id, personEKID } = data;
    const contactEntity = {
      [IS_MOBILE]: [newValue]
    };
    actions.updateContact({
      contactEntity,
      contactInfoEKID: id,
      personEKID
    });
    this.setState({ isSubmittingMobile: true });
  }

  setAsPreferred = () => {
    const { actions, data } = this.props;
    const { preferred } = this.state;

    const newValue :boolean = !preferred;
    const { id, personEKID } = data;
    const contactEntity = {
      [IS_PREFERRED]: [newValue]
    };
    actions.updateContact({
      contactEntity,
      contactInfoEKID: id,
      personEKID
    });
    this.setState({ isSubmittingPreferred: true });
  }

  updateMobileTag = () => {
    const { mobile } = this.state;
    this.setState({ mobile: !mobile, isSubmittingMobile: false });
  }

  updatePreferredTag = () => {
    const { preferred } = this.state;
    this.setState({ preferred: !preferred, isSubmittingPreferred: false });
  }

  render() {
    const {
      className,
      data,
      headers,
      updateContactReqState
    } = this.props;
    const {
      mobile,
      preferred,
      isSubmittingMobile,
      isSubmittingPreferred,
    } = this.state;

    const { id } = data;
    const mobileType :string = mobile ? 'checked' : 'unchecked';
    const preferredType :string = preferred ? 'checked' : 'unchecked';
    const updatingContact :boolean = requestIsPending(updateContactReqState);
    return (
      <StyledTableRow className={className}>
        <TableCell key={`${id}_cell_${headers[0].key}`}>
          <TextAndIconWrapper>
            {
              mobile && (
                <FontAwesomeIcon color={OL.GREY03} icon={faPhone} />
              )
            }
            <TextWrapper isMobile={mobile}>{ data[headers[0].key] }</TextWrapper>
          </TextAndIconWrapper>
        </TableCell>
        <TableCell key={`${id}_tags_${headers[0].key}`}>
          <ButtonsWrapper>
            <TagButton
                isLoading={updatingContact && isSubmittingMobile}
                onClick={this.setAsMobile}
                type={mobileType}>
              Mobile
            </TagButton>
            <TagButton
                isLoading={updatingContact && isSubmittingPreferred}
                onClick={this.setAsPreferred}
                type={preferredType}>
              Preferred
            </TagButton>
          </ButtonsWrapper>
        </TableCell>
      </StyledTableRow>
    );
  }
}

const mapStateToProps = (state) => {
  const contactInfo = state.get(STATE.CONTACT_INFO);
  return {
    [CONTACT_INFO_DATA.SUBMITTED_CONTACT_INFO]: contactInfo.get(CONTACT_INFO_DATA.SUBMITTED_CONTACT_INFO),
    updateContactReqState: getReqState(contactInfo, CONTACT_INFO_ACTIONS.UPDATE_CONTACT),
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    updateContact
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ContactInfoRow);
