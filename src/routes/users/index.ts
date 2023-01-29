import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import {idParamSchema} from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type {UserEntity} from '../../utils/DB/entities/DBUsers';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    return this.db.users.findMany()
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {

      const userEntity = this.db.users.findOne({
        key: 'id',
        equals: request.params.id
      });
      if (!(await userEntity)) throw fastify.httpErrors.notFound();

      return userEntity as Promise<UserEntity>
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      return this.db.users.create({
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        email: request.body.email,
      })
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {

      const userEntity = this.db.users.findOne({
        key: 'id',
        equals: request.params.id
      });
      if (!(await userEntity)) throw fastify.httpErrors.badRequest();

      const subscribeUsers = await this.db.users.findMany({
        key: 'subscribedToUserIds',
        inArrayAnyOf: [request.params.id]
      });
      subscribeUsers.forEach(user => this.db.users.change(user.id, {
        subscribedToUserIds: user.subscribedToUserIds.filter(subscriber => subscriber !== request.params.id)
      }));
      const profileEntities = await this.db.profiles.findMany({
        key: 'userId',
        equals: request.params.id
      });
      profileEntities.forEach(profile => this.db.profiles.delete(profile.id));
      const postEntities = await this.db.posts.findMany({
        key: 'userId',
        equals: request.params.id
      });
      postEntities.forEach(post => this.db.posts.delete(post.id));
      return this.db.users.delete(request.params.id);
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {

      const userEntity = this.db.users.findOne({
        key: 'id',
        equals: request.params.id
      });
      if (!(await userEntity)) throw fastify.httpErrors.badRequest();

      const subscribeUserEntity = this.db.users.findOne({
        key: 'id',
        equals: request.body.userId
      });
      if (!(await subscribeUserEntity)) throw fastify.httpErrors.badRequest();

      const initialEntity = await subscribeUserEntity;
      const initialEntitySubscriptions = initialEntity?.subscribedToUserIds ?? [];
      return this.db.users.change(request.body.userId, {
        subscribedToUserIds:
          !initialEntitySubscriptions.includes(request.params.id)
            ? [...initialEntitySubscriptions, request.params.id]
            : initialEntitySubscriptions
      })
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {

      const userEntity = this.db.users.findOne({
        key: 'id',
        equals: request.params.id
      });
      if (!(await userEntity)) throw fastify.httpErrors.badRequest();

      const subscribeUserEntity = this.db.users.findOne({
        key: 'id',
        equals: request.body.userId
      });
      if (!(await subscribeUserEntity)) throw fastify.httpErrors.badRequest();

      if (!(await subscribeUserEntity)?.subscribedToUserIds.includes(request.params.id)) throw fastify.httpErrors.badRequest();

      const initialEntity = await subscribeUserEntity;
      const initialEntitySubscriptions = initialEntity?.subscribedToUserIds ?? [];
      return this.db.users.change(request.body.userId, {
        subscribedToUserIds: [...initialEntitySubscriptions.filter(subscription => subscription !== request.params.id)]
      })
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {

      const userEntity = this.db.users.findOne({
        key: 'id',
        equals: request.params.id
      });
      if (!(await userEntity)) throw fastify.httpErrors.badRequest();

      return this.db.users.change(request.params.id, request.body)
    }
  );
};

export default plugin;
