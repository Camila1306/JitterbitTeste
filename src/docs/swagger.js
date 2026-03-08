const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Orders API",
      version: "1.0.0",
      description: "API para gerenciamento de pedidos"
    },
    servers: [
      {
        url: "http://localhost:3000"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        LoginInput: {
          type: "object",
          properties: {
            username: { type: "string", example: "admin" },
            password: { type: "string", example: "admin123" }
          },
          required: ["username", "password"]
        },
        LoginResponse: {
          type: "object",
          properties: {
            token: {
              type: "string",
              example:
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.exemplo.assinatura"
            }
          }
        },
        ExternalOrderInput: {
          type: "object",
          properties: {
            numeroPedido: { type: "string", example: "v10089015vdb-01" },
            valorTotal: { type: "number", example: 10000 },
            dataCriacao: { type: "string", format: "date-time" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  idItem: { type: "string", example: "2434" },
                  quantidadeItem: { type: "number", example: 1 },
                  valorItem: { type: "number", example: 1000 }
                }
              }
            }
          },
          required: ["numeroPedido", "valorTotal", "dataCriacao", "items"]
        },
        ExternalOrderUpdateInput: {
          type: "object",
          description: "Payload parcial para atualizacao de pedido",
          properties: {
            valorTotal: { type: "number", example: 12000 },
            dataCriacao: { type: "string", format: "date-time", example: "2023-07-20T10:00:00.000Z" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  idItem: { type: "string", example: "2434" },
                  quantidadeItem: { type: "number", example: 2 },
                  valorItem: { type: "number", example: 1500 }
                },
                required: ["idItem", "quantidadeItem", "valorItem"]
              }
            }
          }
        },
        InternalOrderResponse: {
          type: "object",
          properties: {
            orderId: { type: "string", example: "v10089015vdb" },
            value: { type: "number", example: 10000 },
            creationDate: { type: "string", format: "date-time" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  productId: { type: "number", example: 2434 },
                  quantity: { type: "number", example: 1 },
                  price: { type: "number", example: 1000 }
                }
              }
            }
          }
        },
        ErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string", example: "Pedido nao encontrado." },
            detail: { type: "string", example: "database connection failed" }
          }
        },
        ValidationErrorResponse: {
          type: "object",
          properties: {
            errors: {
              type: "array",
              items: { type: "string" },
              example: [
                "campo 'numeroPedido' deve ser uma string nao vazia.",
                "campo 'items' deve ser uma lista com pelo menos um item."
              ]
            }
          }
        }
      }
    },
    paths: {
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Gerar token JWT",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginInput" },
                example: {
                  username: "admin",
                  password: "admin123"
                }
              }
            }
          },
          responses: {
            200: {
              description: "Token gerado",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/LoginResponse" }
                }
              }
            },
            401: {
              description: "Credenciais invalidas",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { error: "Credenciais invalidas." }
                }
              }
            }
          }
        }
      },
      "/order": {
        post: {
          tags: ["Order"],
          summary: "Criar pedido",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ExternalOrderInput" },
                example: {
                  numeroPedido: "v10089015vdb-01",
                  valorTotal: 10000,
                  dataCriacao: "2023-07-19T12:24:11.5299601+00:00",
                  items: [{ idItem: "2434", quantidadeItem: 1, valorItem: 1000 }]
                }
              }
            }
          },
          responses: {
            201: {
              description: "Pedido criado",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/InternalOrderResponse" }
                }
              }
            },
            400: {
              description: "Payload invalido",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ValidationErrorResponse" }
                }
              }
            },
            409: {
              description: "Pedido ja existe",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { error: "Pedido ja existe para este orderId." }
                }
              }
            },
            500: {
              description: "Erro interno",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        }
      },
      "/order/list": {
        get: {
          tags: ["Order"],
          summary: "Listar pedidos",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Lista de pedidos",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/InternalOrderResponse" }
                  }
                }
              }
            },
            500: {
              description: "Erro interno",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        }
      },
      "/order/{orderId}": {
        get: {
          tags: ["Order"],
          summary: "Consultar pedido por orderId",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "orderId",
              required: true,
              schema: { type: "string" },
              example: "v10089015vdb"
            }
          ],
          responses: {
            200: {
              description: "Pedido encontrado",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/InternalOrderResponse" }
                }
              }
            },
            404: {
              description: "Pedido nao encontrado",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { error: "Pedido nao encontrado." }
                }
              }
            },
            500: {
              description: "Erro interno",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        },
        put: {
          tags: ["Order"],
          summary: "Atualizar pedido",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "orderId",
              required: true,
              schema: { type: "string" },
              example: "v10089015vdb"
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ExternalOrderUpdateInput" },
                example: {
                  valorTotal: 12000,
                  dataCriacao: "2023-07-20T10:00:00.000Z",
                  items: [{ idItem: "2434", quantidadeItem: 2, valorItem: 1500 }]
                }
              }
            }
          },
          responses: {
            200: {
              description: "Pedido atualizado",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/InternalOrderResponse" }
                }
              }
            },
            400: {
              description: "Payload invalido",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ValidationErrorResponse" }
                }
              }
            },
            404: {
              description: "Pedido nao encontrado",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { error: "Pedido nao encontrado." }
                }
              }
            },
            500: {
              description: "Erro interno",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        },
        delete: {
          tags: ["Order"],
          summary: "Deletar pedido",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "orderId",
              required: true,
              schema: { type: "string" },
              example: "v10089015vdb"
            }
          ],
          responses: {
            204: { description: "Pedido removido" },
            404: {
              description: "Pedido nao encontrado",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { error: "Pedido nao encontrado." }
                }
              }
            },
            500: {
              description: "Erro interno",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: []
};

module.exports = swaggerJSDoc(options);
