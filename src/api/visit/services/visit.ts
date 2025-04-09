/**
 * visit service
 */

import { factories } from '@strapi/strapi';

// @ts-ignore - Ignoramos el error de tipado de Strapi
export default factories.createCoreService('api::visit.visit');
