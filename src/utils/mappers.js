function normalizeOrderId(numeroPedido) {
  if (typeof numeroPedido !== "string") {
    return null;
  }

  const trimmed = numeroPedido.trim();
  if (!trimmed) {
    return null;
  }

  // Remove sufixos comuns de parcela/lote, por exemplo: "-01".
  return trimmed.split("-")[0];
}

function mapExternalToInternal(externalOrder) {
  const mappedItems = Array.isArray(externalOrder.items)
    ? externalOrder.items.map((item) => ({
        productId: Number(item.idItem),
        quantity: Number(item.quantidadeItem),
        price: Number(item.valorItem)
      }))
    : undefined;

  const mapped = {};

  if (externalOrder.numeroPedido !== undefined) {
    mapped.orderId = normalizeOrderId(externalOrder.numeroPedido);
  }
  if (externalOrder.valorTotal !== undefined) {
    mapped.value = Number(externalOrder.valorTotal);
  }
  if (externalOrder.dataCriacao !== undefined) {
    mapped.creationDate = new Date(externalOrder.dataCriacao).toISOString();
  }
  if (mappedItems !== undefined) {
    mapped.items = mappedItems;
  }

  return mapped;
}

function mapInternalToResponse(order, items) {
  return {
    orderId: order.orderid,
    value: Number(order.value),
    creationDate: new Date(order.creationdate).toISOString(),
    items: (items || []).map((item) => ({
      productId: Number(item.productid),
      quantity: Number(item.quantity),
      price: Number(item.price)
    }))
  };
}

module.exports = {
  normalizeOrderId,
  mapExternalToInternal,
  mapInternalToResponse
};
