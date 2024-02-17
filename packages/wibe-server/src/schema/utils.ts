import {
    GraphQLBoolean,
    GraphQLEnumType,
    GraphQLFloat,
    GraphQLID,
    GraphQLInputObjectType,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLScalarType,
    GraphQLString,
    GraphQLType,
} from 'graphql'
import {
    ClassInterface,
    SchemaFields,
    TypeField,
    WibeDefaultTypes,
    WibeTypes,
} from './Schema'
import {
    AnyWhereInput,
    ArrayWhereInput,
    BooleanWhereInput,
    DateScalarType,
    DateWhereInput,
    EmailScalarType,
    EmailWhereInput,
    FloatWhereInput,
    IntWhereInput,
    StringWhereInput,
} from '../graphql'

type WibeDefaultTypesWithoutObject = Exclude<WibeDefaultTypes, 'Object'>

type WibeDefaultTypesWithoutArrayAndObject = Exclude<
    WibeDefaultTypesWithoutObject,
    'Array'
>

export const templateScalarType: Record<
    WibeDefaultTypesWithoutArrayAndObject,
    GraphQLScalarType
> = {
    String: GraphQLString,
    Int: GraphQLInt,
    Float: GraphQLFloat,
    Boolean: GraphQLBoolean,
    Date: DateScalarType,
    Email: EmailScalarType,
}

export const templateWhereInput: Record<
    Exclude<WibeDefaultTypes, 'Object'>,
    GraphQLInputObjectType
> = {
    String: StringWhereInput,
    Int: IntWhereInput,
    Float: FloatWhereInput,
    Boolean: BooleanWhereInput,
    Date: DateWhereInput,
    Email: EmailWhereInput,
    Array: ArrayWhereInput,
}

export const wrapGraphQLTypeIn = ({
    required,
    type,
}: {
    required: boolean
    type: GraphQLType
}) => (required ? new GraphQLNonNull(type) : type)

// For the moment we not support array of array (for sql database it's tricky)
// Don't export this function
const getGraphqlTypeFromTemplate = ({ field }: { field: TypeField }) => {
    if (field.type === 'Array') {
        if (!field.typeValue) throw new Error('Type value not found')
        if (field.typeValue === 'Array')
            throw new Error('Array of array are not supported')

        // We can cast because we exclude scalars and enums before in getGraphqlType
        return new GraphQLList(
            templateScalarType[
                field.typeValue as WibeDefaultTypesWithoutArrayAndObject
            ],
        )
    }

    // We can cast because we exclude scalars and enums before in getGraphqlType
    return templateScalarType[
        field.type as WibeDefaultTypesWithoutArrayAndObject
    ]
}

export const getGraphqlType = ({
    scalars,
    enums,
    field,
}: {
    field: TypeField
    scalars: GraphQLScalarType[]
    enums: GraphQLEnumType[]
}) => {
    const scalarExist = scalars.find((scalar) => scalar.name === field.type)
    if (scalarExist) return scalarExist

    const enumExist = enums.find((e) => e.name === field.type)
    if (enumExist) return enumExist

    const graphqlType = getGraphqlTypeFromTemplate({ field })

    if (!graphqlType) throw new Error(`${field.type} not exist in schema`)

    return graphqlType
}

export const getWhereInputFromType = ({
    wibeType,
    scalars,
    enums,
}: {
    wibeType: WibeTypes
    scalars: GraphQLScalarType[]
    enums: GraphQLEnumType[]
}) => {
    if (!Object.keys(templateWhereInput).includes(wibeType)) {
        const scalarExist = scalars.find((scalar) => scalar.name === wibeType)
        if (scalarExist) return scalarExist

        const enumExist = enums.find((e) => e.name === wibeType)

        if (!scalarExist && !enumExist)
            throw new Error(`${wibeType} not exist in schema`)

        return AnyWhereInput
    }

    return templateWhereInput[wibeType as WibeDefaultTypesWithoutObject]
}

// TODO : Refactor this function an getDefaultInputType because the code is the same except for required
export const getUpdateInputType = ({
    fields,
    fieldsOfObjectKeys,
    objects,
    scalars,
    enums,
    className,
}: {
    className: string
    fieldsOfObjectKeys: string[]
    fields: SchemaFields
    objects: GraphQLObjectType[]
    scalars: GraphQLScalarType[]
    enums: GraphQLEnumType[]
}) => {
    const defaultInputType = new GraphQLInputObjectType({
        name: `${className}UpdateFieldsInput`,
        fields: () => {
            return fieldsOfObjectKeys.reduce(
                (acc, fieldName) => {
                    const currentField = fields[fieldName]

                    if (currentField.type === 'Object') {
                        acc[fieldName] = {
                            type: wrapGraphQLTypeIn({
                                required: false,
                                type: getUpdateInputType({
                                    fields: currentField.object.fields,
                                    fieldsOfObjectKeys: Object.keys(
                                        currentField.object.fields,
                                    ),
                                    objects,
                                    scalars,
                                    enums,
                                    className: currentField.object.name,
                                }),
                            }),
                        }

                        return acc
                    }

                    acc[fieldName] = {
                        type: wrapGraphQLTypeIn({
                            required: false,
                            type: getGraphqlType({
                                field: currentField,
                                scalars,
                                enums,
                            }),
                        }),
                    }

                    return acc
                },
                {} as Record<string, any>,
            )
        },
    })

    return defaultInputType
}

export const getDefaultInputType = ({
    fields,
    fieldsOfObjectKeys,
    objects,
    scalars,
    enums,
    className,
}: {
    className: string
    fieldsOfObjectKeys: string[]
    fields: SchemaFields
    objects: GraphQLObjectType[]
    scalars: GraphQLScalarType[]
    enums: GraphQLEnumType[]
}) => {
    const defaultInputType = new GraphQLInputObjectType({
        name: `${className}Input`,
        fields: () => {
            return fieldsOfObjectKeys.reduce(
                (acc, fieldName) => {
                    const currentField = fields[fieldName]

                    if (currentField.type === 'Object') {
                        acc[fieldName] = {
                            type: wrapGraphQLTypeIn({
                                required: !!currentField.required,
                                type: getDefaultInputType({
                                    fields: currentField.object.fields,
                                    fieldsOfObjectKeys: Object.keys(
                                        currentField.object.fields,
                                    ),
                                    objects,
                                    scalars,
                                    enums,
                                    className: currentField.object.name,
                                }),
                            }),
                        }

                        return acc
                    }

                    acc[fieldName] = {
                        type: wrapGraphQLTypeIn({
                            required: !!currentField.required,
                            type: getGraphqlType({
                                field: currentField,
                                scalars,
                                enums,
                            }),
                        }),
                    }

                    return acc
                },
                {} as Record<string, any>,
            )
        },
    })

    return defaultInputType
}

export const getWhereInputType = ({
    fields,
    fieldsOfObjectKeys,
    objects,
    scalars,
    enums,
    className,
}: {
    className: string
    fieldsOfObjectKeys: string[]
    fields: SchemaFields
    objects: GraphQLObjectType[]
    scalars: GraphQLScalarType[]
    enums: GraphQLEnumType[]
}) => {
    const whereInputType = new GraphQLInputObjectType({
        name: `${className}WhereInput`,
        fields: () => {
            const whereInputObject = fieldsOfObjectKeys.reduce(
                (acc, fieldName) => {
                    const currentField = fields[fieldName]
                    const typeOfObject = currentField.type

                    if (currentField.type === 'Object') {
                        acc[fieldName] = {
                            type: getWhereInputType({
                                fields: currentField.object.fields,
                                fieldsOfObjectKeys: Object.keys(
                                    currentField.object.fields,
                                ),
                                objects,
                                scalars,
                                enums,
                                className: currentField.object.name,
                            }),
                        }

                        return acc
                    }

                    acc[fieldName] = {
                        type: getWhereInputFromType({
                            wibeType: typeOfObject,
                            scalars,
                            enums,
                        }),
                    }

                    return acc
                },
                {} as Record<string, any>,
            )

            const conditionFields: Record<string, any> = {
                OR: {
                    type: new GraphQLList(whereInputType),
                },
                AND: {
                    type: new GraphQLList(whereInputType),
                },
            }

            return {
                ...whereInputObject,
                ...conditionFields,
            } as Record<string, any>
        },
    })

    return whereInputType
}

export const getConnectionType = ({
    allObjects,
    object,
}: {
    allObjects: GraphQLObjectType[]
    object: GraphQLObjectType
}) => {
    // We search in all object the corresponding output object
    const connection = allObjects.find(
        (o) => o.name === `${object.name}Connection`,
    )
    if (!connection)
        throw new Error(`Connection type not found for ${object.name}`)

    return connection
}

export const parseWibeObject = ({
    wibeObject: { required, description, object },
}: {
    wibeObject: {
        required?: boolean
        description?: string
        object: ClassInterface
    }
}) => {
    const fields = object.fields

    const graphqlFields = Object.keys(fields).reduce(
        (acc, key) => {
            const currentField = fields[key]

            if (currentField.type === 'Object') {
                acc[key] = {
                    type: parseWibeObject({
                        wibeObject: {
                            required: currentField.required,
                            description: currentField.description,
                            // @ts-expect-error
                            object: currentField.object,
                        },
                    }),
                }

                return acc
            }

            const graphqlType = getGraphqlType({
                field: currentField,
                scalars: [],
                enums: [],
            })

            acc[key] = {
                type: currentField.required
                    ? new GraphQLNonNull(graphqlType)
                    : graphqlType,
            }

            return acc
        },
        {} as Record<string, any>,
    )

    const graphqlObject = new GraphQLObjectType({
        name: object.name,
        description: description,
        fields: () => ({
            ...graphqlFields,
        }),
    })

    return required ? new GraphQLNonNull(graphqlObject) : graphqlObject
}

export const getGraphqlObjectFromWibeObject = ({
    object,
    scalars,
    enums,
}: {
    object: Record<string, TypeField>
    scalars: GraphQLScalarType[]
    enums: GraphQLEnumType[]
}) => {
    const keysOfObject = Object.keys(object)

    const res = keysOfObject.reduce(
        (acc, key) => {
            const currentField = object[key]

            if (currentField.type === 'Object') {
                acc[key] = parseWibeObject({ wibeObject: currentField })

                return acc
            }

            const graphqlType = getGraphqlType({
                field: currentField,
                scalars,
                enums,
            })

            acc[key] = {
                type: currentField.required
                    ? new GraphQLNonNull(graphqlType)
                    : graphqlType,
            }

            return acc
        },
        {} as Record<string, any>,
    )

    return res
}
