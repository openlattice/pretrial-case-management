import styled from 'styled-components';
import Select from 'react-select';

import { OL } from '../utils/consts/Colors';

const StyledSelect = styled(Select)`
  width: 100%;

  .lattice-select__control {
    width: 100%;
    min-height: 44px;
    border-radius: 5px;
    border: none;
    background-color: ${(props) => (props.background || 'transparent')};
    margin-top: 10px;
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    text-align: left;
    color: ${OL.GREY15};
    box-shadow: none;
    padding-right: 10%;

    svg {
      height: 11px;
      padding: 0;
    }
  }

  .lattice-select__value-container {
    width: auto;
  }

  .lattice-select__group-heading {
    padding-top: 14px;
    border-top: solid 1px ${OL.GREY11};
  }

  .lattice-select__menu {
    width: 100%;
    text-align: left;
  }

  .lattice-select__indicator {
    padding: 0;
  }

  .lattice-select__control.lattice-select__control-is-focused {
    box-shadow: 0 0 0 0;
    background-color: ${OL.WHITE};
  }

  .lattice-select__option {
    color: ${OL.GREY01};
    font-size: 14px;
    line-height: 19px;

    :active {
      background-color: ${OL.GREY06};
    }
  }

  .lattice-select__option--is-focused {
    background-color: ${OL.GREY08};
  }

  .lattice-select__option--is-selected {
    background-color: ${OL.GREY06};
    color: ${OL.GREY15};
  }

  .lattice-select__single-value {
    color: ${OL.GREY15};
    font-size: 14px;
    line-height: 19px;
  }

  .lattice-select__indicator-separator {
    display: none;
  }
`;

export default StyledSelect;
