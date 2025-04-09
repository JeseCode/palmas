import type { Struct, Schema } from '@strapi/strapi';

export interface VisitVisitor extends Struct.ComponentSchema {
  collectionName: 'components_visit_visitors';
  info: {
    displayName: 'Visitor';
    description: 'Informaci\u00F3n del visitante';
  };
  attributes: {
    first_name: Schema.Attribute.String & Schema.Attribute.Required;
    last_name: Schema.Attribute.String & Schema.Attribute.Required;
    document_number: Schema.Attribute.String & Schema.Attribute.Required;
    photo: Schema.Attribute.Media<'images'>;
  };
}

export interface VisitVehicle extends Struct.ComponentSchema {
  collectionName: 'components_visit_vehicles';
  info: {
    displayName: 'Vehicle';
    description: 'Informaci\u00F3n del veh\u00EDculo del visitante';
  };
  attributes: {
    license_plate: Schema.Attribute.String & Schema.Attribute.Required;
    brand: Schema.Attribute.String;
    model: Schema.Attribute.String;
    color: Schema.Attribute.String;
    photo: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    displayName: 'Slider';
    icon: 'address-book';
    description: '';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    name: 'Seo';
    icon: 'allergies';
    displayName: 'Seo';
    description: '';
  };
  attributes: {
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    displayName: 'Rich text';
    icon: 'align-justify';
    description: '';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    title: Schema.Attribute.String;
    body: Schema.Attribute.Text;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'visit.visitor': VisitVisitor;
      'visit.vehicle': VisitVehicle;
      'shared.slider': SharedSlider;
      'shared.seo': SharedSeo;
      'shared.rich-text': SharedRichText;
      'shared.quote': SharedQuote;
      'shared.media': SharedMedia;
    }
  }
}
