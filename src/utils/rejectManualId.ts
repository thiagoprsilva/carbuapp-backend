export function hasManualId(payload: unknown): boolean {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return false;
  }

  return Object.prototype.hasOwnProperty.call(payload, "id");
}

export function rejectManualIdErrorMessage(resource: string) {
  return `Nao envie 'id' manualmente ao criar ou atualizar ${resource}. O backend gera esse campo automaticamente.`;
}
