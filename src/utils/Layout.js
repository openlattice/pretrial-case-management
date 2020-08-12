/*
 * @flow
 */
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import BasicButton from '../components/buttons/BasicButton';
import closeX from '../assets/svg/close-x-gray.svg';

import { OL } from './consts/Colors';

export const PrimaryButton = styled(BasicButton)`
  border-radius: 3px;
  background-color: ${OL.PURPLE02};
  color: ${OL.WHITE};
  height: 36px;
  width: 200px;
  :hover {
    background-color: ${OL.PURPLE03} !important;
  }
  :focus {
    background-color: ${OL.PURPLE01} !important;
  }
`;

export const SecondaryButton = styled(BasicButton)`
  border-radius: 3px;
  background-color: ${OL.PURPLE06};
  color: ${OL.PURPLE02} !important;
  height: 36px;
  width: 200px;
  :hover {
    background-color: ${OL.PURPLE05} !important;
  }
  :focus {
    background-color: ${OL.PURPLE04} !important;
  }
`;

export const TertiaryButton = styled(BasicButton)`
  border-radius: 3px;
  background-color: ${OL.GREY08};
  color: ${OL.GREY02};
  height: 36px;
  width: 200px;
  :hover {
    background-color: ${OL.GREY05} !important;
  }
  :focus {
    color: ${OL.WHITE};
    background-color: ${OL.GREY03} !important;
  }
`;

export const TitleLabel = styled.div`
  display: block;
  font-size: 16px;
  font-family: 'Open Sans', sans-serif;
  color: ${OL.GREY01};
`;

export const TableTitleLabel = styled(TitleLabel)`
  font-weight: bold;
  font-size: 16px;
`;

export const TableRowLabel = styled(TitleLabel)`
  font-size: 16px;
`;

export const SectionHeaderSubtitle = styled.div`
  margin: -24px 0 24px 0;
  font-size: 16px;
  font-style: italic;
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
  color: ${OL.PINK02};
  background: none;
  border: none;
  display: flex;
  flex: 0;
  margin: auto 5px;
  &:hover {
    color: ${OL.RED04};
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

// from original PSA app

export const Page = styled.div`
  background: ${OL.GREY35};
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

export const Logo = styled.img`
  display: flex;
  max-height: 60px;
  margin-right: 10px;
`;

export const Description = styled.div`
  text-align: center;
  font-size: 24px;
  color: ${OL.GREY34};
`;

export const FormWrapper = styled.div`
  margin: 0 60px 0 60px;
  padding-bottom: 100px;
`;

export const ButtonWrapper = styled.div`
  text-align: center;
`;

export const SubmitButtonWrapper = styled(ButtonWrapper)`
  padding-top: 20px;
  text-align: center;
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
  margin: ${(props) => (props.modal ? '0 -30px -5px' : 0)};
  display: inline-block;
  width: ${(props) => (props.modal ? 'calc(100% + 60px)' : '100%')};
  border-bottom: ${(props) => (props.isCompact ? `1px solid ${OL.GREY11}` : 'none')} !important;
`;

export const ChargesTable = styled.table`
  padding: ${(props) => (props.modal ? 0 : '0 30px')};
  width: 100%;
`;

export const ChargeRow = styled.tr`
  border-bottom: 1px solid ${OL.GREY11};
  padding: 15px 0;

  &:last-child {
    border-bottom: none;
  }
`;

export const ChargeItem = styled.td`
  padding: ${(props) => (props.isCompact ? '0px 15px' : '25px 15px')};
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
  border-top: 1px solid ${OL.GREY36};
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
  color: ${OL.GREY01};
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
  border: 1px solid ${OL.GREY03};
  margin: 0;
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  color: ${OL.GREY01};
`;

export const SelectedScaleBlock = styled(ScaleBlock)`
  background-color: ${OL.GREY03};
  font-weight: ${(props) => (props.isScore ? 'bold' : 'normal')};

  &:not(:first-child) {
    border-left: 1px solid ${OL.WHITE};
  }
`;

export const RiskFactorTable = styled.table`
  margin: auto;
`;

export const RiskFactorHeaderCell = styled.th`
  padding: 3px 10px;
  border-bottom: 1px solid ${OL.GREY37};
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
  margin: 0 auto 30px;
  width: 960px;
`;

export const StyledTitleWrapper = styled.div`
  align-items: center;
  color: ${OL.GREY34};
  display: flex;
  font-size: 32px;
  justify-content: space-between;
  margin-bottom: 30px;
  width: 100%;
`;

export const StyledSectionWrapper = styled.div`
  background: ${OL.WHITE};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
  width: 100%;
  border: solid 1px ${OL.GREY11};
`;

export const CloseX = styled(FontAwesomeIcon)`
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
    border-color: ${OL.GREY12};
    outline: 0;
    box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102,175,233,.6);
  }
`;

export const CenteredContainer = styled.div`
  text-align: center;
`;

export const FullWidthContainer = styled.div`
  display: flex;
  width: 100%;
`;

export const Title = styled.div`
  display: flex;
  flex-direction: column;
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: ${OL.GREY01};
  margin: 20px 0;

  span:first-child {
    font-size: ${(props) => (props.withSubtitle ? 16 : 20)}px;
    font-weight: ${(props) => (props.withSubtitle ? '600' : '400')};
    padding-bottom: 5px;
  }
`;

export const Count = styled.div`
  height: fit-content;
  padding: 0 10px;
  margin: 0 10px;
  border-radius: 10px;
  background-color: #f0f0f7;
  font-size: 12px;
  color: #8e929b;
`;

export const PendingChargeStatus = styled.div`
  border-radius: 3px;
  text-transform: uppercase;
  padding: 5px;
  background-color: ${(props) => (props.pendingCharges ? '#ff3c5d' : '#00be84')};
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  color: #ffffff;
`;

export const AlternateSectionHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  padding: 30px 0 20px 30px;
  font-weight: 600;
  color: #555e6f;
`;

export const Wrapper = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  height: 100%;
`;

export const StyledColumn = styled.div`
  width: 960px;
  display: flex;
  flex-direction: column;
  overflow: visble;
`;

export const StyledColumnRowWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  max-width: 960px;
  background: ${OL.WHITE};
  border-radius: 5px;
`;

export const StyledColumnRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  padding: ${(props) => (props.withPadding ? '0 30px' : 0)};
  border-radius: 5px;
  background-color: ${OL.WHITE};
  border: solid 1px ${OL.GREY11};
`;

export const SummaryRowWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 66% 33%;
  margin: 30px 0;
`;

export const NoResults = styled.div`
  color: ${OL.GREY01};
  font-size: 16px;
  text-align: center;
  width: 100%;
  padding: 50px 0;
`;

export const PaddedStyledColumnRow = styled(StyledColumnRow)`
  border: none;
  margin: 0 -15px;
  width: calc(100% + 30px);
`;

export const TitleWrapper = styled.div`
  padding: ${(props) => (props.noPadding ? 0 : '0 15px')};
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const CloseModalX = styled.img.attrs({
  alt: '',
  src: closeX
})`
  height: 16px;
  width: 16px;
  margin-left: 40px;

  &:hover {
    cursor: pointer;
  }
`;
// Stats Styled Tags

export const StatsWrapper = styled.div`
  padding: ${(props) => (props.padding ? '30px 30px' : '0')};
  width: 100%;
  hr {
    margin: ${(props) => (props.padding ? '0 -30px' : '15px 0')};
    width: ${(props) => (props.padding ? 'calc(100% + 60px)' : '100%')};
  }
`;

export const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 15px 0;
`;

export const StatsSubWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

export const StatsGroup = styled.div`
  display: grid;
  grid-template-columns: 28% 28% 28%;
  grid-column-gap: 8%;
  grid-template-rows: 50% 50%;
  width: 100%;
`;
export const StatsItem = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 2px;
`;

export const StatLabel = styled.span`
  font-size: 16px;
  text-align: left;
  color: ${OL.GREY01};
`;

export const StatValue = styled.span`
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  text-align: right;
  color: ${OL.GREY01};
`;

export const StatsSectionHeader = styled(AlternateSectionHeader)`
  padding: 0;
  justify-content: space-between;
`;

// mugshot wrapper

export const PersonPicture = styled.img`
  width: ${(props) => (props.small ? 30 : 36)}px;
  height: auto;
`;

export const PersonMugshot = styled.div`
  margin-right: 20px;
  border-radius: 50%;
  min-width: 36px;
  height: 36px;
  position: relative;
  overflow: hidden;

  img {
      display: inline;
      margin: 0 auto;
  }
`;

export const Content = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-weight: normal;
  color: ${OL.GREY15};
`;

export const ContentBlock = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ContentHeader = styled.div`
  width: 100%;
  font-family: 'Open Sans', sans-serif;
  padding-bottom: 15px;
  font-size: 16px;
  font-weight: 600;
  color: ${OL.GREY01};
`;

export const ContentLabel = styled.div`
  font-family: 'Open Sans',sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${OL.GREY02};
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const Header = styled.div`
  width: 100%;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${OL.GREY02};
`;

export const Data = styled.div`
  width: 100%;
  font-size: 14px;
  color: ${OL.GREY15};
`;

export const WarningText = styled.div`
  color: ${OL.RED01};
  display: flex;
  flex-direction: row;
  font-size: 12px;
  justify-content: flex-end;
  width: 100%;
  svg {
    margin: 2px;
  }
`;
