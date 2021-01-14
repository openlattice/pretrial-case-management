/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { Button } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { Dispatch } from 'redux';

import { goToRoot } from '../../core/router/RoutingActions';
import { acceptTerms, termsAreAccepted } from '../../utils/AcceptTermsUtils';

type Props = {
  actions :{
    goToRoot :() => void;
  };
}

const TermsContainer = styled.div`
  width: 100%;
  padding: 50px;
  text-align: center;
`;

const TermsWrapper = styled.div`
  max-width: 600px;
  display: inline-block;
`;

const TermsTitle = styled.div`
  font-size: 18px;
  margin-bottom: 20px;
`;

const TermsText = styled.div`
  font-size: 14px;
  margin-bottom: 20px;
`;

const TERMS = `By logging into this system you acknowledge you are accessing a restricted information system.
Your usage may be monitored, recorded, and is subject to an audit. Unauthorized use of the system is strictly
prohibited and you may be subject to criminal and/or civil penalties. By clicking Sign In, you consent to any
monitoring and recording performed by this system.`;

class AppConsent extends React.Component<Props> {

  componentDidMount() {
    if (termsAreAccepted()) {
      this.redirect();
    }
  }

  redirect = () => {
    const { actions } = this.props;
    actions.goToRoot();
  }

  acceptTerms = () => {
    acceptTerms();
    this.redirect();
  }

  render() {
    return (
      <TermsContainer>
        <TermsWrapper>
          <TermsTitle>System Use Agreement:</TermsTitle>
          <TermsText>{TERMS}</TermsText>
          <Button onClick={this.acceptTerms}>Accept</Button>
        </TermsWrapper>
      </TermsContainer>
    );
  }

}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Routing Actions
    goToRoot
  }, dispatch)
});
//$FlowFixMe
export default connect(null, mapDispatchToProps)(AppConsent);
