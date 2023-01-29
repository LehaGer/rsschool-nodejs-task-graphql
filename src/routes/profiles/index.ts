import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import {idParamSchema} from '../../utils/reusedSchemas';
import {createProfileBodySchema, changeProfileBodySchema} from './schema';
import type {ProfileEntity} from '../../utils/DB/entities/DBProfiles';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<ProfileEntity[]> {
    return this.db.profiles.findMany()
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {

      const profileEntity = this.db.profiles.findOne({
        key: 'id',
        equals: request.params.id
      });
      if(!(await profileEntity)) throw fastify.httpErrors.notFound();

      return profileEntity as Promise<ProfileEntity>
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {

      const userEntity = this.db.users.findOne({
        key: 'id',
        equals: request.body.userId
      });
      if(!(await userEntity)) throw fastify.httpErrors.badRequest();

      const memberTypeEntity = this.db.memberTypes.findOne({
        key: 'id',
        equals: request.body.memberTypeId
      })
      if(!(await memberTypeEntity)) throw fastify.httpErrors.badRequest();

      const profileEntity = this.db.profiles.findOne({
        key: 'userId',
        equals: request.body.userId
      });
      if(await profileEntity) throw fastify.httpErrors.badRequest();

      return this.db.profiles.create(request.body);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {

      const profileEntity = this.db.profiles.findOne({
        key: 'id',
        equals: request.params.id
      });
      if(!(await profileEntity)) throw fastify.httpErrors.badRequest();

      return this.db.profiles.delete(request.params.id);
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {

      const profileEntity = this.db.profiles.findOne({
        key: 'id',
        equals: request.params.id
      });
      if(!(await profileEntity)) throw fastify.httpErrors.badRequest();

      return this.db.profiles.change(request.params.id, request.body);
    }
  );
};

export default plugin;
