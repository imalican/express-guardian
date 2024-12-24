import { Model, Document } from 'mongoose';
import { NotFoundError } from './errors';

export abstract class BaseService<T extends Document> {
  constructor(protected model: Model<T>) {}

  protected async findByIdOrThrow(id: string): Promise<T> {
    const doc = await this.model.findById(id);
    if (!doc) {
      throw new NotFoundError(this.model.modelName);
    }
    return doc;
  }

  protected async findOneOrThrow(filter: Record<string, unknown>): Promise<T> {
    const doc = await this.model.findOne(filter);
    if (!doc) {
      throw new NotFoundError(this.model.modelName);
    }
    return doc;
  }
}
