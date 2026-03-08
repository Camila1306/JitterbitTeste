function validateExternalOrderPayload(payload, options = {}) {
  const { allowPartial = false } = options;
  const errors = [];

  if (!payload || typeof payload !== "object") {
    return ["Body deve ser um JSON valido."];
  }

  if (!allowPartial || payload.numeroPedido !== undefined) {
    if (typeof payload.numeroPedido !== "string" || !payload.numeroPedido.trim()) {
      errors.push("campo 'numeroPedido' deve ser uma string nao vazia.");
    }
  }

  if (!allowPartial || payload.valorTotal !== undefined) {
    if (typeof payload.valorTotal !== "number" || payload.valorTotal <= 0) {
      errors.push("campo 'valorTotal' deve ser um numero maior que zero.");
    }
  }

  if (!allowPartial || payload.dataCriacao !== undefined) {
    const date = new Date(payload.dataCriacao);
    if (!(typeof payload.dataCriacao === "string" && !Number.isNaN(date.getTime()))) {
      errors.push("campo 'dataCriacao' deve ser uma data ISO valida.");
    }
  }

  if (!allowPartial || payload.items !== undefined) {
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      errors.push("campo 'items' deve ser uma lista com pelo menos um item.");
    } else {
      payload.items.forEach((item, index) => {
        if (!item || typeof item !== "object") {
          errors.push(`items[${index}] deve ser um objeto.`);
          return;
        }
        if (!String(item.idItem || "").trim()) {
          errors.push(`items[${index}].idItem deve ser informado.`);
        }
        if (typeof item.quantidadeItem !== "number" || item.quantidadeItem <= 0) {
          errors.push(`items[${index}].quantidadeItem deve ser um numero maior que zero.`);
        }
        if (typeof item.valorItem !== "number" || item.valorItem < 0) {
          errors.push(`items[${index}].valorItem deve ser um numero maior ou igual a zero.`);
        }
      });
    }
  }

  return errors;
}

module.exports = { validateExternalOrderPayload };