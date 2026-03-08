const { pool } = require("../config/db");
const { mapInternalToResponse } = require("../utils/mappers");

async function getItemsByOrderId(client, orderId) {
  const result = await client.query(
    "SELECT orderId, productId, quantity, price FROM \"Items\" WHERE orderId = $1 ORDER BY productId",
    [orderId]
  );
  return result.rows;
}

async function getOrderById(orderId) {
  const client = await pool.connect();
  try {
    const orderResult = await client.query(
      "SELECT orderId, value, creationDate FROM \"Order\" WHERE orderId = $1",
      [orderId]
    );

    if (orderResult.rowCount === 0) {
      return null;
    }

    const items = await getItemsByOrderId(client, orderId);
    return mapInternalToResponse(orderResult.rows[0], items);
  } finally {
    client.release();
  }
}

async function listOrders() {
  const client = await pool.connect();
  try {
    const orderResult = await client.query(
      "SELECT orderId, value, creationDate FROM \"Order\" ORDER BY creationDate DESC"
    );

    const responses = [];
    for (const row of orderResult.rows) {
      const items = await getItemsByOrderId(client, row.orderid);
      responses.push(mapInternalToResponse(row, items));
    }

    return responses;
  } finally {
    client.release();
  }
}

async function createOrder(mappedOrder) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      "INSERT INTO \"Order\" (orderId, value, creationDate) VALUES ($1, $2, $3)",
      [mappedOrder.orderId, mappedOrder.value, mappedOrder.creationDate]
    );

    for (const item of mappedOrder.items || []) {
      await client.query(
        "INSERT INTO \"Items\" (orderId, productId, quantity, price) VALUES ($1, $2, $3, $4)",
        [mappedOrder.orderId, item.productId, item.quantity, item.price]
      );
    }

    await client.query("COMMIT");
    return getOrderById(mappedOrder.orderId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function updateOrder(orderId, mappedOrder) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const currentOrderResult = await client.query(
      "SELECT orderId, value, creationDate FROM \"Order\" WHERE orderId = $1",
      [orderId]
    );

    if (currentOrderResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const current = currentOrderResult.rows[0];
    const nextValue = mappedOrder.value ?? Number(current.value);
    const nextCreationDate = mappedOrder.creationDate ?? current.creationdate;

    await client.query(
      "UPDATE \"Order\" SET value = $1, creationDate = $2 WHERE orderId = $3",
      [nextValue, nextCreationDate, orderId]
    );

    if (Array.isArray(mappedOrder.items)) {
      await client.query("DELETE FROM \"Items\" WHERE orderId = $1", [orderId]);

      for (const item of mappedOrder.items) {
        await client.query(
          "INSERT INTO \"Items\" (orderId, productId, quantity, price) VALUES ($1, $2, $3, $4)",
          [orderId, item.productId, item.quantity, item.price]
        );
      }
    }

    await client.query("COMMIT");
    return getOrderById(orderId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function deleteOrder(orderId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const orderResult = await client.query("SELECT orderId FROM \"Order\" WHERE orderId = $1", [orderId]);
    if (orderResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return false;
    }

    await client.query("DELETE FROM \"Items\" WHERE orderId = $1", [orderId]);
    await client.query("DELETE FROM \"Order\" WHERE orderId = $1", [orderId]);

    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  createOrder,
  getOrderById,
  listOrders,
  updateOrder,
  deleteOrder
};