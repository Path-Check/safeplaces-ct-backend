const xp = require('xpolicy');
const { NotIn, NotEq, Eq, Any } = xp.rules;

const enforcer = new xp.Enforcer();

enforcer.addPolicy(
  new xp.Policy({
    id: 1,
    description: `Allow a contact tracer to do anything to any resource except
    case publishing and organization configuration.`,
    subject: Eq('contact_tracer'),
    resource: NotIn(['/cases/publish', '/organization/configuration']),
    action: {
      method: Any(),
    },
    effect: xp.effects.Allow,
  }),
);

enforcer.addPolicy(
  new xp.Policy({
    id: 2,
    description: `Allow a contact tracer to do anything except PUT to the
    organization configuration.`,
    subject: Eq('contact_tracer'),
    resource: Eq('/organization/configuration'),
    action: {
      method: NotEq('PUT'),
    },
    effect: xp.effects.Allow,
  }),
);

enforcer.addPolicy(
  new xp.Policy({
    id: 3,
    description: `Allow an admin to do anything to any resource.`,
    subject: Eq('admin'),
    resource: Any(),
    action: {
      method: Any(),
    },
    effect: xp.effects.Allow,
  }),
);

module.exports = {
  authorize: (role, method, path) => {
    const op = new xp.Operation({
      subject: role,
      resource: path,
      action: {
        method,
      },
    });
    return enforcer.isAllowed(op);
  },
};
