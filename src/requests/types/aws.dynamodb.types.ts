import { DocumentClientTypes } from '@typedorm/document-client';

export type FindResults<Entity> = {
  items: Entity[];
  cursor?: DocumentClientTypes.Key | undefined;
};
