import { type JSONSchema } from 'json-schema-typed';

export const IConfigurationDefaults: Record<string, JSONSchema> = {
  storage: {
    type: 'object',
    description: 'object storage',
    properties: {
      files: {
        type: 'object',
        description: 'files storage',
        properties: {
          maxBytes: {
            type: 'number',
            description: 'Max file size in bytes',
            default: 20 * 1024 * 1024, // 20MB
          },
          accepts: {
            type: 'array',
            description: 'List of accepted file types',
            items: {
              type: 'string',
            },
            default: [
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.ms-excel',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'application/vnd.ms-powerpoint',
              'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            ],
          },
        },
      },
      images: {
        description: 'images storage',
        properties: {
          maxBytes: {
            type: 'number',
            description: 'Max file size in bytes',
            default: 5 * 1024 * 1024, // 5MB
          },
          accepts: {
            type: 'array',
            description: 'List of accepted file types',
            items: {
              type: 'string',
            },
            default: ['image/png', 'image/jpeg', 'image/gif'],
          },
        },
      },
    },
  },
};
