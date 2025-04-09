"use strict";
/**
 * visit service
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
// @ts-ignore - Ignoramos el error de tipado de Strapi
exports.default = strapi_1.factories.createCoreService('api::visit.visit');
