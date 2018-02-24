/*
 * Hack to get chai plugins working:
 * This file must be imported in every test file
 */

import chai from 'chai';
import chaiImmutable from 'chai-immutable';
import chaiEnzyme from 'chai-enzyme';
import chaiSinon from 'chai-sinon';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiImmutable);
chai.use(chaiEnzyme());
chai.use(chaiSinon);
chai.use(chaiAsPromised);
