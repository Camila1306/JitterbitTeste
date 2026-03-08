# Orders API (Node.js + PostgreSQL)

API REST para criar, consultar, listar, atualizar e deletar pedidos.

## Tecnologias

- Node.js
- Express
- PostgreSQL (`pg`)
- JWT (autenticacao opcional)
- Swagger (`/docs`)

## Estrutura

- `project.js`: ponto de entrada
- `src/app.js`: configuracao da aplicacao
- `src/routes/orderRoutes.js`: endpoints de pedidos
- `src/routes/authRoutes.js`: login JWT
- `src/services/orderService.js`: regra de negocio e queries
- `src/utils/mappers.js`: transformacao dos campos
- `src/utils/validators.js`: validacao de payload
- `sql/schema.sql`: criacao das tabelas

## Endpoints

- `POST http://localhost:3000/order`
- `GET http://localhost:3000/order/:orderId`
- `GET http://localhost:3000/order/list`
- `PUT http://localhost:3000/order/:orderId`
- `DELETE http://localhost:3000/order/:orderId`

## Mapping implementado

Entrada (body da API):

```json
{
  "numeroPedido": "v10089015vdb-01",
  "valorTotal": 10000,
  "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
  "items": [
    {
      "idItem": "2434",
      "quantidadeItem": 1,
      "valorItem": 1000
    }
  ]
}
```

Saida/salvamento interno:

```json
{
  "orderId": "v10089015vdb",
  "value": 10000,
  "creationDate": "2023-07-19T12:24:11.529Z",
  "items": [
    {
      "productId": 2434,
      "quantity": 1,
      "price": 1000
    }
  ]
}
```

Regra aplicada para `orderId`: remove sufixo apos `-` em `numeroPedido`.

## Banco de dados

Crie o banco e execute o schema:

```sql
CREATE DATABASE orders_db;
```

Depois rode o conteudo de `sql/schema.sql` no banco `orders_db`.

Tabelas criadas:

- `"Order"(orderId, value, creationDate)`
- `"Items"(orderId, productId, quantity, price)`

## Configuracao

1. Instale dependencias:

```bash
npm install
```

2. Crie `.env` a partir de `.env.example`.

3. Ajuste os dados do PostgreSQL no `.env`.

4. Suba a API:

```bash
npm start
```

API em: `http://localhost:3000`
Swagger em: `http://localhost:3000/docs`

## Autenticacao JWT (extra)

- Por padrao, `AUTH_REQUIRED=false` (nao exige token)
- Para exigir token, defina `AUTH_REQUIRED=true` no `.env`

Login:

```bash
curl --location 'http://localhost:3000/auth/login' \
--header 'Content-Type: application/json' \
--data '{
  "username": "admin",
  "password": "admin123"
}'
```

Use o token no header:

```text
Authorization: Bearer <token>
```

## Exemplo de criacao

```bash
curl --location 'http://localhost:3000/order' \
--header 'Content-Type: application/json' \
--data '{
  "numeroPedido": "v10089015vdb-01",
  "valorTotal": 10000,
  "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
  "items": [
    {
      "idItem": "2434",
      "quantidadeItem": 1,
      "valorItem": 1000
    }
  ]
}'
```
