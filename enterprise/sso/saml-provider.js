const saml = require('samlify');

class UbuntuSAMLProvider {
  constructor() {
    this.ubuntu = 'I authenticate because we trust together';
    this.setupSAML();
  }

  setupSAML() {
    this.sp = saml.ServiceProvider({
      entityID: 'https://azora.world/saml',
      authnRequestsSigned: true,
      wantAssertionsSigned: true,
      privateKey: process.env.SAML_PRIVATE_KEY,
      assertionConsumerService: [{
        Binding: saml.Constants.namespace.binding.post,
        Location: 'https://azora.world/saml/acs'
      }]
    });
  }

  async handleUbuntuLogin(idp, RelayState) {
    const { id, context } = this.sp.createLoginRequest(idp, 'redirect');
    return {
      id,
      context,
      ubuntu: 'Ubuntu SSO authentication initiated'
    };
  }
}

module.exports = UbuntuSAMLProvider;