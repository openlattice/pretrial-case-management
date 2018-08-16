/*
 * @flow
 */

import styled from 'styled-components';
import FontAwesome from 'react-fontawesome';
import { Link } from 'react-router-dom';
import {
  Button,
  Checkbox,
  Col,
  ControlLabel,
  FormControl,
  FormGroup,
  Radio,
  Row,
  ToggleButton,
  ToggleButtonGroup
} from 'react-bootstrap';

import { FLEX } from './consts/Consts';

export const PaddedRow = styled(Row)`
  margin-bottom: 38px;
`;

export const UnpaddedRow = styled(Row)`
  margin-bottom: 0;
`;

export const CheckboxRow = styled(Row)`
  margin-bottom: 10px;
`;

export const UnpaddedCol = styled(Col)`
  padding-left: 0;
  padding-right: 0;
`;

export const TableFormControl = styled(FormControl)`
  border-radius: 0;
`;

export const Label = styled(ControlLabel)`
  color: #37454a;
  font-size: 16px;
  font-weight: 400;
`;

export const TitleLabel = Label.extend`
  display: block;
  font-family: 'Open Sans', sans-serif;
  color: #555e6f;
`;

export const TableTitleLabel = TitleLabel.extend`
  font-weight: bold;
  font-size: 16px;
`;

export const TableRowLabel = TitleLabel.extend`
  font-size: 16px;
`;

export const SectionHeader = Label.extend`
  font-size: 24px;
  margin-bottom: 24px;
`;

export const SectionHeaderSubtitle = styled.div`
  margin: -24px 0 24px 0;
  font-size: 16px;
  font-style: italic;
`;

export const InlineRadio = styled(Radio)`
  font-size: 16px;
`;

export const InlineCheckbox = styled(Checkbox)`
  font-size: 16px;
  margin-right: 12px;
  margin-bottom: 10px;
  margin-left: 0 !important;
`;

export const InputWrapper = styled(({ flex, children, ...rest }) => (
  <FormGroup {...rest}>{children}</FormGroup>
))`
  padding-right: 30px;
  flex: ${props => props.flex || FLEX.COL_1_3};
`;

export const OtherWrapper = styled.span`
  display: flex;
  align-items: center;
`;

export const StyledInnerSectionWrapper = styled.div`
  margin-bottom: 82px;
`;

export const StyledBuffer = styled.div`
  height: 20px;
`;

export const SubmitWrapper = styled.div`
  text-align: center;
`;

export const ImportantText = styled.div`
  font-weight: bold;
  font-size: 16px;
  width: 100%;
  text-align: center;
`;

export const DeleteButton = styled.button`
  color: #e91e63;
  background: none;
  border: none;
  display: flex;
  flex: 0;
  margin: auto 5px;
  &:hover {
    color: #b90b14;
  }
  &:disabled {
    cursor: default;
  }
`;

export const StyledErrorMessage = styled.div`
  color: firebrick;
`;

export const StyledInnerNav = styled.div`
  height: 40px;
  width: 100%;
`;

export const UndecoratedLink = styled(Link)`
  color: inherit;

  &:hover {
    color: inherit;
    text-decoration: none;
  }

  &:focus {
    outline: none;
    text-decoration: none;
  }
`;

export const StyledToggleButtonGroup = styled(ToggleButtonGroup)`
  display: flex;
  width: 100%;
`;

export const StyledToggleButton = styled(ToggleButton)`
  display: block;
  width: 100%;
  text-align: center;
  -webkit-appearance: none !important;
`;

// from original PSA app

export const Page = styled.div`
  background: #F4F4F4;
  padding-bottom: 30px;
`;

export const PageHeader = styled.div`
  padding: 60px;
  background: white;
  border-bottom: 1px solid darkgray;
`;

export const TitleContainer = styled.div`
  text-align: center;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

export const Title = styled.h1`
  text-align: center;
  color: #37454A;
  font-size: 40px;
  display: flex;
`;

export const Logo = styled.img`
  display: flex;
  max-height: 60px;
  margin-right: 10px;
`;

export const Description = styled.div`
  text-align: center;
  font-size: 24px;
  color: #37454A;
`;

export const FormWrapper = styled.div`
  margin: 0 60px 0 60px;
  padding-bottom: 100px;
`;

export const ButtonWrapper = styled.div`
  text-align: center;
`;

export const SubmitButtonWrapper = ButtonWrapper.extend`
  padding-top: 20px;
  text-align: center;
`;

export const SubmitButton = styled(Button).attrs({
  type: props => props.type || 'submit'
})`
  background-color: #2AA1C0;
  border: none;

  &:hover {
    background-color: #0E647D;
  }
`;

export const InlineBold = styled.span`
  font-weight: bold;
`;

export const InfoContainer = styled.div`
  text-align: center;
`;

export const InfoWrapper = styled.div`
  display: flex;
  margin: 10px 30px;
  justify-content: center;
`;

export const InfoHeader = styled.div`
  font-weight: bold;
  font-size: 18px;
  text-decoration: underline;
`;

export const InfoSubHeader = styled.div`
  font-weight: bold;
  font-size: 14px;
  margin: 20px 0 10px 0;
`;

export const InfoItem = styled.div`
  font-size: 14px;
  margin: 15px;
`;

export const ChargesWrapper = styled.div`
  font-size: 14px;
  text-align: left;
  margin: 0 -30px -5px;
  display: inline-block;
  width: ${props => (props.modal ? 'calc(100% + 60px)' : '110%')};
`;

export const ChargesTable = styled.table`
  width: 100%;
`;

export const ChargeRow = styled.tr`
  border-bottom: 1px solid #e1e1eb;
  padding: 15px 0;

  &:last-child {
    border-bottom: none;
  }
`;

export const ChargeItem = styled.td`
  padding: 25px 15px;
`;

export const ChargeTag = styled.div`
  display: inline-block;
  border-radius: 3px;
  padding: 1px 5px;
  font-size: 11px;
  text-align: center;
  color: white;
  margin-right: 10px;
`;

export const ChargeTagWrapper = styled.div`
  position: absolute;
  transform: translateY(-22px);
  margin: 0;
`;

export const Divider = styled.hr`
  border-top: 1px solid #bbb;
  width: 100%;
`;

export const Spacer = styled.div`
  height: 20px;
`;

export const ResultsContainer = styled.div`
  width: 100%;
  margin: 50px 0;
  text-align: center;
`;

export const ResultsWrapper = styled.div`
  display: inline-block;
  text-align: left;
`;

export const ResultHeader = styled.div`
  margin: 20px 0;
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  color: #555e6f;
`;

export const ScaleWrapper = styled.div`
  height: 40px;
  display: flex;
  flex-direction: row !important;
`;

export const ScaleBlock = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  width: 72px;
  border: 1px solid #b6bbc7;
  margin: 0;
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  color: #555e6f;
`;

export const SelectedScaleBlock = styled(ScaleBlock)`
  background-color: #b6bbc7;
  font-weight: ${props => (props.isScore ? 'bold' : 'normal')};

  &:not(:first-child) {
    border-left: 1px solid #ffffff;
  }
`;

export const RiskFactorTable = styled.table`
  margin: auto;
`;

export const RiskFactorHeaderCell = styled.th`
  padding: 3px 10px;
  border-bottom: 1px solid #aaa;
`;

export const RiskFactorCell = styled.td`
  padding: 3px 10px;
`;

export const WeightedScoreWrapper = styled.div`
  font-size: 14px;
  font-style: italic;
  margin-top: -20px;
  height: 40px;
`;

export const SmallHeader = styled.div`
  font-weight: bold;
  font-size: 14px;
`;

export const RecommendationWrapper = styled.div`
  display: inline-block;
  width: 50%;
`;

/* FORM SETUP */
export const StyledFormViewWrapper = styled.div`
  display: flex;
  width: 100%;
`;

export const StyledFormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 30px auto;
  width: 960px;
`;

export const StyledTitleWrapper = styled.div`
  align-items: center;
  color: #37454a;
  display: flex;
  font-size: 32px;
  justify-content: space-between;
  margin-bottom: 30px;
  width: 100%;
`;

export const StyledSectionWrapper = styled.div`
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
  width: 100%;
  border: solid 1px #e1e1eb;
`;

export const CloseX = styled(FontAwesome)`
  cursor: pointer;
`;

export const StyledTopFormNavBuffer = styled.div`
  height: 55px;
`;

export const ErrorMessage = styled.div`
  text-align: center;
  color: red;
`;

export const StyledSelect = styled.select`
  height: 34px;
  width: 100%;
  background: transparent;
  border: 1px solid rgb(204, 204, 204);
  box-shadow: rgba(0, 0, 0, 0.075) 0 1px 1px inset;

  &:focus {
    border-color: #66afe9;
    outline: 0;
    box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102,175,233,.6);
  }
`;

export const CenteredContainer = styled.div`
  text-align: center;
`;
