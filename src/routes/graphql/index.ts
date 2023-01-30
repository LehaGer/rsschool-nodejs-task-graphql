import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import {graphqlBodySchema} from './schema';
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList, GraphQLNonNull, GraphQLFloat, GraphQLInt, GraphQLEnumType
} from 'graphql';
import {ProfileEntity} from "../../utils/DB/entities/DBProfiles";
import {UserEntity} from "../../utils/DB/entities/DBUsers";
import {PostEntity} from "../../utils/DB/entities/DBPosts";
import {MemberTypeEntity} from "../../utils/DB/entities/DBMemberTypes";

const postType = new GraphQLObjectType({
  name: 'post',
  fields: {
    id: {type: new GraphQLNonNull(GraphQLString)},
    title: {type: new GraphQLNonNull(GraphQLString)},
    content: {type: GraphQLString},
    userId: {type: new GraphQLNonNull(GraphQLString)}
  }
});
const userType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: {type: new GraphQLNonNull(GraphQLString)},
    firstName: {type: GraphQLString},
    lastName: {type: GraphQLString},
    email: {type: GraphQLString},
    subscribedToUserIds: {type: new GraphQLList(GraphQLString)}
  }
});
const profilesType = new GraphQLObjectType({
  name: 'profile',
  fields: {
    id: {type: new GraphQLNonNull(GraphQLString)},
    avatar: {type: GraphQLString},
    sex: {
      type: new GraphQLEnumType({
        name: 'sex',
        values: {
          male: {value: 'male'},
          female: {value: 'female'},
        }
      })
    },
    birthday: {type: GraphQLFloat},
    country: {type: GraphQLString},
    street: {type: GraphQLString},
    city: {type: GraphQLString},
    memberTypeId: {type: GraphQLString},
    userId: {type: new GraphQLNonNull(GraphQLString)}
  }
});
const memberTypeType = new GraphQLObjectType({
  name: 'memberType',
  fields: {
    id: {type: new GraphQLNonNull(GraphQLString)},
    discount: {type: GraphQLFloat},
    monthPostsLimit: {type: GraphQLInt},
  }
});

const queryType = new GraphQLObjectType({
  name: 'RootScheme',
  fields: {
    users: {
      type: new GraphQLList(userType),
      resolve: (): UserEntity[] => [{
        id: '1234',
        firstName: '1stName',
        lastName: 'lastName',
        email: 'someEmail',
        subscribedToUserIds: ['2', '3', '4']
      }]
    },
    profiles: {
      type: new GraphQLList(profilesType),
      resolve: (): ProfileEntity[] => [{
        id: '1',
        avatar: 'http://some_avatar',
        sex: 'male',
        birthday: 15,
        country: 'Belarus',
        city: 'Minsk',
        street: 'Lenina',
        memberTypeId: '1',
        userId: '1234',
      }]
    },
    posts: {
      type: new GraphQLList(postType),
      resolve: (): PostEntity[] => [{
        id: '2',
        title: 'some title',
        content: 'some content',
        userId: '1234'
      }]
    },
    memberTypes: {
      type: new GraphQLList(memberTypeType),
      resolve: (): MemberTypeEntity[] => [{
        id: '1234',
        discount: 15.3,
        monthPostsLimit: 5
      }]
    },
  }
});
/*const mutationType = new GraphQLObjectType({
  name: 'mutation',
  fields: {}
});*/

const schema = new GraphQLSchema({
  query: queryType
})

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      return graphql({
        schema,
        source: request.body.query ?? '',
      })
    }
  );
};

export default plugin;
