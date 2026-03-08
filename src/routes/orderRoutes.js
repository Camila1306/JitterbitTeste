const express = require("express");
const {
  createOrder,
  getOrderById,
  listOrders,
  updateOrder,
  deleteOrder
} = require("../services/orderService");
const { mapExternalToInternal } = require("../utils/mappers");
const { validateExternalOrderPayload } = require("../utils/validators");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

router.use(authMiddleware);

router.post("/", async (req, res) => {
  try {
    const errors = validateExternalOrderPayload(req.body, { allowPartial: false });
    if (errors.length) {
      return res.status(400).json({ errors });
    }

    const mapped = mapExternalToInternal(req.body);
    const created = await createOrder(mapped);
    return res.status(201).json(created);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Pedido ja existe para este orderId." });
    }
    return res.status(500).json({ error: "Erro ao criar pedido.", detail: error.message });
  }
});

router.get("/list", async (req, res) => {
  try {
    const orders = await listOrders();
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar pedidos.", detail: error.message });
  }
});

router.get("/:orderId", async (req, res) => {
  try {
    const order = await getOrderById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: "Pedido nao encontrado." });
    }

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao consultar pedido.", detail: error.message });
  }
});

router.put("/:orderId", async (req, res) => {
  try {
    const errors = validateExternalOrderPayload(req.body, { allowPartial: true });
    if (errors.length) {
      return res.status(400).json({ errors });
    }

    const mapped = mapExternalToInternal(req.body);
    const updated = await updateOrder(req.params.orderId, mapped);

    if (!updated) {
      return res.status(404).json({ error: "Pedido nao encontrado." });
    }

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao atualizar pedido.", detail: error.message });
  }
});

router.delete("/:orderId", async (req, res) => {
  try {
    const deleted = await deleteOrder(req.params.orderId);
    if (!deleted) {
      return res.status(404).json({ error: "Pedido nao encontrado." });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao deletar pedido.", detail: error.message });
  }
});

module.exports = router;
