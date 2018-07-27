/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';

import BasicButton from '../buttons/BasicButton';
import SecondaryButton from '../buttons/SecondaryButton';
import DropdownButton from '../buttons/DropdownButton';
import LoadingSpinner from '../LoadingSpinner';
import DMFCell from '../dmf/DMFCell';
import ChargeTable from '../charges/ChargeTable';
import CaseHistoryTimeline from '../casehistory/CaseHistoryTimeline';
import RiskFactorsTable from '../riskfactors/RiskFactorsTable';
import psaSuccessIcon from '../../assets/svg/psa-success.svg';
import psaFailureIcon from '../../assets/svg/psa-failure.svg';
import closeXWhiteIcon from '../../assets/svg/close-x-white.svg';
import closeXGrayIcon from '../../assets/svg/close-x-gray.svg';
import closeXBlackIcon from '../../assets/svg/close-x-black.svg';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getHeaderText } from '../../utils/consts/DMFResultConsts';
import {
  ResultHeader,
  ScaleBlock,
  SelectedScaleBlock,
  ScaleWrapper
} from '../../utils/Layout';
import * as Routes from '../../core/router/Routes';

type Props = {
  isSubmitting :boolean,
  scores :Immutable.Map<*, *>,
  riskFactors :Object,
  dmf :Object,
  personId :string,
  submitSuccess :boolean,
  charges :Immutable.List<*>,
  notes :string,
  allCases :Immutable.List<*>,
  allCharges :Immutable.Map<*, *>,
  getOnExport :(isCompact :boolean) => void,
  onClose :() => void,
  history :string[]
};

const STATUSES = {
  SUBMITTING: 'SUBMITTING',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE'
};

const WideContainer = styled.div`
  margin-left: -15px;
  width: 998px;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Banner = styled(WideContainer)`
  margin-top: -35px;
  padding: 30px;
  background-color: ${(props) => {
    switch (props.status) {
      case STATUSES.SUCCESS:
        return '#00be84';
      case STATUSES.FAILURE:
        return '#ffe25c';
      default:
        return '#f0f0f7';
    }
  }};
  height: 80px;
  width: 1000px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  div {
    display: flex;
    flex-direction: row;
    align-items: center;

    span {
      font-family: 'Open Sans', sans-serif;
      font-size: 18px;
      font-weight: 600;
      color: ${props => (props.status === STATUSES.SUCCESS ? '#ffffff' : '#2e2e34')};
      margin-left: 15px;
    }
  }

  button {
    background: none;
    border: none;
    &:hover {
      cursor: pointer;
    }

    &:focus {
      outline: none;
    }
  }

`;

const Bookend = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  padding: 0 15px;

`;

const HeaderRow = styled(Bookend)`
  margin-top: 60px;

  span {
    font-family: 'Open Sans', sans-serif;
    font-size: 18px;
    color: #555e6f;
  }
`;

const FooterRow = styled(Bookend)`
  margin: 50px 0 30px 0;

  div {
    align-items: center;
  }

  ${BasicButton}:last-child {
    width: 43px;
    padding: 0;
  }
`;

const Flag = styled.span`
  width: 86px;
  height: 32px;
  border-radius: 3px;
  border: solid 1px #555e6f;
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #555e6f;
  padding: 5px 30px;
`;

const InlineScores = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 30px 0;

  div {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
`;

const ScoresContainer = styled.div`
  padding: 0 15px;
`;

const DMF = styled(WideContainer)`
  border-top: 1px solid #e1e1eb;
  border-bottom: 1px solid #e1e1eb;
  margin-top: 30px;
  padding: 15px 30px;

  section {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

    span {
      margin: 15px 0;
      font-family: 'Open Sans', sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: #555e6f;
    }
  }
`;

const NotesContainer = styled(WideContainer)`
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: #2e2e34;
  border-bottom: 1px solid #e1e1eb;
  padding-bottom: 30px;
  padding-left: 30px;
`;

const TimelineContainer = styled.div`
  padding: 0 15px;
`;

const PaddedResultHeader = styled(ResultHeader)`
  margin-top: 50px;
  margin-left: 15px;
`;

const MinimallyPaddedResultHeader = styled(PaddedResultHeader)`
  margin-top: 30px;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;

  button {
    width: ${props => (props.wide ? '240px' : '154px')};
    padding-left: 0;
    padding-right: 0;
    justify-content: center;
  }

  button:not(:first-child) {
    margin-left: 20px;
  }
`;

class PSASubmittedPage extends React.Component<Props> {

  renderBanner = () => {
    const { submitSuccess, isSubmitting, onClose } = this.props;
    let status = null;
    let content = null;
    let closeIconSrc = closeXBlackIcon;
    if (isSubmitting) {
      status = STATUSES.SUBMITTING;
      content = (
        <div>
          <LoadingSpinner />
          <span>Loading...</span>
        </div>
      );
    }
    else {
      const headerText = submitSuccess ? 'PSA Successfully Submitted!' : 'An error occurred: unable to submit PSA.';
      const iconSrc = submitSuccess ? psaSuccessIcon : psaFailureIcon;
      status = submitSuccess ? STATUSES.SUCCESS : STATUSES.FAILURE;
      if (submitSuccess) {
        closeIconSrc = closeXWhiteIcon;
      }

      content = (
        <div>
          <img src={iconSrc} role="presentation" />
          <span>{headerText}</span>
        </div>
      );
    }

    return (
      <Banner status={status}>
        <span />
        {content}
        <button onClick={onClose}>
          <img src={closeIconSrc} role="presentation" />
        </button>
      </Banner>
    );
  }

  renderNvca = () => (
    <div>
      <ResultHeader>New Violent Criminal Activity Flag</ResultHeader>
      <Flag>{this.props.scores.getIn([PROPERTY_TYPES.NVCA_FLAG, 0]) ? 'Yes' : 'No'}</Flag>
    </div>
  )

  renderScale = (val :number) => {
    const scale = [];
    for (let i = 1; i < 7; i += 1) {
      const block = (i <= val)
        ? <SelectedScaleBlock key={i} isScore={i === val}>{i}</SelectedScaleBlock>
        : <ScaleBlock key={i}>{i}</ScaleBlock>;
      scale.push(block);
    }
    return <ScaleWrapper>{scale}</ScaleWrapper>;
  }

  renderScaleItem = (fqn, label) => {
    return (
      <div>
        <ResultHeader>{label}</ResultHeader>
        {this.renderScale(this.props.scores.getIn([fqn, 0]))}
      </div>
    )
  }

  renderScores = () => {
    return (
      <ScoresContainer>
        {this.renderNvca()}
        <InlineScores>
          {this.renderScaleItem(PROPERTY_TYPES.NCA_SCALE, 'New Criminal Activity Scale')}
          {this.renderScaleItem(PROPERTY_TYPES.FTA_SCALE, 'Failure to Appear Scale')}
        </InlineScores>
      </ScoresContainer>
    )
  }

  renderDMF = () => {
    return (
      <DMF>
        <ResultHeader>DMF Result</ResultHeader>
        <section>
          <DMFCell dmf={this.props.dmf} selected large />
          <span>{getHeaderText(this.props.dmf)}</span>
        </section>
      </DMF>
    );
  }

  renderRiskFactorsTable = () => {
    const { riskFactors } = this.props;

    const format = (valList) => {
      if (!valList.length) return '';
      const val = valList[0];
      if (val.length) return val;
      return val ? 'Yes' : 'No';
    };

    const rows = Immutable.fromJS([
      {
        number: 1,
        riskFactor: 'Age at Current Arrest',
        response: format(riskFactors[PROPERTY_TYPES.AGE_AT_CURRENT_ARREST])
      },
      {
        number: 2,
        riskFactor: 'Current Violent Offense',
        response: format(riskFactors[PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE])
      },
      {
        number: '2a',
        riskFactor: 'Current Violent Offense & 20 Years Old or Younger',
        italicText: '(calculated from 1 and 2)',
        response: format(riskFactors[PROPERTY_TYPES.CURRENT_VIOLENT_OFFENSE_AND_YOUNG])
      },
      {
        number: 3,
        riskFactor: 'Pending Charge at the Time of the Offense',
        response: format(riskFactors[PROPERTY_TYPES.PENDING_CHARGE])
      },
      {
        number: 4,
        riskFactor: 'Prior Misdemeanor Conviction',
        response: format(riskFactors[PROPERTY_TYPES.PRIOR_MISDEMEANOR])
      },
      {
        number: 5,
        riskFactor: 'Prior Felony Conviction',
        response: format(riskFactors[PROPERTY_TYPES.PRIOR_FELONY])
      },
      {
        number: '5a',
        riskFactor: 'Prior Conviction',
        italicText: '(calculated from 4 and 5)',
        response: format(riskFactors[PROPERTY_TYPES.PRIOR_CONVICTION])
      },
      {
        number: 6,
        riskFactor: 'Prior Violent Conviction',
        response: format(riskFactors[PROPERTY_TYPES.PRIOR_VIOLENT_CONVICTION])
      },
      {
        number: 7,
        riskFactor: 'Prior Pretrial Failure to Appear in Past 2 Years',
        response: format(riskFactors[PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_RECENT])
      },
      {
        number: 8,
        riskFactor: 'Prior Pretrial Failure to Appear Older than 2 Years',
        response: format(riskFactors[PROPERTY_TYPES.PRIOR_FAILURE_TO_APPEAR_OLD])
      },
      {
        number: 9,
        riskFactor: 'Prior Sentence to Incarceration',
        response: format(riskFactors[PROPERTY_TYPES.PRIOR_SENTENCE_TO_INCARCERATION])
      }
    ]);

    return <RiskFactorsTable rows={rows} disabled />;
  }

  renderExportButton = () => (
    <div>
      <DropdownButton
          title="PDF Report"
          options={[{
            label: 'Export compact version',
            onClick: () => this.props.getOnExport(true)
          }, {
            label: 'Export full version',
            onClick: () => this.props.getOnExport(false)
          }]} />
    </div>
  )

  renderProfileButton = () => (
    <SecondaryButton
        onClick={() => {
          this.props.history.push(Routes.PERSON_DETAILS.replace(':personId', this.props.personId));
        }}>
      Go to Profile
    </SecondaryButton>
  )

  render() {
    const {
      notes,
      charges,
      onClose,
      allCases,
      allCharges
    } = this.props;

    return (
      <Wrapper>
        {this.renderBanner()}
        <HeaderRow>
          <span>Public Safety Assessment</span>
          <ButtonRow>
            {this.renderExportButton()}
            {this.renderProfileButton()}
          </ButtonRow>
        </HeaderRow>
        {this.renderScores()}
        {this.renderDMF()}
        <div>
          <MinimallyPaddedResultHeader>Charges</MinimallyPaddedResultHeader>
          <WideContainer>
            <ChargeTable charges={charges} disabled />
          </WideContainer>
          <PaddedResultHeader>Risk Factors</PaddedResultHeader>
          <WideContainer>
            {this.renderRiskFactorsTable()}
          </WideContainer>
          <PaddedResultHeader>Notes</PaddedResultHeader>
          <NotesContainer>{notes}</NotesContainer>
          <MinimallyPaddedResultHeader>Timeline</MinimallyPaddedResultHeader>
          <TimelineContainer>
            <CaseHistoryTimeline caseHistory={allCases} chargeHistory={allCharges} />
          </TimelineContainer>
        </div>
        <FooterRow>
          <div />
          <ButtonRow wide>
            {this.renderExportButton()}
            {this.renderProfileButton()}
          </ButtonRow>
          <BasicButton onClick={onClose}><img src={closeXGrayIcon} role="presentation" /></BasicButton>
        </FooterRow>
      </Wrapper>
    );
  }
}

export default withRouter(PSASubmittedPage);
