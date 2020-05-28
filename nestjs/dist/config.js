"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_entity_1 = require("./auth/typeorm/entities/user.entity");
const safepath_entity_1 = require("./safeplaces/typeorm/entities/safepath.entity");
const redactedTrail_entity_1 = require("./safeplaces/typeorm/entities/redactedTrail.entity");
exports.port = parseInt(process.env.PORT) || 3000;
exports.orgId = process.env.ORG_ID || '';
exports.maps_api_key = process.env.GOOGLE_MAP_API_KEY || '';
exports.jwtConfig = {
    secret: process.env.JWT_SECRET || '$b8La3@fn7M!&Gato%Xag12zA4@1k#',
    expiresIn: process.env.JWT_DURATION || '1 hour'
};
exports.dbConfig = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || 'safeplaces',
    entities: [user_entity_1.User, safepath_entity_1.SafePath, redactedTrail_entity_1.RedactedTrail],
    synchronize: true
};
//# sourceMappingURL=config.js.map