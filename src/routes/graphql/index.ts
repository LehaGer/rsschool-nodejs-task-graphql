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
      const postType = new GraphQLObjectType({
        name: 'post',
        fields: {
          id: {type: new GraphQLNonNull(GraphQLString)},
          title: {type: new GraphQLNonNull(GraphQLString)},
          content: {type: GraphQLString},
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
      const userType = new GraphQLObjectType({
        name: 'User',
        fields: () => {

          const userSubscribedType = new GraphQLObjectType({
            name: 'userSubscribed',
            fields: () => {

              const userSubscribedSubscribedType = new GraphQLObjectType({
                name: 'userSubscribedSubscribed',
                fields: {
                  id: {type: new GraphQLNonNull(GraphQLString)},
                  firstName: {type: GraphQLString},
                  lastName: {type: GraphQLString},
                  email: {type: GraphQLString},
                  subscribedToUserIds: {type: new GraphQLList(GraphQLString)},
                  profiles: {
                    type: new GraphQLList(profilesType),
                    resolve: (user): Promise<ProfileEntity[]> => fastify.db.profiles.findMany({
                      key: 'userId',
                      equals: user.id
                    })
                  },
                  posts: {
                    type: new GraphQLList(postType),
                    resolve: (user): Promise<PostEntity[]> => fastify.db.posts.findMany({
                      key: 'userId',
                      equals: user.id
                    })
                  },
                  memberTypes: {
                    type: new GraphQLList(memberTypeType),
                    resolve: async (user): Promise<MemberTypeEntity[]> => {
                      const profiles: ProfileEntity[] = await fastify.db.profiles.findMany({
                        key: 'userId',
                        equals: user.id
                      });
                      const memberTypeIds = profiles.map(profile => profile.memberTypeId);
                      return fastify.db.memberTypes.findMany({
                        key: 'id',
                        equalsAnyOf: memberTypeIds
                      })
                    }
                  },
                }
              })

              return {
                id: {type: new GraphQLNonNull(GraphQLString)},
                firstName: {type: GraphQLString},
                lastName: {type: GraphQLString},
                email: {type: GraphQLString},
                subscribedToUserIds: {type: new GraphQLList(GraphQLString)},
                profiles: {
                  type: new GraphQLList(profilesType),
                  resolve: (user): Promise<ProfileEntity[]> => fastify.db.profiles.findMany({
                    key: 'userId',
                    equals: user.id
                  })
                },
                posts: {
                  type: new GraphQLList(postType),
                  resolve: (user): Promise<PostEntity[]> => fastify.db.posts.findMany({
                    key: 'userId',
                    equals: user.id
                  })
                },
                memberTypes: {
                  type: new GraphQLList(memberTypeType),
                  resolve: async (user): Promise<MemberTypeEntity[]> => {
                    const profiles: ProfileEntity[] = await fastify.db.profiles.findMany({
                      key: 'userId',
                      equals: user.id
                    });
                    const memberTypeIds = profiles.map(profile => profile.memberTypeId);
                    return fastify.db.memberTypes.findMany({
                      key: 'id',
                      equalsAnyOf: memberTypeIds
                    })
                  }
                },
                userSubscribedTo: {
                  type: new GraphQLList(userSubscribedSubscribedType),
                  resolve: async (user): Promise<UserEntity[]> => {
                    return fastify.db.users.findMany({
                      key: 'subscribedToUserIds',
                      inArray: user.id
                    })
                  }
                },
                subscribedToUser: {
                  type: new GraphQLList(userSubscribedSubscribedType),
                  resolve: async (user): Promise<UserEntity[]> => {
                    return fastify.db.users.findMany({
                      key: 'id',
                      equalsAnyOf: user.subscribedToUserIds
                    })
                  }
                }
              }}
          })

          return {
            id: {type: new GraphQLNonNull(GraphQLString)},
            firstName: {type: GraphQLString},
            lastName: {type: GraphQLString},
            email: {type: GraphQLString},
            subscribedToUserIds: {type: new GraphQLList(GraphQLString)},
            profiles: {
              type: new GraphQLList(profilesType),
              resolve: (user): Promise<ProfileEntity[]> => fastify.db.profiles.findMany({
                key: 'userId',
                equals: user.id
              })
            },
            posts: {
              type: new GraphQLList(postType),
              resolve: (user): Promise<PostEntity[]> => fastify.db.posts.findMany({
                key: 'userId',
                equals: user.id
              })
            },
            memberTypes: {
              type: new GraphQLList(memberTypeType),
              resolve: async (user): Promise<MemberTypeEntity[]> => {
                const profiles: ProfileEntity[] = await fastify.db.profiles.findMany({
                  key: 'userId',
                  equals: user.id
                });
                const memberTypeIds = profiles.map(profile => profile.memberTypeId);
                return fastify.db.memberTypes.findMany({
                  key: 'id',
                  equalsAnyOf: memberTypeIds
                })
              }
            },
            userSubscribedTo: {
              type: new GraphQLList(userSubscribedType),
              resolve: async (user): Promise<UserEntity[]> => {
                return fastify.db.users.findMany({
                  key: 'subscribedToUserIds',
                  inArray: user.id
                })
              }
            },
            subscribedToUser: {
              type: new GraphQLList(userSubscribedType),
              resolve: async (user): Promise<UserEntity[]> => {
                return fastify.db.users.findMany({
                  key: 'id',
                  equalsAnyOf: user.subscribedToUserIds
                })
              }
            }
          }
        }
      });

      const queryType = new GraphQLObjectType({
        name: 'RootScheme',
        fields: {
          users: {
            type: new GraphQLList(userType),
            resolve: async (): Promise<UserEntity[]> => fastify.db.users.findMany(),
          },
          profiles: {
            type: new GraphQLList(profilesType),
            resolve: async (): Promise<ProfileEntity[]> => fastify.db.profiles.findMany()
          },
          posts: {
            type: new GraphQLList(postType),
            resolve: async (): Promise<PostEntity[]> => fastify.db.posts.findMany()
          },
          memberTypes: {
            type: new GraphQLList(memberTypeType),
            resolve: async (): Promise<MemberTypeEntity[]> => fastify.db.memberTypes.findMany()
          },
          user: {
            type: userType,
            args: {
              id: {type: GraphQLString}
            },
            resolve: async (_, {id}): Promise<UserEntity|null> => fastify.db.users.findOne({
              key: 'id',
              equals: id
            })
          },
          profile: {
            type: profilesType,
            args: {
              id: {type: GraphQLString}
            },
            resolve: async (_, {id}): Promise<ProfileEntity | null> => fastify.db.profiles.findOne({
              key: 'id',
              equals: id
            })
          },
          post: {
            type: postType,
            args: {
              id: {type: GraphQLString}
            },
            resolve: async (_, {id}): Promise<PostEntity | null> => fastify.db.posts.findOne({
              key: 'id',
              equals: id
            })
          },
          memberType: {
            type: memberTypeType,
            args: {
              id: {type: GraphQLString}
            },
            resolve: async (_, {id}): Promise<MemberTypeEntity | null> => fastify.db.memberTypes.findOne({
              key: 'id',
              equals: id
            })
          },
        }
      });
      const mutationType = new GraphQLObjectType({
        name: 'RootSchemeMutation',
        fields: {
          createUser: {
            type: userType,
            args: {
              firstName: {type: GraphQLString},
              lastName: {type: GraphQLString},
              email: {type: GraphQLString},
            },
            resolve: async (_, {firstName, lastName, email}): Promise<UserEntity | null> => {
              return fastify.db.users.create({
                firstName,
                lastName,
                email,
              })
            }
          },
          createProfile: {
            type: profilesType,
            args: {
              avatar: {type: GraphQLString},
              sex: {type: GraphQLString},
              birthday: {type: GraphQLFloat},
              country: {type: GraphQLString},
              street: {type: GraphQLString},
              city: {type: GraphQLString},
              memberTypeId: {type: GraphQLString},
              userId: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve: async (_, {avatar, sex, birthday, country, street, city, memberTypeId, userId}): Promise<ProfileEntity | null> => {
              return fastify.db.profiles.create({
                avatar,
                sex,
                birthday,
                country,
                street,
                city,
                memberTypeId,
                userId
              })
            }
          },
          createPost: {
            type: postType,
            args: {
              title: {type: new GraphQLNonNull(GraphQLString)},
              content: {type: GraphQLString},
              userId: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve: async (_, {title, content, userId}): Promise<PostEntity | null> => {
              return fastify.db.posts.create({
                title,
                content,
                userId,
              })
            }
          },
        }
      });

      const schema = new GraphQLSchema({
        query: queryType,
        mutation: mutationType
      })

      return graphql({
        schema,
        source: request.body.query ?? '',
        variableValues: request.body.variables
      })
    }
  );
};

export default plugin;
