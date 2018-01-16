import React from 'react';
import { Route, Switch } from 'react-router-dom';

import PsaForm from '../psa/FormContainer';
import * as Routes from '../../core/router/Routes';

const Forms = () => {
  return (
    <Switch>
      <Route path={Routes.PSA_FORM} component={PsaForm} />
    </Switch>
  );
};

export default Forms;
