/**
 * visit router
 */

import { factories } from '@strapi/strapi';

// @ts-ignore - Ignoramos el error de tipado de Strapi
export default factories.createCoreRouter('api::visit.visit');
