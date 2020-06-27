const { userService } = require('../../../app/lib/db');

function sourceCookie(req) {
  if (!req.cookies) {
    throw new Error('No cookies found');
  }
  const accessToken = req.cookies['auth_token'] || req.cookies['access_token'];
  if (!accessToken) {
    throw new Error('No access token found in cookie');
  }
  return accessToken;
}

function sourceHeader(req) {
  if (!req.headers) {
    throw new Error('No headers found');
  }
  const authHeader =
    req.headers['Authorization'] || req.headers['authorization'];
  if (!authHeader) {
    throw new Error('No authorization header found');
  }
  const accessToken = authHeader.replace('Bearer ', '').trim();
  if (!accessToken) {
    throw new Error('No access token found in header');
  }
  return accessToken;
}

function sourceToken(req) {
  let accessToken;
  try {
    accessToken = sourceCookie(req);
  } catch (e) {}
  if (accessToken) return accessToken;
  try {
    accessToken = sourceHeader(req);
  } catch (e) {}
  return accessToken;
}

async function getUser(idm_id) {
  return await userService.findOne({ idm_id });
}

async function verifyRequest(req, validateToken) {
  const accessToken = sourceToken(req);
  if (!accessToken) throw new Error('Access token not found');

  const decoded = await validateToken(accessToken);
  const user = await getUser(decoded.sub);
  if (!user) throw new Error('No user found');

  return user;
}

module.exports = { sourceToken, getUser, verifyRequest };
