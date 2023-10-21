/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */







declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
  DeleteUserInput: { // input type
    id: string; // ID!
  }
  DeleteUsersInput: { // input type
    age?: NexusGenInputs['WhereDeleteAgeInput'] | null; // WhereDeleteAgeInput
    name?: NexusGenInputs['WhereDeleteNameInput'] | null; // WhereDeleteNameInput
  }
  UpdateUserInput: { // input type
    fields?: NexusGenInputs['UserInput'] | null; // UserInput
    id: string; // ID!
  }
  UpdateUsersInput: { // input type
    age?: NexusGenInputs['WhereUpdateAgeInput'] | null; // WhereUpdateAgeInput
    name?: NexusGenInputs['WhereUpdateNameInput'] | null; // WhereUpdateNameInput
  }
  UserInput: { // input type
    age?: number | null; // Int
    name?: string | null; // String
  }
  WhereDeleteAgeInput: { // input type
    equalTo?: number | null; // Int
    greaterThan?: number | null; // Int
    greaterThanOrEqualTo?: number | null; // Int
    lessThan?: number | null; // Int
    lessThanOrEqualTo?: number | null; // Int
    notEqualTo?: number | null; // Int
  }
  WhereDeleteNameInput: { // input type
    equalTo?: string | null; // String
    notEqualTo?: string | null; // String
  }
  WhereUpdateAgeInput: { // input type
    equalTo?: number | null; // Int
    greaterThan?: number | null; // Int
    greaterThanOrEqualTo?: number | null; // Int
    lessThan?: number | null; // Int
    lessThanOrEqualTo?: number | null; // Int
    notEqualTo?: number | null; // Int
  }
  WhereUpdateNameInput: { // input type
    equalTo?: string | null; // String
    notEqualTo?: string | null; // String
  }
}

export interface NexusGenEnums {
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
}

export interface NexusGenObjects {
  Mutation: {};
  Query: {};
  User: { // root type
    age?: number | null; // Int
    name?: string | null; // String
  }
}

export interface NexusGenInterfaces {
}

export interface NexusGenUnions {
}

export type NexusGenRootTypes = NexusGenObjects

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars

export interface NexusGenFieldTypes {
  Mutation: { // field return type
    createUser: NexusGenRootTypes['User'] | null; // User
    createUsers: Array<NexusGenRootTypes['User'] | null> | null; // [User]
    deleteUser: NexusGenRootTypes['User'] | null; // User
    deleteUsers: Array<NexusGenRootTypes['User'] | null> | null; // [User]
    updateUser: NexusGenRootTypes['User'] | null; // User
    updateUsers: Array<NexusGenRootTypes['User'] | null> | null; // [User]
  }
  Query: { // field return type
    user: NexusGenRootTypes['User'] | null; // User
    users: Array<NexusGenRootTypes['User'] | null> | null; // [User]
  }
  User: { // field return type
    age: number | null; // Int
    name: string | null; // String
  }
}

export interface NexusGenFieldTypeNames {
  Mutation: { // field return type name
    createUser: 'User'
    createUsers: 'User'
    deleteUser: 'User'
    deleteUsers: 'User'
    updateUser: 'User'
    updateUsers: 'User'
  }
  Query: { // field return type name
    user: 'User'
    users: 'User'
  }
  User: { // field return type name
    age: 'Int'
    name: 'String'
  }
}

export interface NexusGenArgTypes {
  Mutation: {
    createUser: { // args
      input?: NexusGenInputs['UserInput'] | null; // UserInput
    }
    createUsers: { // args
      input?: NexusGenInputs['UserInput'] | null; // UserInput
    }
    deleteUser: { // args
      input?: NexusGenInputs['DeleteUserInput'] | null; // DeleteUserInput
    }
    deleteUsers: { // args
      where?: NexusGenInputs['DeleteUsersInput'] | null; // DeleteUsersInput
    }
    updateUser: { // args
      input?: NexusGenInputs['UpdateUserInput'] | null; // UpdateUserInput
    }
    updateUsers: { // args
      where?: NexusGenInputs['UpdateUsersInput'] | null; // UpdateUsersInput
    }
  }
  Query: {
    user: { // args
      id: string; // String!
    }
  }
}

export interface NexusGenAbstractTypeMembers {
}

export interface NexusGenTypeInterfaces {
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = keyof NexusGenInputs;

export type NexusGenEnumNames = never;

export type NexusGenInterfaceNames = never;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = never;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never;

export type NexusGenAbstractsUsingStrategyResolveType = never;

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: false
    resolveType: true
    __typename: false
  }
}

export interface NexusGenTypes {
  context: any;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  inputTypeShapes: NexusGenInputs & NexusGenEnums & NexusGenScalars;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  fieldTypeNames: NexusGenFieldTypeNames;
  allTypes: NexusGenAllTypes;
  typeInterfaces: NexusGenTypeInterfaces;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractTypeMembers: NexusGenAbstractTypeMembers;
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf;
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType;
  features: NexusGenFeaturesConfig;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginInputTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginInputFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
  interface NexusGenPluginArgConfig {
  }
}