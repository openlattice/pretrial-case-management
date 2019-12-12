/*
 * @flow
 */
import React, { Component } from 'react';
import styled from 'styled-components';
import { Button, StyleUtils } from 'lattice-ui-kit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/pro-solid-svg-icons';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import { updateContact } from '../../containers/contactinformation/ContactInfoActions';
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
  ${props => props.cellStyle};

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
  margin-left: ${props => props.isMobile ? '20px' : '35px'};
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
  ${baseButtonVariation}
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
};

type State = {
  mobile :boolean;
  preferred :boolean;
};

class ContactInfoRow extends Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      mobile: props.data.isMobile,
      preferred: props.data.isPreferred,
    };
  }

  static defaultProps = {
    className: undefined
  };

  setAsMobile = () => {
    const { actions, data } = this.props;
    const { mobile } = this.state;
    this.setState({ mobile: !mobile });

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
  }

  setAsPreferred = () => {
    const { actions, data } = this.props;
    const { preferred } = this.state;
    this.setState({ preferred: !preferred });

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
  }

  render() {
    const {
      className,
      data,
      headers
    } = this.props;
    const { mobile, preferred } = this.state;
    const { id } = data;

    const mobileType :string = mobile ? 'checked' : 'unchecked';
    const preferredType :string = preferred ? 'checked' : 'unchecked';

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
                onClick={this.setAsMobile}
                size="sm"
                type={mobileType}>
              Mobile
            </TagButton>
            <TagButton
                onClick={this.setAsPreferred}
                size="sm"
                type={preferredType}>
              Preferred
            </TagButton>
          </ButtonsWrapper>
        </TableCell>
      </StyledTableRow>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    updateContact
  }, dispatch)
});

// $FlowFixMe
export default connect(null, mapDispatchToProps)(ContactInfoRow);
