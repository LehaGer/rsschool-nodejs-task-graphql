import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import {idParamSchema} from '../../utils/reusedSchemas';
import {changeMemberTypeBodySchema} from './schema';
import type {MemberTypeEntity} from '../../utils/DB/entities/DBMemberTypes';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<MemberTypeEntity[]> {
    return this.db.memberTypes.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {

      const memberTypesEntity = this.db.memberTypes.findOne({
        key: 'id',
        equals: request.params.id
      });
      if (!(await memberTypesEntity)) throw fastify.httpErrors.notFound();

      return this.db.memberTypes.findOne({
        key: 'id',
        equals: request.params.id
      }) as Promise<MemberTypeEntity>
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeMemberTypeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {

      const memberTypesEntity = this.db.memberTypes.findOne({
        key: 'id',
        equals: request.params.id
      });
      if (!(await memberTypesEntity)) throw fastify.httpErrors.badRequest();

      return this.db.memberTypes.change(request.params.id, request.body);
    }
  );
};

export default plugin;
